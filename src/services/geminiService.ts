import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { collection, query, where, getDocs, doc, getDoc, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Tour, Inventory } from '../types';

const API_KEY = process.env.GEMINI_API_KEY?.trim();

export interface GeneratedTour {
  title: string;
  description: string;
  duration: string;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary: {
    day: number;
    title: string;
    description: string;
  }[];
  importantInfo?: string;
}

export interface GeneratedBlogPost {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
}

export interface GeneratedItinerary {
  planTitle: string;
  summary: string;
  dailyPlans: {
    day: number;
    title: string;
    activities: {
      time: string;
      title: string;
      description: string;
      type: 'activity' | 'hotel' | 'meal' | 'transport';
    }[];
    accommodationRecommendation: {
      name: string;
      reason: string;
      estimatedPrice: string;
    };
  }[];
  recommendedTours: {
    tourId: string;
    title: string;
    reason: string;
    slug: string;
  }[];
  estimatedTotalBudget: {
    amount: string;
    breakdown: string;
  };
  travelTips: string[];
}

export interface ExtractedBooking {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  tourTitle: string;
  date: string; // YYYY-MM-DD
  time?: string;
  adults: number;
  children: number;
  totalAmount: number;
  currency: string;
  packageName?: string;
  specialRequirements?: string;
  bookingReference?: string;
  source: 'Klook' | 'Viator' | 'GetYourGuide' | 'Booking.com' | 'Direct' | string;
}

