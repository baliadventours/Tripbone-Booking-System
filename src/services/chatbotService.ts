import { GoogleGenAI, Type } from "@google/genai";
import { db } from "../lib/firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  limit, 
  doc, 
  getDoc 
} from "firebase/firestore";

let genAI: any = null;

export const chatbotTools = [
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
      },
      {
        name: "get_tour_details",
        description: "Get full details for a specific tour including price, description, multiple packages with tiered pricing, and direct link.",
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
      },
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
      },
    ],
  },
];

const getToolImplementations = () => {
  return {
    search_tours: async ({ searchTerm }: { searchTerm: string }) => {
      const q = query(
        collection(db, 'tours'),
        where('status', '==', 'active'),
        limit(10)
      );
      const snap = await getDocs(q);
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() as any }));
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
      const snap = await getDoc(doc(db, 'tours', tourId));
      if (!snap.exists()) return { error: "Tour not found" };
      
      const t = { id: snap.id, ...snap.data() as any };
      return {
        id: t.id,
        title: t.title,
        description: t.description,
        price: t.regularPrice,
        packages: t.packages?.map((p: any) => ({
          name: p.name,
          tiers: p.tiers
        })),
        bookingLink: `/tours/${t.slug}`,
        highlights: t.highlights,
        itinerary: t.itinerary?.map((i: any) => ({ day: i.day, title: i.title }))
      };
    },
    check_booking_status: async ({ bookingId, email }: { bookingId: string, email: string }) => {
      const cleanId = bookingId.replace(/^#/, '').trim();
      // NOTE: This will fail if firestore.rules restrict read to owner.
      // For this audit, we'll keep it as a limitation or suggest rule update.
      try {
        const snap = await getDoc(doc(db, 'bookings', cleanId));
        
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
      } catch (e) {
        return { error: "I cannot access this booking. Please chat with us on WhatsApp for assistance." };
      }
    }
  };
};

export async function handleChatbotRequest(messages: any[], origin: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

  if (!genAI) genAI = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `You are Didi, a friendly local assistant for "Bali Adventours".
Your goal is to help customers find tours, explain tiered pricing, and provide info about Bali.

CONVENTIONS:
- Be warm, welcoming ("Selamat Datang!", "Halo!").
- Keep responses concise. Use double line breaks.
- Provide direct booking links: [Tour Title](${origin}/tours/[slug])
- If stuck, offer WhatsApp: [Chat on WhatsApp](https://wa.me/6281246502939)`;

  const history = messages.slice(0, -1).map(m => ({
    role: m.role,
    parts: [{ text: m.parts }]
  }));

  const chat = genAI.chats.create({
    model: "gemini-3-flash-preview",
    history,
    config: {
      systemInstruction,
      tools: chatbotTools,
    }
  });

  const lastMessage = messages[messages.length - 1];
  let result = await chat.sendMessage({ message: lastMessage.parts });
  
  const handleFunctionCalls = async (response: any): Promise<any> => {
    const functionCalls = response.functionCalls;
    const toolImplementations = getToolImplementations();

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
  return { text: finalResponse.text || "I'm sorry, I couldn't quite get that." };
}