export async function extractBookingFromEmail(emailText: string, apiKey?: string): Promise<ExtractedBooking> {
  const finalKey = apiKey || API_KEY;
  
  if (!finalKey) {
    throw new Error("Gemini API Key is not configured. Please set it in Settings.");
  }

  const ai = new GoogleGenAI({ apiKey: finalKey });
  
  const response = await ai.models.generateContent({ 
    model: "gemini-3-flash-preview",
    contents: `EXTRACT BOOKING DATA FROM THE FOLLOWING EMAIL TEXT.
    
    EMAIL TEXT:
    """
    ${emailText}
    """
    
    INSTRUCTIONS:
    - Identify the customer name, email, and phone.
    - Identify the tour title / activity name.
    - Identify the booking date (format: YYYY-MM-DD). Use today's year if not specified but the month/day is.
    - Identify the number of adults and children.
    - Identify the total amount paid and currency.
    - Identify the booking platform (Klook, Viator, GetYourGuide, etc.).
    - If any field is missing, leave it as null or 0.
    
    Output MUST be valid JSON matching the schema provided.`,
    config: {
      systemInstruction: `You are a specialized booking data extractor for Bali Adventours. 
      You handle emails from Klook, Viator, GetYourGuide, and other OTAs.
      Extract every detail accurately. If a phone number is present with a country code, preserve the full number.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          customerName: { type: Type.STRING },
          customerEmail: { type: Type.STRING },
          customerPhone: { type: Type.STRING },
          tourTitle: { type: Type.STRING },
          date: { type: Type.STRING, description: "Format: YYYY-MM-DD" },
          time: { type: Type.STRING },
          adults: { type: Type.NUMBER },
          children: { type: Type.NUMBER },
          totalAmount: { type: Type.NUMBER },
          currency: { type: Type.STRING },
          packageName: { type: Type.STRING },
          specialRequirements: { type: Type.STRING },
          bookingReference: { type: Type.STRING },
          source: { type: Type.STRING, description: "The platform name (e.g., Klook, Viator)" }
        },
        required: ["customerName", "tourTitle", "date", "adults", "totalAmount", "source"]
      }
    }
  });

  let text = response.text || "";
  if (text.includes("```json")) {
    text = text.split("```json")[1].split("```")[0].trim();
  } else if (text.includes("```")) {
    text = text.split("```")[1].split("```")[0].trim();
  }

  if (!text) throw new Error("No response received from AI");

  try {
    return JSON.parse(text) as ExtractedBooking;
  } catch (e) {
    console.error("Failed to parse AI response:", text);
    throw new Error("AI returned invalid data format. Please try again.");
  }
}

export async function generateTourData(prompt: string, apiKey?: string): Promise<GeneratedTour> {
  const finalKey = apiKey || API_KEY;
  
  if (!finalKey) {
    throw new Error("Gemini API Key is not configured. Please set it in Settings.");
  }

  const ai = new GoogleGenAI({ apiKey: finalKey });
  
  const response = await ai.models.generateContent({ 
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: `You are a professional travel tour designer for a luxury tour company in Bali called "Bali Adventours".
Your task is to take a rough prompt or itinerary list and transform it into a highly detailed, professional tour description.

VOICE & STYLE:
- Avoid "corporate" or overly polished "marketing" speak.
- Use a storytelling, authentic, and conversational tone, as if a local friend is explaining the experience.
- Focus on the sensory details—the sounds, sights, and feelings—of the experience.
- Keep the language inviting and warm, not just a list of facts.

ITINERARY RULES:
- The first item in the itinerary MUST ALWAYS be "Pick up from the hotel" with a professional description of the meeting and transport.
- The last item in the itinerary MUST ALWAYS be "Back to hotel" with a description of the return journey and drop-off.
- Ensure the middle items flow logically like a real day's adventure.

The output MUST be in valid JSON format according to the schema provided.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Catchy and professional tour title" },
          description: { type: Type.STRING, description: "Detailed and engaging tour description" },
          duration: { type: Type.STRING, description: "Estimated duration e.g. '8 Hours' or 'Full Day'" },
          highlights: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Top 4-6 key features or highlights of the tour"
          },
          inclusions: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "What's included (e.g. Private transport, Entrance fees, Mineral water)"
          },
          exclusions: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "What's NOT included (e.g. Personal expenses, Tips, Lunch)"
          },
          itinerary: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.NUMBER },
                title: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["day", "title", "description"]
            },
            description: "Chronological list of activities"
          },
          importantInfo: { type: Type.STRING, description: "Brief important notes for the traveler" }
        },
        required: ["title", "description", "duration", "highlights", "inclusions", "exclusions", "itinerary"]
      }
    }
  });
  
  let text = response.text || "";
  
  // Robust JSON extraction
  if (text.includes("```json")) {
    text = text.split("```json")[1].split("```")[0].trim();
  } else if (text.includes("```")) {
    text = text.split("```")[1].split("```")[0].trim();
  }

  if (!text) {
    throw new Error("No response received from AI");
  }

  try {
    return JSON.parse(text) as GeneratedTour;
  } catch (e) {
    console.error("Failed to parse AI response:", text);
    throw new Error("AI returned invalid data format. Please try again.");
  }
}

export async function generateBlogPostData(prompt: string, apiKey?: string): Promise<GeneratedBlogPost> {
  const finalKey = apiKey || API_KEY;
  
  if (!finalKey) {
    throw new Error("Gemini API Key is not configured. Please set it in Settings.");
  }

  const ai = new GoogleGenAI({ apiKey: finalKey });

  const response = await ai.models.generateContent({ 
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: `You are a professional travel blogger and SEO expert writing for "Bali Adventours".
Your task is to write high-quality, engaging, and SEO-optimized blog posts about Bali and travel.

VOICE & STYLE:
- Use an inspiring, adventurous, yet helpful tone.
- Write in English but feel free to use local Balinese/Indonesian terms with brief explanations where appropriate (e.g., "Canang Sari").
- The content should be informative, providing real value to travelers (tips, hidden gems, cultural etiquette).
- Use proper HTML formatting inside the 'content' field (h2, h3, p, ul, li) for readability.
- The content should be at least 600-800 words long.

The output MUST be in valid JSON format including title, excerpt, full HTML content, category, and tags.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Captivating SEO-friendly blog title" },
          excerpt: { type: Type.STRING, description: "A short, intriguing 2-sentence summary to encourage clicks" },
          content: { type: Type.STRING, description: "Full blog post content with HTML tags (h2, h3, p, ul, li)" },
          category: { type: Type.STRING, description: "Best matching category (e.g., Adventure, Culture, Food, Guide, News)" },
          tags: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "4-6 relevant SEO tags"
          }
        },
        required: ["title", "excerpt", "content", "category", "tags"]
      }
    }
  });

  let text = response.text || "";
  
  // Robust JSON extraction
  if (text.includes("```json")) {
    text = text.split("```json")[1].split("```")[0].trim();
  } else if (text.includes("```")) {
    text = text.split("```")[1].split("```")[0].trim();
  }

  if (!text) {
    throw new Error("No response received from AI");
  }

  try {
    return JSON.parse(text) as GeneratedBlogPost;
  } catch (e) {
    console.error("Failed to parse AI response:", text);
    throw new Error("AI returned invalid data format. Please try again.");
  }
}

export async function generateItinerary(userData: any, apiKey?: string): Promise<GeneratedItinerary> {
  const finalKey = apiKey || API_KEY;
  
  if (!finalKey) {
    throw new Error("Gemini API Key is not configured. Please set it in Settings.");
  }

  // Fetch some active tours to provide context to the AI
  const toursQuery = query(collection(db, 'tours'), where('status', '==', 'active'), limit(20));
  const toursSnap = await getDocs(toursQuery);
  const availableTours = toursSnap.docs.map(doc => ({
    id: doc.id,
    title: doc.data().title,
    slug: doc.data().slug,
    category: doc.data().category,
    highlights: doc.data().highlights?.join(', ') || ''
  }));

  const ai = new GoogleGenAI({ apiKey: finalKey });
  
  const prompt = `
    Create a detailed Bali travel itinerary for:
    Name: ${userData.name}
    From: ${userData.from}
    Dates/Trip Timing: ${userData.tripTiming}
    Duration: ${userData.duration} Days
    Travelers: ${userData.persons} Persons
    Interests: ${userData.interests}
    Preferred Places: ${userData.places}
    Food Preferences: ${userData.food}
    Must-visit Spots: ${userData.hotspots}
    Experience Type: ${userData.experience}
    Hotel Preference: ${userData.hotelType}
    Budget Range: ${userData.budget}

    Context - Available Tours from Bali Adventours:
    ${JSON.stringify(availableTours)}

    Please design a realistic, high-quality, and personalized itinerary from airport pickup to airport drop-off.
    Recommend specific hotels that match their preference.
    Match their interests with our existing tours listed above where appropriate.
    Provide a day-by-day breakdown with various activity types (activity, hotel, meal, transport).
  `;

  const response = await ai.models.generateContent({ 
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: `You are "Didi", the expert AI Travel Planner for Bali Adventours. 
      Your goal is to create a dream Bali vacation plan that feels authentic, luxurious, and perfectly tailored.
      
      RULES:
      1. Use a warm, professional, yet adventurous tone.
      2. Ensure the flow of the trip makes geographical sense (e.g., don't jump from South Bali to North Bali twice in one day).
      3. Recommend our actual tours (from the provided list) where they fit the user's interests.
      4. Include estimated budgets in the local currency (IDR) or USD if more appropriate for the user's origin.
      5. The output MUST be valid JSON.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          planTitle: { type: Type.STRING },
          summary: { type: Type.STRING },
          dailyPlans: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.NUMBER },
                title: { type: Type.STRING },
                activities: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      time: { type: Type.STRING },
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      type: { type: Type.STRING, enum: ['activity', 'hotel', 'meal', 'transport'] }
                    },
                    required: ["time", "title", "description", "type"]
                  }
                },
                accommodationRecommendation: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    estimatedPrice: { type: Type.STRING }
                  },
                  required: ["name", "reason"]
                }
              },
              required: ["day", "title", "activities", "accommodationRecommendation"]
            }
          },
          recommendedTours: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                tourId: { type: Type.STRING },
                title: { type: Type.STRING },
                reason: { type: Type.STRING },
                slug: { type: Type.STRING }
              }
            }
          },
          estimatedTotalBudget: {
            type: Type.OBJECT,
            properties: {
              amount: { type: Type.STRING },
              breakdown: { type: Type.STRING }
            }
          },
          travelTips: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["planTitle", "summary", "dailyPlans", "recommendedTours", "estimatedTotalBudget", "travelTips"]
      }
    }
  });

  let text = response.text || "";
  if (text.includes("```json")) {
    text = text.split("```json")[1].split("```")[0].trim();
  } else if (text.includes("```")) {
    text = text.split("```")[1].split("```")[0].trim();
  }

  if (!text) throw new Error("No response received from AI");

  try {
    return JSON.parse(text) as GeneratedItinerary;
  } catch (e) {
    console.error("Failed to parse AI response:", text);
    throw new Error("AI returned invalid data format. Please try again.");
  }
}

// Tool Definitions for Live Data Access
const tools = [
  {
    functionDeclarations: [
      {
        name: "search_tours",
        description: "Search for tours by keyword or category. Use this to find tours the user might be interested in.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            searchTerm: {
              type: Type.STRING,
              description: "The term to search for (e.g. 'volcano', 'beach', 'ubud')",
            },
          },
          required: ["searchTerm"],
        },
      } as FunctionDeclaration,
      {
        name: "get_tour_details",
        description: "Get full details for a specific tour including price, description, multiple packages with tiered pricing (prices that change based on number of participants), components, and direct link.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            tourId: {
              type: Type.STRING,
              description: "The ID of the tour to fetch details for.",
            },
          },
          required: ["tourId"],
        },
      } as FunctionDeclaration,
      {
        name: "check_availability",
        description: "Check if a tour is available on a specific date.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            tourId: {
              type: Type.STRING,
              description: "The ID of the tour.",
            },
            date: {
              type: Type.STRING,
              description: "The date in YYYY-MM-DD format.",
            },
          },
          required: ["tourId", "date"],
        },
      } as FunctionDeclaration,
      {
        name: "check_booking_status",
        description: "Check the current status and details of a tour booking.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            bookingId: {
              type: Type.STRING,
              description: "The unique booking reference ID (e.g. #ABC12345).",
            },
            email: {
              type: Type.STRING,
              description: "The email address used for the booking.",
            },
          },
          required: ["bookingId", "email"],
        },
      } as FunctionDeclaration,
    ],
  },
];

// Implementation of Tool Functions using Firestore
const toolImplementations = {
  search_tours: async ({ searchTerm }: { searchTerm: string }) => {
    const q = query(
      collection(db, 'tours'), 
      where('status', '==', 'active'),
      limit(10)
    );
    const snap = await getDocs(q);
    const all = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Tour[];
    
    // Simple filter since Firestore doesn't support complex full-text search without 3rd party
    const filtered = all.filter(t => 
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return filtered.map(t => ({
      id: t.id,
      title: t.title,
      price: t.regularPrice,
      duration: t.duration,
      slug: t.slug
    }));
  },
  get_tour_details: async ({ tourId }: { tourId: string }) => {
    const docRef = doc(db, 'tours', tourId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return { error: "Tour not found" };
    
    const t = { id: snap.id, ...snap.data() } as Tour;
    return {
      id: t.id,
      title: t.title,
      description: t.description,
      price: t.regularPrice,
      packages: t.packages?.map(p => ({
        name: p.name,
        tiers: p.tiers
      })),
      bookingLink: `/tours/${t.slug}`,
      highlights: t.highlights,
      itinerary: t.itinerary?.map(i => ({ day: i.day, title: i.title }))
    };
  },
  check_availability: async ({ tourId, date }: { tourId: string, date: string }) => {
    const inventoryId = `${tourId}_${date}_daily`;
    const invRef = doc(db, 'inventory', inventoryId);
    const invSnap = await getDoc(invRef);
    
    if (invSnap.exists()) {
      const data = invSnap.data() as Inventory;
      const left = data.maxCapacity - data.bookedCount;
      return {
        available: left > 0,
        remainingSlots: left,
        maxCapacity: data.maxCapacity
      };
    }
    
    const tourRef = doc(db, 'tours', tourId);
    const tourSnap = await getDoc(tourRef);
    if (!tourSnap.exists()) return { error: "Tour not found" };
    
    const tour = tourSnap.data() as Tour;
    return {
      available: true,
      message: "Likely available, please check selection on tour page.",
      maxCapacity: tour.maxCapacity || 20
    };
  },
  check_booking_status: async ({ bookingId, email }: { bookingId: string, email: string }) => {
    // Remove '#' if present and trim
    const cleanId = bookingId.replace(/^#/, '').trim();
    const docRef = doc(db, 'bookings', cleanId);
    const snap = await getDoc(docRef);
    
    if (!snap.exists()) {
      return { error: "Booking not found with this ID. Please double check your booking reference." };
    }
    
    const b = snap.data() as any;
    if (b.customerData.email.toLowerCase() !== email.toLowerCase()) {
      return { error: "The provided email does not match the record for this booking ID." };
    }
    
    return {
      id: snap.id,
      status: b.status,
      tourTitle: b.tourTitle,
      date: b.date,
      totalAmount: b.totalAmount,
      customerName: b.customerData.fullName,
      paymentStatus: b.paymentStatus || 'pending'
    };
  }
};

export async function getChatResponse(
  messages: { role: 'user' | 'model'; parts: string }[], 
  context: { tours: any[] },
  apiKey?: string
): Promise<string> {
  const finalKey = apiKey || API_KEY;
  
  if (!finalKey) {
    throw new Error("Gemini API Key is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey: finalKey });
  
  const systemInstruction = `You are Didi, a friendly and helpful local assistant for "Bali Adventours".
Your goal is to help customers find the perfect tour, answer questions about Bali, and provide info about our adventures.

CAPABILITIES:
- You can SEARCH for tours in our live database.
- You can GET LIVE DETAILS (price, description, packages, and tiered pricing) for any specific tour.
- You can SUGGEST THE PRICE LIST: If a customer wants to see all prices at once or compare multiple tours, you can suggest they visit the "/price-list" page for a complete directory.
- You can EXPLAIN TIERED PRICING: Most tours have different prices depending on how many people are booking. For example, the "Price per Person" usually gets CHEAPER if they book for more people (e.g. price for 4-5 people is lower than for 1-2 people). ALWAYS check the 'packages' and 'tiers' data from get_tour_details to give accurate prices.
- You can CHECK AVAILABILITY for a specific date using our booking database.
- You can CHECK BOOKING STATUS for existing bookings. You MUST ask for both Booking ID and the email address used.

CONVENTIONS:
- Be warm, welcoming, and use Indonesian/Balinese hospitality (e.g., "Selamat Datang!", "Halo!").
- Keep responses concise. Use double line breaks between paragraphs for better readability.
- ALWAYS provide the direct booking link when a user is interested in a specific tour. The link MUST be a clickable Markdown link using the format: [Tour Name](${window.location.origin}/tours/[slug])
- If you find tours, describe why they match the user's request.
- If a user wants to check booking status, ask for their Booking ID and Email if they haven't provided them already.
- Use English as your primary language for communication.

CONTEXT:
Current Domain: ${window.location.origin}`;

  const history = messages.slice(0, -1).map(m => ({
    role: m.role,
    parts: [{ text: m.parts }]
  }));

  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    history,
    config: {
      systemInstruction,
      tools: [
        {
          functionDeclarations: tools[0].functionDeclarations,
        },
      ],
    }
  });

  let result = await chat.sendMessage({ message: messages[messages.length - 1].parts });
  
  const handleFunctionCalls = async (response: any): Promise<any> => {
    const functionCalls = response.functionCalls;
    
    if (functionCalls && functionCalls.length > 0) {
      const functionResponses = await Promise.all(
        functionCalls.map(async (call: any) => {
          const name = call.name as keyof typeof toolImplementations;
          const args = call.args;
          try {
            const toolResult = await toolImplementations[name](args as any);
            return {
              functionResponse: {
                name,
                response: { result: toolResult }
              }
            };
          } catch (error) {
            return {
              functionResponse: {
                name,
                response: { error: "Failed to fetch live data." }
              }
            };
          }
        })
      );
      
      const nextResult = await chat.sendMessage({ message: functionResponses });
      return handleFunctionCalls(nextResult);
    }
    
    return response;
  };

  const finalResponse = await handleFunctionCalls(result);
  return finalResponse.text || "I'm sorry, I couldn't quite get that. Could you try rephrasing?";
}
