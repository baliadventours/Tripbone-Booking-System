import { useState, useEffect, lazy, Suspense } from "react";
import { db } from "../lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
  limit,
} from "firebase/firestore";
import { Tour, Category, Review, BlogPost } from "../types";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Leaf,
  Play,
  Sparkles,
  Clock,
  Globe,
  Zap,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import TourCard from "../components/TourCard";
import { useSettings } from "../lib/SettingsContext";
import SearchForm from "../components/Home/SearchForm";
import { Helmet } from "react-helmet-async";
import FormattedPrice from "../components/FormattedPrice";
import { cn } from "../lib/utils";

import MobileHomeHeader from "../components/Home/MobileHomeHeader";
import SmartImage from "../components/SmartImage";
import LazySection from "../components/LazySection";

// Lazy load non-critical home sections
const TopRatedTours = lazy(() => import("../components/Home/TopRatedTours"));
const ReviewSlider = lazy(() => import("../components/Home/ReviewSlider"));
const BlogSection = lazy(() => import("../components/Home/BlogSection"));

const CategoryIcon = ({
  iconName,
  className,
}: {
  iconName?: string;
  className: string;
}) => {
  if (!iconName) return <LucideIcons.LayoutGrid className={className} />;

  if (iconName.startsWith("http")) {
    return (
      <img
        src={iconName}
        className={cn("object-contain", className)}
        referrerPolicy="no-referrer"
      />
    );
  }

  const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Compass;
  return <IconComponent className={className} />;
};

const SliderTourCard = ({ tour }: { tour: Tour }) => {
  return (
    <Link
      to={`/tour/${tour.slug || tour.id}`}
      className="block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <SmartImage
          src={
            tour.featuredImage ||
            tour.gallery?.[0] ||
            "https://picsum.photos/seed/placeholder/800/600"
          }
          alt={tour.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          aspectRatio="auto"
          width={400}
          quality={75}
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-black text-gray-900 flex items-center gap-1 shadow-sm">
          <LucideIcons.Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
          <span>{tour.rating ? tour.rating.toFixed(1) : "4.9"}</span>
        </div>
        <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-black text-white uppercase tracking-wider">
          {tour.duration}
        </div>
      </div>

      <div className="p-4 space-y-2 text-left">
        <h4 className="text-base font-black text-gray-900 line-clamp-1 leading-tight group-hover:text-primary transition-colors">
          {tour.title}
        </h4>
        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
          {tour.description}
        </p>
        <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
              Price Starts At
            </span>
            <span className="text-lg font-black text-primary leading-none mt-0.5">
              <FormattedPrice
                amount={tour.discountPrice || tour.regularPrice}
              />
            </span>
          </div>
          <div className="text-[10px] font-black text-primary bg-emerald-50 border border-emerald-100 px-2.5 py-1.5 rounded-lg uppercase tracking-wider">
            View Details
          </div>
        </div>
      </div>
    </Link>
  );
};

import { generateOrganizationSchema } from "../lib/seoUtils";

const DEFAULT_FALLBACK_TOURS: Tour[] = [
  {
    id: "ubud-day-tour-seed",
    slug: "ubud-day-tour",
    title: "Ubud Day Tour: Monkey Forest, Rice Terraces & Waterfall",
    description: "Spend a day getting to know the real Ubud, the place everyone falls in love with.",
    duration: "6-8 Hours",
    regularPrice: 45,
    discountPrice: 35,
    featuredImage: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80",
    gallery: ["https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80"],
    rating: 4.9,
    reviewsCount: 124,
    isPopular: true,
    categoryId: "culture-fallback",
    status: "published",
    highlights: ["Sacred Monkey Forest Sanctuary", "Tegalalang Rice Terraces", "Tegenungan Waterfall"],
    inclusions: ["AC transport", "Driver guide", "Entrance tickets"],
    exclusions: ["Lunch", "Personal expenses"],
    itinerary: [],
    location: "Ubud, Bali",
    locationMapUrl: "",
    languages: ["English", "Indonesian"],
    packages: [],
    faqs: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "mount-batur-trek-seed",
    slug: "mount-batur-sunrise-trek",
    title: "Mount Batur Sunrise Trekking with Natural Hot Spring",
    description: "Hike up to the active volcano Mount Batur to see an incredibly spectacular sunrise over Bali island.",
    duration: "8-10 Hours",
    regularPrice: 65,
    discountPrice: 49,
    featuredImage: "https://images.unsplash.com/photo-1518548419070-2c61b179ad65?auto=format&fit=crop&w=600&q=80",
    gallery: ["https://images.unsplash.com/photo-1518548419070-2c61b179ad65?auto=format&fit=crop&w=600&q=80"],
    rating: 4.8,
    reviewsCount: 96,
    isPopular: true,
    categoryId: "history-fallback",
    status: "published",
    highlights: ["Sunrise view from volcanic peak", "Natural thermal hot spring soak", "Coffee plantation visit"],
    inclusions: ["Hotel pickup/dropoff", "Local trekking guide", "Breakfast at summit", "Hot spring tickets"],
    exclusions: ["Gratuities"],
    itinerary: [],
    location: "Kintamani, Bali",
    locationMapUrl: "",
    languages: ["English", "Indonesian"],
    packages: [],
    faqs: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "nusa-penida-tour-seed",
    slug: "nusa-penida-one-day-tour",
    title: "Nusa Penida One Day Tour with Snorkeling Activities",
    description: "Sail away to exotic Nusa Penida island and visit iconic Kelingking Beach, Broken Beach, and snorkel with mantas.",
    duration: "10-12 Hours",
    regularPrice: 75,
    discountPrice: 59,
    featuredImage: "https://images.unsplash.com/photo-1537953773315-221350741d53?auto=format&fit=crop&w=600&q=80",
    gallery: ["https://images.unsplash.com/photo-1537953773315-221350741d53?auto=format&fit=crop&w=600&q=80"],
    rating: 4.9,
    reviewsCount: 148,
    isPopular: true,
    categoryId: "beach-fallback",
    status: "published",
    highlights: ["Kelingking T-Rex Beach", "Broken Beach / Angel Billabong", "Snorkeling with Manta Rays"],
    inclusions: ["Fast boat ticket return", "Island private transport", "Lunch", "Snorkeling gear and boat"],
    exclusions: ["Retribution fee"],
    itinerary: [],
    location: "Nusa Penida, Bali",
    locationMapUrl: "",
    languages: ["English", "Indonesian"],
    packages: [],
    faqs: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "uluwatu-kecak-seed",
    slug: "uluwatu-temple-sunset-kecak-dance",
    title: "Uluwatu Temple Sunset Tour with Kecak Fire Dance Show",
    description: "Watch the incredible sunset over the Indian Ocean from Uluwatu cliff temple, then watch the legendary Kecak dance.",
    duration: "5-6 Hours",
    regularPrice: 39,
    discountPrice: 29,
    featuredImage: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=600&q=80",
    gallery: ["https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=600&q=80"],
    rating: 4.7,
    reviewsCount: 82,
    isPopular: false,
    categoryId: "culture-fallback",
    status: "published",
    highlights: ["Uluwatu cliff-top temple", "Sunset ocean panorama", "Kecak Fire Dance performance"],
    inclusions: ["AC private car", "Driver guide", "Uluwatu temple tickets", "Kecak dance tickets"],
    exclusions: ["Dinner"],
    itinerary: [],
    location: "Uluwatu, Bali",
    locationMapUrl: "",
    languages: ["English", "Indonesian"],
    packages: [],
    faqs: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const DEFAULT_FALLBACK_REVIEWS: Review[] = [
  {
    id: "review-1",
    userName: "Emma Watson",
    nationality: "United Kingdom",
    rating: 5,
    title: "Absolutely incredible experience!",
    comment: "The Ubud Day Tour was the highlight of our Bali trip. Our guide was incredibly knowledgeable and the rice terraces were stunning.",
    tourTitle: "Ubud Day Tour: Monkey Forest & Rice Terraces",
    tourDate: "May 2026",
    userPhoto: "",
    userId: "user-1",
    status: "approved",
    createdAt: new Date()
  },
  {
    id: "review-2",
    userName: "David Miller",
    nationality: "Australia",
    rating: 5,
    title: "Breathtaking sunrise trekking!",
    comment: "Hiking Mount Batur is tough but 100% worth it. The view at the peak was stunning and the natural hot spring afterwards was perfect.",
    tourTitle: "Mount Batur Sunrise Trekking",
    tourDate: "May 2026",
    userPhoto: "",
    userId: "user-2",
    status: "approved",
    createdAt: new Date()
  }
];

const DEFAULT_FALLBACK_POSTS: BlogPost[] = [
  {
    id: "post-1",
    title: "10 Most Beautiful Places to Visit in Ubud, Bali",
    slug: "beautiful-places-to-visit-in-ubud",
    excerpt: "Ubud is renowned as Bali's cultural heart filled with beautiful rice fields, monkey sanctuaries, stunning waterfalls and palaces.",
    featuredImage: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80",
    category: "Travel Guide",
    tags: ["Ubud", "Bali", "Travel Tips"],
    author: "Bali Admin",
    status: "published",
    content: "Ubud is the spiritual and cultural heart of Bali...",
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "post-2",
    title: "The Ultimate Guide to Hiking Mount Batur for Sunrise",
    slug: "ultimate-mount-batur-sunrise-trek-guide",
    excerpt: "Everything you need to know before trekking Mount Batur's active volcanic peak to catch one of the most stunning sunrises of your life.",
    featuredImage: "https://images.unsplash.com/photo-1518548419070-2c61b179ad65?auto=format&fit=crop&w=600&q=80",
    category: "Adventure Tours",
    tags: ["Mount Batur", "Trekking", "Sunrise"],
    author: "Bali Admin",
    status: "published",
    content: "Hiking Mount Batur is one of Bali’s highly-rated activities...",
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default function Home() {
  const { settings } = useSettings();
  const [tours, setTours] = useState<Tour[]>(() => {
    if (
      typeof window !== "undefined" &&
      (window as any).__PRELOADED_DATA__?.featuredTours
    ) {
      return (window as any).__PRELOADED_DATA__.featuredTours;
    }
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("bali_cached_tours");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return DEFAULT_FALLBACK_TOURS;
  });
  const [loading, setLoading] = useState(() => {
    if (
      typeof window !== "undefined" &&
      (window as any).__PRELOADED_DATA__?.featuredTours
    ) {
      return false;
    }
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("bali_cached_tours");
        if (cached && JSON.parse(cached).length > 0) {
          return false;
        }
      } catch (e) {}
    }
    return true;
  });
  const [selectedMobileCategory, setSelectedMobileCategory] = useState("all");
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [icelandActiveTab, setIcelandActiveTab] = useState<'tours' | 'cars' | 'hotels' | 'flights'>('tours');
  const [icelandKeyword, setIcelandKeyword] = useState('');
  const [icelandStartDate, setIcelandStartDate] = useState('');
  const [icelandEndDate, setIcelandEndDate] = useState('');
  const [icelandGuests, setIcelandGuests] = useState('1 traveler');

  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("bali_cached_categories");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    // Elegant default categories to prevent any skeletons on first-ever load
    return [
      { id: "culture-fallback", name: "Art & Culture", icon: "Compass" },
      { id: "beach-fallback", name: "Beach", icon: "Sun" },
      { id: "food-fallback", name: "Food & Drink", icon: "Tag" },
      { id: "history-fallback", name: "History", icon: "Activity" }
    ] as Category[];
  });
  const [reviews, setReviews] = useState<Review[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("bali_cached_reviews");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return DEFAULT_FALLBACK_REVIEWS;
  });
  const [posts, setPosts] = useState<BlogPost[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("bali_cached_posts");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return DEFAULT_FALLBACK_POSTS;
  });
  const [mobileSearchTerm, setMobileSearchTerm] = useState("");
  const [isAllCategoriesModalOpen, setIsAllCategoriesModalOpen] =
    useState(false);

  const siteUrl = window.location.origin;
  const organizationSchema = generateOrganizationSchema(siteUrl);

  const handleMobileSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileSearchTerm.trim()) return;
    navigate(`/tours?search=${encodeURIComponent(mobileSearchTerm)}`);
  };

  const homeTitle = (
    settings?.homeTitleFormat || "{{siteName}} - Adventure Tours in Bali"
  ).replace("{{siteName}}", settings?.siteName || "Bali Adventours");

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = settings?.heroYoutubeUrl
    ? getYoutubeId(settings.heroYoutubeUrl)
    : null;

  useEffect(() => {
    const q = query(
      collection(db, "tours"),
      where("status", "in", ["published", "active"]),
      orderBy("createdAt", "desc"),
      limit(24),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tourData = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Tour);
      setTours(tourData);
      setLoading(false);
      try {
        localStorage.setItem("bali_cached_tours", JSON.stringify(tourData));
      } catch (e) {}
    });

    const timer = setTimeout(() => {
      setIsVideoLoaded(true);
    }, 1000);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    // 1. Fetch Categories
    const catQuery = query(
      collection(db, "categories"),
      orderBy("name", "asc"),
    );
    const unsubCats = onSnapshot(catQuery, (snapshot) => {
      const catData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Category);
      setCategories(catData);
      try {
        localStorage.setItem("bali_cached_categories", JSON.stringify(catData));
      } catch (e) {}
    });

    // 2. Fetch Reviews (approved)
    const reviewQuery = query(
      collection(db, "reviews"),
      where("status", "==", "approved"),
      orderBy("createdAt", "desc"),
      limit(6),
    );
    const unsubReviews = onSnapshot(reviewQuery, (snapshot) => {
      const reviewData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Review);
      setReviews(reviewData);
      try {
        localStorage.setItem("bali_cached_reviews", JSON.stringify(reviewData));
      } catch (e) {}
    });

    // 3. Fetch Blog Posts (published)
    const postQuery = query(
      collection(db, "posts"),
      where("status", "in", ["published", "active"]),
      orderBy("createdAt", "desc"),
      limit(6),
    );
    const unsubPosts = onSnapshot(postQuery, (snapshot) => {
      const postData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as BlogPost);
      setPosts(postData);
      try {
        localStorage.setItem("bali_cached_posts", JSON.stringify(postData));
      } catch (e) {}
    });

    return () => {
      unsubCats();
      unsubReviews();
      unsubPosts();
    };
  }, []);

  const filteredTours = tours.filter(
    (t) =>
      selectedMobileCategory === "all" ||
      t.categoryId === selectedMobileCategory,
  );

  const getFavoriteTours = () => {
    let favs = tours.filter((t) => (t.rating || 0) >= 4.5);
    if (favs.length === 0) favs = tours;
    return favs.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 6);
  };
  const favoriteTours = getFavoriteTours();

  const showEmptyState = !loading && tours.length === 0;

  // Theme Logic
  const themeMode = settings?.themeMode || "default";
  const heroStyle =
    themeMode === "custom"
      ? settings?.sectionStyles?.hero || "airbnb-classic"
      : "airbnb-classic";
  const featuredToursStyle =
    themeMode === "custom" ? settings?.sectionStyles?.featuredTours : "default";

  const renderHero = () => {
    switch (heroStyle) {
      case "iceland-marketplace": {
        const handleIcelandSearch = (e: React.FormEvent) => {
          e.preventDefault();
          const params = new URLSearchParams();
          if (icelandKeyword.trim()) params.append('search', icelandKeyword.trim());
          if (icelandStartDate) params.append('startDate', icelandStartDate);
          if (icelandEndDate) params.append('endDate', icelandEndDate);
          if (icelandGuests) params.append('guests', icelandGuests);
          navigate(`/tours?${params.toString()}`);
        };

        return (
          <section className="relative min-h-screen flex flex-col justify-center py-24 bg-cover bg-center bg-no-repeat bg-zinc-950" style={{ backgroundImage: `url(${settings?.ogImage || 'https://i.ibb.co.com/pvLCVYkM/ALAS-HARUM8-optimized.webp'})` }}>
            {videoId && isVideoLoaded && (
              <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden hidden md:block">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&modestbranding=1&playlist=${videoId}&iv_load_policy=3&enablejsapi=1`}
                  title="Hero Background Video"
                  className="w-full h-full scale-[1.35] md:scale-[1.5]"
                  allow="autoplay; encrypted-media"
                />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 text-center text-white flex flex-col justify-center items-center space-y-10">
              
              {/* Title & Subtitle */}
              <div className="max-w-4xl space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight drop-shadow-md">
                  Everything you need, all in one place, for your dream Balinese adventure
                </h1>
                <p className="text-base md:text-lg text-gray-200 font-medium max-w-2xl mx-auto drop-shadow-sm">
                  As Bali's largest travel marketplace, we search over fifty local operators to find you the best deals — combined with our bulletproof price guarantee.
                </p>
              </div>

              {/* Laurels / Awards logos */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 text-xs font-black uppercase tracking-wider text-amber-400">
                <div className="flex items-center gap-3 bg-black/35 backdrop-blur-md py-2 px-4 rounded-xl border border-white/10">
                  <LucideIcons.Award className="h-5 w-5 text-amber-400" />
                  <span>Best Price Guarantee</span>
                </div>
                <div className="flex items-center gap-3 bg-black/35 backdrop-blur-md py-2 px-4 rounded-xl border border-white/10">
                  <LucideIcons.Award className="h-5 w-5 text-amber-400" />
                  <span>Bali's Leading Travel Agency</span>
                </div>
              </div>

              {/* Tabbed Search widget */}
              <div className="w-full max-w-4xl bg-white/95 backdrop-blur-lg p-6 rounded-3xl shadow-[0_32px_60px_-15px_rgba(0,0,0,0.5)] text-gray-900 border border-white/25">
                {/* Tabs */}
                <div className="flex items-center border-b border-gray-150 pb-4 mb-5 gap-3 overflow-x-auto no-scrollbar">
                  {(['tours', 'cars', 'hotels', 'flights'] as const).map((tab) => {
                    const isActive = icelandActiveTab === tab;
                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setIcelandActiveTab(tab)}
                        className={cn(
                          "px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest transition-all duration-200 shrink-0",
                          isActive 
                            ? "bg-primary text-white shadow-md shadow-primary/25" 
                            : "bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900"
                        )}
                      >
                        {tab === 'tours' && <span className="flex items-center gap-2"><LucideIcons.Compass className="h-3.5 w-3.5" /> Tours</span>}
                        {tab === 'cars' && <span className="flex items-center gap-2"><LucideIcons.Car className="h-3.5 w-3.5" /> Cars</span>}
                        {tab === 'hotels' && <span className="flex items-center gap-2"><LucideIcons.Building className="h-3.5 w-3.5" /> Hotels</span>}
                        {tab === 'flights' && <span className="flex items-center gap-2"><LucideIcons.Plane className="h-3.5 w-3.5" /> Flights</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Tab Input Panel */}
                <form onSubmit={handleIcelandSearch} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  
                  {/* Experience Selector */}
                  <div className="md:col-span-4 text-left space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 pl-1 tracking-wider">Choose your perfect experience</label>
                    <div className="relative">
                      <LucideIcons.MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder={icelandActiveTab === 'tours' ? 'e.g. Mount Batur, Ubud...' : `e.g. Search ${icelandActiveTab}...`}
                        value={icelandKeyword}
                        onChange={(e) => setIcelandKeyword(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm font-semibold text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  </div>

                  {/* Start Date */}
                  <div className="md:col-span-2.5 text-left space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 pl-1 tracking-wider">Starting date</label>
                    <div className="relative">
                      <LucideIcons.Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      <input 
                        type="date" 
                        value={icelandStartDate}
                        onChange={(e) => setIcelandStartDate(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-3 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  </div>

                  {/* End Date */}
                  <div className="md:col-span-2.5 text-left space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 pl-1 tracking-wider">Final date</label>
                    <div className="relative">
                      <LucideIcons.Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      <input 
                        type="date" 
                        value={icelandEndDate}
                        onChange={(e) => setIcelandEndDate(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-3 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  </div>

                  {/* Travelers Dropdown */}
                  <div className="md:col-span-2 text-left space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 pl-1 tracking-wider">Add travelers</label>
                    <div className="relative">
                      <LucideIcons.Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <select 
                        value={icelandGuests} 
                        onChange={(e) => setIcelandGuests(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-2 py-3 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none"
                      >
                        <option value="1 traveler">1 traveler</option>
                        <option value="2 travelers">2 travelers</option>
                        <option value="3-5 travelers">3-5 travelers</option>
                        <option value="6+ travelers">Group (6+)</option>
                      </select>
                    </div>
                  </div>

                  {/* Search Button */}
                  <div className="md:col-span-1 flex items-end h-full pt-4 md:pt-0">
                    <button 
                      type="submit" 
                      className="w-full bg-[#00A651] hover:brightness-95 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <LucideIcons.Search className="h-4 w-4 stroke-[2.5]" />
                      <span className="md:hidden">Search</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Confidence elements row */}
              <div className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/10 text-white/80">
                <div className="flex items-center justify-center gap-2 text-xs font-bold">
                  <LucideIcons.CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Largest Tour Selection</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs font-bold">
                  <LucideIcons.CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Best Price Guarantee</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs font-bold">
                  <LucideIcons.CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Free Cancellation</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs font-bold">
                  <LucideIcons.CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Verified 4.9★ Reviews</span>
                </div>
              </div>

            </div>
          </section>
        );
      }

      case "troll-adventure": {
        const sliceTours = tours.slice(0, 5);
        return (
          <section className="relative min-h-[95vh] bg-[#f7f9fa] flex flex-col justify-end text-zinc-900 overflow-hidden w-full pt-28 pb-12">
            
            {/* Background Layer: YouTube Video on Desktop, Sliced Accordions on Mobile & fallback */}
            {videoId && isVideoLoaded ? (
              <>
                {/* Mobile: Sliced Accordion Columns */}
                <div className="absolute inset-0 w-full h-full flex flex-row items-stretch select-none pointer-events-auto md:hidden">
                  {sliceTours.map((t, idx) => {
                    const img = t.featuredImage || t.gallery?.[0] || `https://picsum.photos/seed/${t.id}/800/1000`;
                    return (
                      <Link 
                        key={t.id}
                        to={`/tour/${t.slug || t.id}`}
                        className="flex-1 hover:flex-[1.8] group relative overflow-hidden transition-all duration-700 ease-out border-r border-[#f7f9fa]"
                      >
                        <div className="absolute inset-0">
                          <img 
                            src={img} 
                            alt={t.title} 
                            className="w-full h-full object-cover filter brightness-[0.45] group-hover:scale-105 group-hover:brightness-[0.65] transition-all duration-700" 
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-70" />
                        
                        <div className="absolute bottom-16 inset-x-4 flex flex-col items-center group-hover:items-start group-hover:pl-4 transition-all z-20 text-white">
                          <span className="text-[10px] uppercase tracking-widest font-black text-amber-400 bg-black/45 px-2.5 py-1 rounded border border-white/5 whitespace-nowrap mb-2 max-w-min block font-mono">
                            Experience 0{idx+1}
                          </span>
                          <h4 className="text-center group-hover:text-left text-sm md:text-base font-bold leading-tight tracking-tight max-w-[150px] group-hover:max-w-xs transition-all flex items-center gap-2 uppercase font-sans">
                            {t.title}
                          </h4>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                {/* Desktop: Full-bleed YouTube video background */}
                <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden hidden md:block">
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&modestbranding=1&playlist=${videoId}&iv_load_policy=3&enablejsapi=1`}
                    title="Hero Background Video"
                    className="w-full h-full scale-[1.35] md:scale-[1.5]"
                    allow="autoplay; encrypted-media"
                  />
                  <div className="absolute inset-0 bg-black/45" />
                </div>
              </>
            ) : (
              /* Normal Accordion Columns background for all viewports (fallback) */
              <div className="absolute inset-0 w-full h-full flex flex-row items-stretch select-none pointer-events-auto">
                {sliceTours.map((t, idx) => {
                  const img = t.featuredImage || t.gallery?.[0] || `https://picsum.photos/seed/${t.id}/800/1000`;
                  return (
                    <Link 
                      key={t.id}
                      to={`/tour/${t.slug || t.id}`}
                      className="flex-1 hover:flex-[1.8] group relative overflow-hidden transition-all duration-700 ease-out border-r border-[#f7f9fa]"
                    >
                      <div className="absolute inset-0">
                        <img 
                          src={img} 
                          alt={t.title} 
                          className="w-full h-full object-cover filter brightness-[0.45] group-hover:scale-105 group-hover:brightness-[0.65] transition-all duration-700" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-70" />
                      
                      <div className="absolute bottom-16 inset-x-4 flex flex-col items-center group-hover:items-start group-hover:pl-4 transition-all z-20 text-white">
                        <span className="text-[10px] uppercase tracking-widest font-black text-amber-400 bg-black/45 px-2.5 py-1 rounded border border-white/5 whitespace-nowrap mb-2 max-w-min block font-mono">
                          Experience 0{idx+1}
                        </span>
                        <h4 className="text-center group-hover:text-left text-sm md:text-base font-bold leading-tight tracking-tight max-w-[150px] group-hover:max-w-xs transition-all flex items-center gap-2 uppercase font-sans">
                          {t.title}
                        </h4>
                        <p className="hidden group-hover:block text-[11px] text-gray-300 font-bold mt-2 leading-snug line-clamp-2 max-w-xs animate-in fade-in slide-in-from-bottom-2 duration-350">
                          {t.description}
                        </p>
                        <span className="hidden group-hover:inline-flex items-center gap-1.5 text-[10px] text-sky-400 font-black mt-3 uppercase tracking-wider animate-in fade-in slide-in-from-bottom-2 duration-350">
                          View Tour <LucideIcons.ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Float overlay content */}
            <div className="relative z-20 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 text-white pointer-events-none mt-auto">
              
              <div className="lg:col-span-8 flex flex-col justify-end space-y-6 text-left">
                <div className="inline-flex self-start items-center gap-2 bg-[#fbc02d] text-gray-900 py-1.5 px-4 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider shadow-md pointer-events-auto hover:scale-[1.02] transition-transform">
                  <LucideIcons.Trophy className="h-4.5 w-4.5 text-gray-901 fill-gray-900 shrink-0" />
                  <span>Most Rewarded Bali Excursions</span>
                </div>

                <div className="space-y-3">
                  <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight uppercase font-sans drop-shadow-lg">
                    Best of Bali <br />in 3 Days
                  </h1>
                  <h3 className="text-lg md:text-xl font-bold tracking-tight text-gray-200 drop-shadow-md">
                    Classic Highlands + Mount Batur Sunrise Trek + Secret Waterfalls
                  </h3>
                </div>

                <div className="pointer-events-auto pt-2">
                  <Link 
                    to={sliceTours[0] ? `/tour/${sliceTours[0].slug || sliceTours[0].id}` : '/tours'}
                    className="inline-flex items-center gap-3 bg-[#0288d1] hover:bg-[#01579b] text-white py-4 px-10 rounded-full font-black text-xs uppercase tracking-widest shadow-xl shadow-sky-500/10 transition-all hover:scale-105 active:scale-95 group"
                  >
                    <span>Book Your Adventure</span>
                    <LucideIcons.ChevronRight className="h-4.5 w-4.5 group-hover:translate-x-1.5 transition-transform" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-4 pt-10 border-t border-white/10 text-white/90">
                <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 pointer-events-auto hover:backdrop-blur-lg transition-all">
                  <div className="p-2 bg-emerald-500 rounded-xl text-white">
                    <LucideIcons.Award className="h-6 w-6 stroke-[2]" />
                  </div>
                  <div className="text-left">
                    <span className="block text-[10px] font-black uppercase tracking-widest text-emerald-400">Tripadvisor Choice</span>
                    <span className="text-xs font-black">Best of the Best: 2024, 2025, 2026</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 pointer-events-auto hover:backdrop-blur-lg transition-all">
                  <div className="p-2 bg-amber-500 rounded-xl text-white flex items-center select-none font-bold text-xs gap-1">
                    <span>4.9</span>
                    <LucideIcons.Star className="h-3.5 w-3.5 fill-current" />
                  </div>
                  <div className="text-left">
                    <span className="block text-[10px] font-black uppercase tracking-widest text-amber-500 font-mono">Global Score</span>
                    <span className="text-xs font-black">40,000+ Real Reviews Across Platforms</span>
                  </div>
                </div>
              </div>

            </div>
          </section>
        );
      }

      case "airbnb-classic":
      case "airbnb-fluid": {
        const getPhotoTourLink = (keyword: string, fallbackTerm: string) => {
          const found = tours.find((t) =>
            t.title?.toLowerCase().includes(keyword.toLowerCase()),
          );
          if (found) return `/tour/${found.slug || found.id}`;
          return `/tours?search=${encodeURIComponent(fallbackTerm)}`;
        };

        return (
          <section className="relative min-h-screen lg:h-screen flex items-center pt-28 pb-12 bg-zinc-100 text-zinc-900 w-full overflow-hidden">
            <div
              className={cn(
                "w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-16 justify-center",
                heroStyle === "airbnb-fluid"
                  ? "px-4"
                  : "container mx-auto px-4 lg:px-8",
              )}
            >
              {/* Left Side: Title & Integrated Search Form */}
              <div className="w-full lg:w-[45%] flex flex-col justify-center space-y-8 z-10">
                <div>
                  <h1 className="text-5xl md:text-7xl font-extrabold text-zinc-900 leading-[1.05] tracking-tight">
                    Discover <br />
                    <span className="text-primary">Balinese</span> Wonders
                  </h1>
                  <p className="mt-4 text-base text-zinc-600 font-medium leading-relaxed">
                    Curated expeditions and private custom adventures with
                    trusted local hosts. Hand-vetted tours, high-performance
                    transports, and custom timelines tailored around you.
                  </p>
                </div>

                {/* Modern search form embedded directly inside the Hero page flow */}
                <div className="w-full">
                  <SearchForm />
                </div>

                <div className="flex items-center gap-6 text-xs font-bold text-zinc-500">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Local Private Guides
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Flexible Calendars
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Instant Booking
                  </span>
                </div>
              </div>

              {/* Right Side: Redesigned Staggered 3-Photo Masonry Board */}
              <div className="w-full lg:w-[55%] grid grid-cols-2 gap-4 select-none">
                {/* Column 1 - Custom Staggered Column */}
                <div className="space-y-4 pt-4 md:pt-8 flex flex-col justify-center">
                  <Link
                    to={getPhotoTourLink("rice", "tegallalang rice terrace")}
                    className="block relative overflow-hidden rounded-[2rem] group shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer aspect-[3/4]"
                  >
                    <SmartImage
                      src="https://i.ibb.co.com/pvLCVYkM/ALAS-HARUM8-optimized.webp"
                      alt="Exploring Rice Terrace"
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                      aspectRatio="portrait"
                      priority={true}
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 min-h-[40%] flex flex-col justify-end z-[5]">
                      <span className="text-white font-black text-xs md:text-sm">
                        Exploring Rice Terrace
                      </span>
                      <span className="text-emerald-400 font-bold text-[9px] uppercase tracking-wider mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Explore Expedition
                      </span>
                    </div>
                  </Link>
                </div>

                {/* Column 2 */}
                <div className="space-y-4">
                  <Link
                    to={getPhotoTourLink("trekking", "mount batur sunrise trekking")}
                    className="block relative overflow-hidden rounded-[2rem] group shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer aspect-square"
                  >
                    <SmartImage
                      src="https://i.ibb.co.com/HTXHHj6f/DSCF3376-optimized.webp"
                      alt="Best Sunrise Trekking"
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                      aspectRatio="square"
                      priority={true}
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 min-h-[40%] flex flex-col justify-end z-[5]">
                      <span className="text-white font-black text-xs md:text-sm">
                        Best Sunrise Trekking
                      </span>
                      <span className="text-emerald-400 font-bold text-[9px] uppercase tracking-wider mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Explore Expedition
                      </span>
                    </div>
                  </Link>
                  <Link
                    to={getPhotoTourLink("instagram", "bali instagram tour")}
                    className="block relative overflow-hidden rounded-[2rem] group shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer aspect-square"
                  >
                    <SmartImage
                      src="https://i.ibb.co.com/wxj3nPb/DSCF4121-optimized.webp"
                      alt="For Your Instagram Feed"
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                      aspectRatio="square"
                      priority={true}
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 min-h-[40%] flex flex-col justify-end z-[5]">
                      <span className="text-white font-black text-xs md:text-sm">
                        For Your Instagram Feed
                      </span>
                      <span className="text-emerald-400 font-bold text-[9px] uppercase tracking-wider mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Explore Expedition
                      </span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        );
      }

      case "modern-dark":
      case "modern-glass":
        const isGlass = heroStyle === "modern-glass";
        return (
          <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gray-950 px-4 pt-20">
            <div className="absolute top-0 left-0 w-full h-full opacity-30">
              <img
                src="https://i.ibb.co/ksfhmLX0/Ulundanu-Beratan5-optimized.webp"
                className="w-full h-full object-cover filter brightness-50"
                alt="Dark Bali"
              />
            </div>
            {isGlass && (
              <div className="absolute inset-0 backdrop-blur-[5px]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-transparent to-gray-950" />

            <div className="relative z-10 max-w-5xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-400/10 border border-emerald-400/20 rounded-full mb-8">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">
                  Expedition Engine Active
                </span>
              </div>
              <h1 className="text-6xl md:text-[10rem] font-black text-white leading-[0.8] tracking-tighter mb-12 uppercase italic">
                Pure <br />{" "}
                <span className="text-emerald-400 not-italic">Engine</span>
              </h1>
              <p className="text-emerald-100/50 text-xl font-medium max-w-2xl mx-auto mb-16 leading-relaxed">
                High-performance Balinese adventures. Engineered for those who
                demand the absolute peak of exploration.
              </p>
              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <Link
                  to="/tours"
                  className="px-12 py-5 bg-emerald-400 text-gray-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_50px_-10px_rgba(52,211,153,0.5)]"
                >
                  Launch Finder
                </Link>
                <Link
                  to="/planner"
                  className="px-12 py-5 bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10"
                >
                  Neural Planner
                </Link>
              </div>
            </div>
          </section>
        );

      case "minimal-grid":
      case "minimal-type":
        const isType = heroStyle === "minimal-type";
        return (
          <section className="bg-white min-h-[80vh] flex flex-col md:flex-row border-b border-gray-100">
            <div className="flex-1 p-8 md:p-20 flex flex-col justify-center border-r border-gray-100">
              <span className="font-mono text-[10px] uppercase tracking-[0.5em] text-gray-400 mb-8">
                Bali / Indonesia / Vol 01
              </span>
              <h1
                className={cn(
                  "text-7xl md:text-[11rem] font-black tracking-tighter leading-none mb-12 uppercase",
                  isType ? "italic font-serif" : "",
                )}
              >
                Soul <br /> Deep.
              </h1>
              <div className="max-w-md">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest leading-loose mb-16">
                  A curated study of Balinese life. Twelve chapters, twelve
                  locations, one unforgettable narrative.
                </p>
                <Link
                  to="/tours"
                  className="inline-flex items-center gap-12 group"
                >
                  <span className="text-[11px] font-black uppercase tracking-[0.6em]">
                    View Catalog
                  </span>
                  <div className="h-px w-20 bg-gray-900 group-hover:w-40 transition-all" />
                </Link>
              </div>
            </div>
            <div className="flex-1 hidden md:block grayscale hover:grayscale-0 transition-all duration-700">
              <img
                src="https://i.ibb.co/ksfhmLX0/Ulundanu-Beratan5-optimized.webp"
                className="w-full h-full object-cover"
                alt="Minimalist Scene"
              />
            </div>
          </section>
        );

      case "premium-serif":
      case "premium-full":
        const isFull = heroStyle === "premium-full";
        return (
          <section
            className={cn(
              "relative min-h-screen flex items-center justify-center overflow-hidden",
              isFull ? "bg-black" : "bg-[#fdfcfb]",
            )}
          >
            <div className="absolute inset-0 opacity-40">
              <img
                src="https://i.ibb.co/5WcLnbqj/DSCF4293-optimized.webp"
                className="w-full h-full object-cover"
                alt="Luxury Bali"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />

            <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
              <div className="flex items-center justify-center gap-6 mb-12">
                <div className="h-px w-16 bg-amber-400/40" />
                <span className="font-serif italic text-amber-500 text-xl">
                  The Signature Collection
                </span>
                <div className="h-px w-16 bg-amber-400/40" />
              </div>
              <h1 className="text-6xl md:text-9xl font-serif text-white tracking-[0.05em] leading-[0.9] mb-16">
                Elegance <br /> in Motion
              </h1>
              <p className="max-w-xl mx-auto text-white/50 text-xs uppercase tracking-[0.7em] font-light leading-loose mb-20">
                Where high luxury meets the untamed beauty of the Indonesian
                Archipelago.
              </p>
              <div className="flex flex-col md:flex-row items-center justify-center gap-16">
                <Link
                  to="/tours"
                  className="text-white text-[10px] font-black uppercase tracking-[0.5em] hover:text-amber-500 transition-colors border-b border-white/20 pb-2"
                >
                  Destinations
                </Link>
                <Link
                  to="/about"
                  className="text-white text-[10px] font-black uppercase tracking-[0.5em] hover:text-amber-500 transition-colors border-b border-white/20 pb-2"
                >
                  The Philosophy
                </Link>
                <Link
                  to="/contact"
                  className="text-white text-[10px] font-black uppercase tracking-[0.5em] hover:text-amber-500 transition-colors border-b border-white/20 pb-2"
                >
                  Inquiry
                </Link>
              </div>
            </div>
          </section>
        );

      case "saas-clean":
      case "saas-dash":
        return (
          <section className="relative pt-48 pb-32 overflow-hidden bg-[#fafafa]">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="container mx-auto px-4 lg:px-8 relative z-10">
              <div className="flex flex-col lg:flex-row items-center gap-20">
                <div className="lg:w-1/2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-gray-100 shadow-sm mb-10">
                    <span className="bg-primary text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                      v2.0
                    </span>
                    <span className="text-[10px] font-bold text-gray-500">
                      Cloud-based trip management
                    </span>
                    <ArrowRight className="h-3 w-3 text-gray-300" />
                  </div>
                  <h1 className="text-6xl md:text-8xl font-black text-gray-900 tracking-tighter leading-none mb-10">
                    The OS for <br />
                    <span className="text-primary italic">Adventure.</span>
                  </h1>
                  <p className="text-lg text-gray-500 font-medium leading-relaxed max-w-lg mb-12">
                    Unified infrastructure for Balinese exploration. Real-time
                    availability, instant confirmations, and API-driven local
                    experiences.
                  </p>
                  <div className="flex flex-wrap gap-4 mb-16">
                    <Link
                      to="/login"
                      className="px-10 py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                    >
                      Start Free Trial
                    </Link>
                    <Link
                      to="/tours"
                      className="px-10 py-5 bg-white text-gray-900 border border-gray-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all"
                    >
                      Quick Search
                    </Link>
                  </div>
                  <div className="pt-10 border-t border-gray-100">
                    <p className="text-[10px] font-black uppercase text-gray-300 tracking-widest mb-6">
                      Trusted by organizations worldwide
                    </p>
                    <div className="flex items-center gap-10 opacity-30 grayscale">
                      <Globe className="h-8 w-8" />
                      <Zap className="h-8 w-8" />
                      <Leaf className="h-8 w-8" />
                      <Sparkles className="h-8 w-8" />
                    </div>
                  </div>
                </div>
                <div className="lg:w-1/2 relative">
                  <img
                    src="https://i.ibb.co/dwHFt397/DSCF4223-optimized.webp"
                    className="w-full aspect-square object-cover rounded-[3rem] shadow-2xl"
                    alt="SaaS Hero"
                  />
                  <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-[2rem] shadow-2xl border border-gray-100 animate-float hidden md:block">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-primary font-black">
                        98%
                      </div>
                      <span className="text-sm font-bold text-gray-900 uppercase">
                        Success Rate
                      </span>
                    </div>
                    <div className="w-48 h-2 bg-gray-50 rounded-full overflow-hidden">
                      <div className="w-4/5 h-full bg-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      default:
        return (
          <section className="relative h-[85vh] w-full overflow-hidden hidden md:block bg-gray-900">
            {videoId && isVideoLoaded ? (
              <div className="absolute inset-0 w-full h-full pointer-events-none scale-[1.05]">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&modestbranding=1&playlist=${videoId}&iv_load_policy=3&enablejsapi=1`}
                  title="Hero Background Video"
                  className="w-full h-full scale-[1.35] md:scale-[1.5]"
                  allow="autoplay; encrypted-media"
                />
              </div>
            ) : (
              <div className="absolute inset-0 w-full h-full">
                <SmartImage
                  src={
                    videoId
                      ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
                      : settings?.ogImage ||
                        "https://i.ibb.co/ksfhmLX0/Ulundanu-Beratan5-optimized.webp"
                  }
                  alt="Bali Landscape"
                  className="h-full w-full object-cover"
                  priority
                  aspectRatio="auto"
                  width={1920}
                  quality={80}
                />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4 pb-20">
              <span className="mb-4 inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-black uppercase tracking-wider">
                Explore Bali
              </span>
              <h1 className="mb-6 text-4xl font-black md:text-6xl leading-[0.95] tracking-tighter max-w-4xl">
                Discover the Hidden{" "}
                <span className="text-secondary">Treasures</span> of Bali
              </h1>
              <p className="mb-10 max-w-xl text-lg text-gray-100 font-medium leading-relaxed opacity-90">
                Curated expeditions through active volcanoes, emerald rice
                terraces, and ancient water temples.
              </p>
            </div>

            <div className="absolute bottom-[150px] left-0 w-full z-30">
              <SearchForm />
            </div>
          </section>
        );
    }
  };

  const renderFeaturedTours = () => {
    switch (featuredToursStyle) {
      case "iceland-marketplace":
        return (
          <section className="py-24 bg-gray-50/50 border-y border-gray-150">
            <div className="container mx-auto px-6 max-w-7xl">
              <div className="flex flex-col lg:flex-row gap-12">
                
                {/* Left side Guide to Iceland inspired Sidebar info panel */}
                <div className="lg:w-1/4 space-y-6">
                  <div>
                    <span className="text-[10px] font-black uppercase text-[#00A651] tracking-widest block mb-1">
                      Traveler Marketplace
                    </span>
                    <h2 className="text-3xl font-extrabold text-gray-905 tracking-tight font-sans leading-tight">
                      Curated Bali <br />Expeditions
                    </h2>
                  </div>
                  
                  <p className="text-xs text-gray-500 font-bold leading-relaxed">
                    We search across dozens of top-tier licensed local operators and expert guides to package highly comprehensive day plans with the absolute best price guaranteed.
                  </p>

                  {/* Trust Indicators widget block */}
                  <div className="p-5 bg-white rounded-2xl border border-gray-150 space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-800 border-b border-gray-100 pb-2">
                      Why Book With Us?
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 text-xs font-bold text-gray-700">
                        <LucideIcons.CheckCircle2 className="h-4.5 w-4.5 text-[#00A651] shrink-0 mt-0.5" />
                        <div>
                          <span className="block font-black text-[12.5px]">Best Price Guarantee</span>
                          <span className="text-[10px] text-gray-400">Found cheaper? We match it + 5% off</span>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 text-xs font-bold text-gray-700">
                        <LucideIcons.CheckCircle2 className="h-4.5 w-4.5 text-[#00A651] shrink-0 mt-0.5" />
                        <div>
                          <span className="block font-black text-[12.5px]">Free Cancellation</span>
                          <span className="text-[10px] text-gray-400">Up to 24 hours in advance for full refund</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 text-xs font-bold text-gray-700">
                        <LucideIcons.CheckCircle2 className="h-4.5 w-4.5 text-[#00A651] shrink-0 mt-0.5" />
                        <div>
                          <span className="block font-black text-[12.5px]">Premium Local Support</span>
                          <span className="text-[10px] text-gray-400">24/7 client dispatch hotline access</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/tours"
                    className="inline-flex items-center gap-2 text-xs font-black text-[#00A651] hover:underline"
                  >
                    <span>View all available trips</span>
                    <LucideIcons.ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                {/* Right side compact Grid layout */}
                <div className="lg:w-3/4">
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredTours.slice(0, 6).map((tour, index) => {
                      const discountPrice = tour.discountPrice || tour.regularPrice;
                      const hasDiscount = tour.regularPrice && tour.discountPrice && (tour.regularPrice > tour.discountPrice);
                      return (
                        <div key={tour.id} className="bg-white rounded-2xl overflow-hidden border border-gray-150 hover:shadow-xl hover:border-gray-305 transition-all duration-300 flex flex-col group text-left">
                          
                          {/* Image area with badge */}
                          <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                            <SmartImage 
                              src={tour.featuredImage || tour.gallery?.[0]} 
                              alt={tour.title}
                              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                              aspectRatio="auto"
                            />
                            {tour.isPopular && (
                              <span className="absolute top-3 left-3 bg-[#00A651] text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">
                                Best Seller
                              </span>
                            )}
                          </div>

                          {/* Content area */}
                          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                            <div className="space-y-1.5">
                              <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider font-mono">
                                {tour.duration} / English Verified
                              </span>
                              <h3 className="text-sm font-extrabold text-gray-905 line-clamp-2 leading-snug group-hover:text-[#00A651] transition-colors font-sans">
                                {tour.title}
                              </h3>
                              
                              {/* Green star rating bar */}
                              <div className="flex items-center gap-1.5 text-xs text-gray-600 font-bold">
                                <span className="flex items-center gap-0.5 text-[#00A651]">
                                  {[...Array(5)].map((_, i) => (
                                    <LucideIcons.Star key={i} className="h-3 w-3 fill-[#00A651] text-[#00A651]" />
                                  ))}
                                </span>
                                <span>{tour.rating?.toFixed(1) || '4.9'} ({tour.reviewsCount || 112})</span>
                              </div>
                            </div>

                            {/* Price action row */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                              <div className="flex flex-col text-left">
                                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Total Price</span>
                                <div className="flex items-baseline gap-1">
                                  <span className="text-base font-extrabold text-gray-950">
                                    <FormattedPrice amount={discountPrice} />
                                  </span>
                                  {hasDiscount && (
                                    <span className="text-xs font-bold text-gray-400 line-through">
                                      <FormattedPrice amount={tour.regularPrice} />
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Link 
                                to={`/tour/${tour.slug || tour.id}`}
                                className="bg-gray-100 group-hover:bg-[#00A651] text-gray-700 group-hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"
                              >
                                Book Now
                              </Link>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          </section>
        );

      case "troll-adventure":
        return (
          <section className="py-24 bg-white border-b border-gray-150">
            <div className="container mx-auto px-6 max-w-7xl">
              
              {/* Troll.is inspired Heading & subtitle */}
              <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                <span className="bg-[#00b0ff]/10 text-[#0288d1] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest inline-block font-mono">
                  Guaranteed Departures
                </span>
                <h2 className="text-3xl md:text-5xl font-extrabold text-gray-901 tracking-tighter uppercase font-sans">
                  Popular Bali Adventure Tours
                </h2>
                <div className="h-1.5 w-16 bg-[#00b0ff] mx-auto rounded-full" />
                <p className="text-xs text-gray-500 font-bold max-w-lg mx-auto">
                  With our adventure-style packages, you get expert certified guides, small group guarantees, and top safety gear.
                </p>
              </div>

              {/* 3-column rows of bold vertical cards */}
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTours.slice(0, 3).map((tour, index) => {
                  const discountPrice = tour.discountPrice || tour.regularPrice;
                  const hasDiscount = tour.regularPrice && tour.discountPrice && (tour.regularPrice > tour.discountPrice);
                  return (
                    <div key={tour.id} className="bg-[#f8f9fa] rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-200 transition-all duration-300 flex flex-col text-left hover:-translate-y-1">
                      
                      {/* Rich details image container */}
                      <div className="relative aspect-[16/11] overflow-hidden bg-gray-250">
                        <SmartImage 
                          src={tour.featuredImage || tour.gallery?.[0]} 
                          alt={tour.title}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-105"
                          aspectRatio="auto"
                        />
                        {/* Rating block overlay */}
                        <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md text-white py-1.5 px-3 rounded-xl flex items-center gap-1.5 text-xs font-black border border-white/10">
                          <LucideIcons.Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />
                          <span>{tour.rating?.toFixed(1) || '4.9'}</span>
                          <span className="text-[10px] text-gray-400 font-bold">({tour.reviewsCount || 88})</span>
                        </div>
                        {/* Highlighting label */}
                        <span className="absolute top-3 right-3 bg-[#fbc02d] text-gray-901 text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm border border-white/10">
                          Most Recommended
                        </span>
                      </div>

                      {/* Content details */}
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                        <div className="space-y-3">
                          <h3 className="text-base font-extrabold uppercase tracking-tight text-gray-901 line-clamp-2 leading-snug group-hover:text-[#0288d1] transition-colors font-sans">
                            {tour.title}
                          </h3>
                          <p className="text-xs text-gray-500 font-bold line-clamp-3 leading-relaxed">
                            {tour.description}
                          </p>

                          {/* Green highlights feature band */}
                          <div className="flex items-center gap-2 bg-[#e8f5e9] text-[#2e7d32] border border-[#a5d6a7]/30 py-2 px-3 rounded-xl text-[10.5px] font-bold">
                            <LucideIcons.ShieldAlert className="h-4 w-4 text-[#2e7d32] shrink-0" />
                            <span>Includes Full Safety Gear & Hot Lunch Buffet</span>
                          </div>
                        </div>

                        {/* Booking action row */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200/60 mt-auto">
                          <div className="flex flex-col text-left">
                            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 font-mono">From Only</span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-xl font-extrabold text-gray-950">
                                <FormattedPrice amount={discountPrice} />
                              </span>
                              {hasDiscount && (
                                <span className="text-xs font-bold text-gray-400 line-through">
                                  <FormattedPrice amount={tour.regularPrice} />
                                </span>
                              )}
                            </div>
                          </div>
                          <Link 
                            to={`/tour/${tour.slug || tour.id}`}
                            className="bg-[#0288d1] hover:bg-[#01579b] text-white py-3 px-6 rounded-full text-xs font-black uppercase tracking-wider shadow-md hover:scale-105 transition-all"
                          >
                            Book Now
                          </Link>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          </section>
        );

      case "airbnb-classic":
      case "airbnb-fluid":
        return (
          <section className="container mx-auto px-4 py-16 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Featured Guest Favorites
              </h2>
              <Link
                to="/tours"
                className="text-sm font-bold text-gray-900 underline underline-offset-4"
              >
                Show all (50+)
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {filteredTours.slice(0, 4).map((tour, index) => (
                <TourCard
                  key={tour.id}
                  tour={tour}
                  index={index}
                  variant="minimal"
                />
              ))}
            </div>
          </section>
        );

      case "modern-dark":
      case "modern-glass":
        return (
          <section className="py-24 bg-gray-950 overflow-hidden">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 text-white">
                <div>
                  <span className="text-emerald-400 font-black text-[10px] uppercase tracking-widest">
                    The Core Collection
                  </span>
                  <h2 className="text-4xl md:text-6xl font-black tracking-tighter mt-4 mb-6 italic uppercase">
                    Selected <br /> Units
                  </h2>
                </div>
                <p className="text-lg text-white/50 font-medium max-w-xs">
                  Optimized for high-impact experiences.
                </p>
              </div>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTours.slice(0, 3).map((tour, index) => (
                  <TourCard
                    key={tour.id}
                    tour={tour}
                    index={index}
                    variant="modern"
                  />
                ))}
              </div>
            </div>
          </section>
        );

      case "minimal-grid":
      case "minimal-type":
        const isType = featuredToursStyle === "minimal-type";
        return (
          <section className="py-24 border-b border-gray-100">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="flex flex-col md:flex-row gap-20">
                <div className="md:w-1/4">
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-300 mb-8 block">
                    Collection / 1
                  </span>
                  <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter leading-none mb-8">
                    Selected <br /> Works
                  </h2>
                  <Link
                    to="/tours"
                    className="text-[10px] font-black uppercase tracking-[0.3em] border-b border-gray-900 pb-1"
                  >
                    Enter Volume
                  </Link>
                </div>
                <div className="md:w-3/4">
                  <div className="grid gap-12 sm:grid-cols-2">
                    {filteredTours.slice(0, 4).map((tour, index) => (
                      <div key={tour.id} className="group cursor-pointer">
                        <div className="aspect-[16/10] bg-gray-50 overflow-hidden mb-6 filter grayscale group-hover:grayscale-0 transition-all duration-700">
                          <img
                            src={tour.gallery?.[0] || tour.featuredImage}
                            className="w-full h-full object-cover"
                            alt={tour.title}
                          />
                        </div>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4 block">
                          Tour 0{index + 1}
                        </span>
                        <h3
                          className={cn(
                            "text-xl font-black uppercase tracking-tighter group-hover:text-gray-400 transition-colors",
                            isType ? "italic font-serif" : "",
                          )}
                        >
                          {tour.title}
                        </h3>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      case "premium-serif":
      case "premium-full":
        return (
          <section className="py-32 bg-[#fffcf5]">
            <div className="container mx-auto px-4">
              <div className="text-center mb-24">
                <h2 className="text-4xl md:text-7xl font-serif text-gray-900 tracking-widest uppercase mb-6 leading-none">
                  The <br /> Portfolio
                </h2>
                <div className="h-px w-20 bg-amber-400 mx-auto" />
              </div>
              <div className="grid gap-24">
                {filteredTours.slice(0, 3).map((tour, index) => (
                  <div
                    key={tour.id}
                    className={cn(
                      "flex flex-col lg:flex-row items-center gap-16",
                      index % 2 === 1 ? "lg:flex-row-reverse" : "",
                    )}
                  >
                    <div className="lg:w-1/2 aspect-[16/10] shadow-2xl overflow-hidden">
                      <img
                        src={tour.gallery?.[0] || tour.featuredImage}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
                        alt={tour.title}
                      />
                    </div>
                    <div className="lg:w-1/2 space-y-8">
                      <span className="text-amber-600/50 font-serif italic text-xl">
                        Issue 0{index + 1}
                      </span>
                      <h3 className="text-4xl font-serif text-gray-900 tracking-tight leading-none mb-4 italic">
                        {tour.title}
                      </h3>
                      <p className="text-gray-500 font-light leading-relaxed max-w-md italic">
                        {tour.description}
                      </p>
                      <Link
                        to={`/tour/${tour.slug}`}
                        className="inline-block text-[10px] font-black uppercase tracking-[0.4em] text-gray-900 border-b border-amber-400 pb-2"
                      >
                        Discover the story
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case "saas-clean":
      case "saas-dash":
        return (
          <section className="py-24 container mx-auto px-4">
            <div className="mb-20">
              <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block">
                Product Line
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter mt-2">
                Unified Experiences
              </h2>
            </div>
            <div className="grid gap-px bg-gray-100 border border-gray-100 rounded-[2rem] overflow-hidden">
              {filteredTours.slice(0, 6).map((tour, index) => (
                <div
                  key={tour.id}
                  className="bg-white p-12 hover:bg-gray-50 transition-colors flex flex-col md:flex-row items-center gap-12 group"
                >
                  <div className="h-16 w-16 bg-gray-950 rounded-2xl flex items-center justify-center text-white font-black shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-black text-gray-900 mb-2 group-hover:text-primary transition-colors">
                      {tour.title}
                    </h3>
                    <p className="text-gray-500 font-medium text-sm line-clamp-1">
                      {tour.description}
                    </p>
                  </div>
                  <Link
                    to={`/tour/${tour.slug}`}
                    className="px-8 py-4 bg-gray-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Deploy
                  </Link>
                </div>
              ))}
            </div>
          </section>
        );

      default:
        return (
          <section className="container mx-auto px-4 py-12 md:py-20 lg:px-8">
            <div className="mb-8 flex md:flex-row md:items-end justify-between gap-6 hidden md:flex">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <Leaf className="h-4 w-4 text-primary" />
                  <span className="text-primary text-xs font-black">
                    Handpicked experiences
                  </span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-none">
                  Featured Tours
                </h2>
                <p className="mt-3 text-gray-500 font-medium text-lg">
                  Curated expeditions our guests love most
                </p>
              </div>
              <Link
                to="/tours"
                className="flex items-center gap-2 text-primary font-black text-xs group"
              >
                View all tours{" "}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 min-h-[400px]">
              {loading && tours.length === 0
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-4 animate-pulse">
                      <div className="aspect-[4/3] w-full bg-gray-100 rounded-[16px]" />
                      <div className="space-y-2">
                        <div className="h-2 bg-gray-100 rounded-full w-1/3" />
                        <div className="h-4 bg-gray-100 rounded-full w-full" />
                      </div>
                    </div>
                  ))
                : filteredTours
                    .slice(0, 8)
                    .map((tour, index) => (
                      <TourCard key={tour.id} tour={tour} index={index} />
                    ))}
            </div>
          </section>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{settings?.metaTitle || homeTitle}</title>
        <meta
          name="description"
          content={
            settings?.siteDescription ||
            `Discover the hidden treasures of Bali with ${settings?.siteName || "Bali Adventours"}.`
          }
        />
        <meta name="keywords" content={settings?.siteKeywords} />
        <link rel="canonical" href={siteUrl} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:title" content={settings?.metaTitle || homeTitle} />
        <meta
          property="og:description"
          content={
            settings?.siteDescription ||
            "Expertly curated expeditions through Bali."
          }
        />
        <meta
          property="og:image"
          content={settings?.ogImage || "https://i.ibb.co.com/pvLCVYkM/ALAS-HARUM8-optimized.webp"}
        />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={siteUrl} />
        <meta
          property="twitter:title"
          content={settings?.metaTitle || homeTitle}
        />
        <meta
          property="twitter:description"
          content={
            settings?.siteDescription ||
            "Expertly curated expeditions through Bali."
          }
        />
        <meta
          property="twitter:image"
          content={settings?.ogImage || "https://i.ibb.co.com/pvLCVYkM/ALAS-HARUM8-optimized.webp"}
        />

        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            url: siteUrl,
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: `${siteUrl}/tours?search={search_term_string}`,
              },
              "query-input": "required name=search_term_string",
            },
          })}
        </script>
      </Helmet>

      {/* Mobile Redesigned View Layout */}
      <div className="block md:hidden bg-white pt-8 pb-12 flex flex-col gap-8">
        {/* 1. Search Form */}
        <div className="px-6">
          <form
            onSubmit={handleMobileSearchSubmit}
            className="relative w-full max-w-md mx-auto"
          >
            <div className="relative flex items-center bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.065)] overflow-hidden transition-all duration-300 focus-within:shadow-[0_8px_30px_rgba(0,0,0,0.1)] focus-within:border-gray-200">
              <div className="pl-4 pr-1 text-gray-400">
                <LucideIcons.Search className="h-5 w-5 stroke-[2.5px] text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Where to next?"
                value={mobileSearchTerm}
                onChange={(e) => setMobileSearchTerm(e.target.value)}
                className="w-full bg-transparent border-none py-3.5 pr-4 outline-none text-sm font-semibold text-gray-800 placeholder:text-gray-400 focus:ring-0"
              />
              <button
                type="submit"
                className="p-2 mr-2 bg-gray-50 hover:bg-gray-100 active:scale-95 transition-transform rounded-lg text-gray-500"
              >
                <LucideIcons.SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>

        {/* 2. Category selection panel */}
        <div className="px-6 space-y-2">
          <div className="flex justify-between items-center px-1">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">
              Categories
            </h4>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {categories.length === 0
              ? // Stable skeletons to preserve 4 slots and avoid layout jump during subscription loading
                Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={`cat-skeleton-${idx}`}
                    className="flex flex-col items-center justify-center gap-1.5 animate-pulse"
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-xl" />
                    <div className="w-8 h-2 bg-gray-50 rounded mt-0.5" />
                  </div>
                ))
              : categories.slice(0, 4).map((cat) => {
                  const isActive = selectedMobileCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedMobileCategory(cat.id)}
                      className="flex flex-col items-center justify-center gap-1.5 focus:outline-none"
                    >
                      <div
                        className={cn(
                          "w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300",
                          isActive
                            ? "bg-primary text-white scale-105 shadow-md shadow-primary/20 border border-primary"
                            : "bg-gray-50 text-gray-500 border border-gray-100",
                        )}
                      >
                        <CategoryIcon iconName={cat.icon} className="h-5 w-5" />
                      </div>
                      <span
                        className={cn(
                          "text-[10px] font-bold tracking-tight text-center leading-tight truncate w-full px-0.5",
                          isActive
                            ? "text-primary font-black"
                            : "text-gray-500 font-bold",
                        )}
                      >
                        {cat.name}
                      </span>
                    </button>
                  );
                })}

            {/* The 5th button: "All Categories" bottom sheet/modal trigger */}
            <button
              onClick={() => setIsAllCategoriesModalOpen(true)}
              className="flex flex-col items-center justify-center gap-1.5 focus:outline-none"
            >
              <div
                className={cn(
                  "w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300",
                  selectedMobileCategory === "all" ||
                    !categories
                      .slice(0, 4)
                      .some((c) => c.id === selectedMobileCategory)
                    ? "bg-primary text-white scale-105 shadow-md shadow-primary/20 border border-primary"
                    : "bg-gray-50 text-gray-500 border border-gray-100",
                )}
              >
                <LucideIcons.LayoutGrid className="h-5 w-5" />
              </div>
              <span
                className={cn(
                  "text-[10px] font-bold tracking-tight text-center leading-tight truncate w-full px-0.5",
                  selectedMobileCategory === "all" ||
                    !categories
                      .slice(0, 4)
                      .some((c) => c.id === selectedMobileCategory)
                    ? "text-primary font-black"
                    : "text-gray-500 font-bold",
                )}
              >
                All
              </span>
            </button>
          </div>
        </div>

        {/* 3. Featured Tours Slider */}
        <div className="space-y-3">
          <div className="px-6 flex justify-between items-end">
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">
                Featured Tours
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Specially selected expeditions for you
              </p>
            </div>
            <Link
              to={
                selectedMobileCategory === "all"
                  ? "/tours"
                  : `/tours?category=${selectedMobileCategory}`
              }
              className="text-xs font-bold text-primary hover:underline"
            >
              See All
            </Link>
          </div>
          <div className="flex overflow-x-auto gap-4 px-6 pb-4 scroll-smooth snap-x snap-mandatory no-scrollbar scroll-pl-6">
            {loading && tours.length === 0 ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[80vw] shrink-0 snap-start snap-always space-y-3 animate-pulse"
                >
                  <div className="aspect-[4/3] w-full bg-gray-100 rounded-2xl" />
                  <div className="h-3 bg-gray-100 rounded-full w-1/3" />
                  <div className="h-4 bg-gray-100 rounded-full w-full" />
                </div>
              ))
            ) : filteredTours.length === 0 ? (
              <div className="w-[80vw] shrink-0 py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center flex flex-col justify-center items-center">
                <LucideIcons.Compass className="h-8 w-8 text-gray-400 mb-2 animate-pulse" />
                <p className="text-xs font-bold text-gray-500">
                  No tours in this category
                </p>
              </div>
            ) : (
              filteredTours.slice(0, 8).map((tour) => (
                <div
                  key={tour.id}
                  className="w-[80vw] shrink-0 snap-start snap-always"
                >
                  <SliderTourCard tour={tour} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* 4. Most Favorites Tours Slider */}
        <LazySection>
          <div className="space-y-3">
            <div className="px-6 flex justify-between items-end">
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">
                  Most Favorites Tours
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  Overwhelmingly positive guest expeditions
                </p>
              </div>
              <Link
                to="/tours?sort=rating"
                className="text-xs font-bold text-primary hover:underline"
              >
                See All
              </Link>
            </div>
            <div className="flex overflow-x-auto gap-4 px-6 pb-4 scroll-smooth snap-x snap-mandatory no-scrollbar scroll-pl-6">
              {loading && tours.length === 0 ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-[80vw] shrink-0 snap-start snap-always space-y-3 animate-pulse"
                  >
                    <div className="aspect-[4/3] w-full bg-gray-100 rounded-2xl" />
                    <div className="h-3 bg-gray-100 rounded-full w-1/3" />
                    <div className="h-4 bg-gray-100 rounded-full w-full" />
                  </div>
                ))
              ) : favoriteTours.length === 0 ? (
                <div className="w-[80vw] shrink-0 py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center flex flex-col justify-center items-center">
                  <LucideIcons.Star className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-xs font-bold text-gray-500">
                    No favorite tours found
                  </p>
                </div>
              ) : (
                favoriteTours.map((tour) => (
                  <div
                    key={tour.id}
                    className="w-[80vw] shrink-0 snap-start snap-always"
                  >
                    <SliderTourCard tour={tour} />
                  </div>
                ))
              )}
            </div>
          </div>
        </LazySection>

        {/* 5. Reviews Slider */}
        <LazySection>
          <div className="space-y-3 py-8 bg-[#f0f9ff]">
            <div className="px-6 text-left">
              <h3 className="text-xl font-black text-gray-900 tracking-tight">
                Loved by Travelers
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <LucideIcons.Star
                      key={i}
                      className="h-3 w-3 text-amber-500 fill-amber-500"
                    />
                  ))}
                </div>
                <span className="text-xs font-black text-gray-700">4.9/5*</span>
              </div>
              <p className="text-xs text-blue-600/70 font-black uppercase tracking-widest mt-2">
                Verified Reviews
              </p>
            </div>
            <div className="flex overflow-x-auto gap-4 px-6 pb-4 scroll-smooth snap-x snap-mandatory no-scrollbar scroll-pl-6">
              {loading && reviews.length === 0 ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-[80vw] shrink-0 snap-start snap-always bg-white p-5 rounded-2xl space-y-4 animate-pulse"
                  >
                    <div className="h-3 bg-gray-100 rounded-full w-1/4" />
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-100 rounded-full w-full" />
                      <div className="h-3 bg-gray-100 rounded-full w-5/6" />
                    </div>
                    <div className="flex items-center gap-3 pt-3">
                      <div className="h-8 w-8 rounded-full bg-gray-100" />
                      <div className="space-y-2">
                        <div className="h-2 bg-gray-100 rounded-full w-20" />
                        <div className="h-2 bg-gray-100 rounded-full w-12" />
                      </div>
                    </div>
                  </div>
                ))
              ) : reviews.length === 0 ? (
                <div className="w-[80vw] shrink-0 py-10 bg-white rounded-2xl border border-dashed border-gray-100 text-center flex flex-col justify-center items-center">
                  <LucideIcons.MessageSquare className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-xs font-bold text-gray-500">
                    No reviews found yet
                  </p>
                </div>
              ) : (
                reviews.slice(0, 6).map((review) => (
                  <div
                    key={review.id}
                    className="w-[80vw] shrink-0 snap-start snap-always bg-white p-5 rounded-12 flex flex-col justify-between shadow-[0_4px_20px_rgb(0,0,0,0.03)] relative overflow-hidden text-left border border-gray-100"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-gray-900">
                      <LucideIcons.Quote className="h-10 w-10" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <LucideIcons.Star
                            key={i}
                            className={`h-3 w-3 ${i < (review.rating || 5) ? "text-amber-400 fill-amber-400" : "text-gray-200"}`}
                          />
                        ))}
                      </div>
                      <p className="text-[13px] text-gray-600 leading-relaxed italic line-clamp-4 font-medium">
                        "{review.comment}"
                      </p>
                    </div>
                    <div className="flex items-center gap-3 pt-3 mt-4 border-t border-gray-50 shrink-0">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs border border-primary/20 overflow-hidden shrink-0">
                        {review.userPhoto ? (
                          <img
                            src={review.userPhoto}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          review.userName?.charAt(0) || "U"
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-gray-900 font-black text-[10px] uppercase tracking-wider truncate">
                          {review.userName || "Anonymous"}
                        </h4>
                        <p className="text-gray-400 font-bold text-[8px] tracking-widest truncate">
                          {review.nationality || "Verified traveler"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </LazySection>

        {/* 6. Travel inspiration Slider */}
        <LazySection>
          <div className="space-y-3">
            <div className="px-6 flex justify-between items-end">
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">
                  Travel inspiration
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  Local secrets, tips, and Bali insight articles
                </p>
              </div>
              <Link
                to="/blog"
                className="text-xs font-bold text-primary hover:underline"
              >
                See All
              </Link>
            </div>
            <div className="flex overflow-x-auto gap-4 px-6 pb-4 scroll-smooth snap-x snap-mandatory no-scrollbar scroll-pl-6">
              {loading && posts.length === 0 ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-[80vw] shrink-0 snap-start snap-always space-y-4 animate-pulse"
                  >
                    <div className="aspect-[16/10] w-full bg-gray-100 rounded-2xl" />
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-100 rounded-full w-1/4" />
                      <div className="h-4 bg-gray-100 rounded-full w-full" />
                    </div>
                  </div>
                ))
              ) : posts.length === 0 ? (
                <div className="w-[80vw] shrink-0 py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center flex flex-col justify-center items-center">
                  <LucideIcons.BookOpen className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-xs font-bold text-gray-500">
                    No inspirational posts found
                  </p>
                </div>
              ) : (
                posts.slice(0, 6).map((post) => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug}`}
                    className="w-[80vw] shrink-0 snap-start snap-always block bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm group"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                      <SmartImage
                        src={
                          post.featuredImage ||
                          `https://picsum.photos/seed/${post.slug}/850/550`
                        }
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        aspectRatio="auto"
                        width={300}
                        quality={75}
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 bg-primary text-white rounded-md text-[9px] font-black uppercase tracking-wider shadow-sm">
                          {post.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 space-y-2 text-left">
                      <span className="text-[9px] font-bold text-gray-400 block uppercase tracking-wider">
                        {post.publishedAt?.toDate
                          ? post.publishedAt
                              .toDate()
                              .toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                          : "Recently"}
                      </span>
                      <h4 className="text-sm font-black text-gray-900 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                        {post.title}
                      </h4>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </LazySection>
      </div>

      {/* Categories modal selection bottom-sheet */}
      <AnimatePresence>
        {isAllCategoriesModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/45 backdrop-blur-xs"
              onClick={() => setIsAllCategoriesModalOpen(false)}
            />

            {/* Modal Drawer Sheet */}
            <motion.div
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              exit={{ y: "110%" }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
              className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl z-10 max-h-[85vh] flex flex-col overflow-hidden text-left"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <LucideIcons.LayoutGrid className="h-5 w-5 text-primary" />
                  Choose Category
                </h3>
                <button
                  onClick={() => setIsAllCategoriesModalOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <LucideIcons.X className="h-6 w-6" />
                </button>
              </div>

              <div className="overflow-y-auto py-2 space-y-2 flex-1 scrollbar-hidden pb-8">
                {/* "All" Option */}
                <button
                  onClick={() => {
                    setSelectedMobileCategory("all");
                    setIsAllCategoriesModalOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-4 p-3 rounded-xl transition-all text-left",
                    selectedMobileCategory === "all"
                      ? "bg-primary/5 border border-primary/20 text-primary"
                      : "hover:bg-gray-50 border border-transparent text-gray-700",
                  )}
                >
                  <div
                    className={cn(
                      "p-2.5 rounded-lg",
                      selectedMobileCategory === "all"
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-500",
                    )}
                  >
                    <LucideIcons.Compass className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-black text-sm block">
                      All Destinations & Tours
                    </span>
                    <span className="text-xs text-gray-400">
                      View all available curated expeditions
                    </span>
                  </div>
                </button>

                {/* Categories list */}
                {categories.map((cat) => {
                  const isActive = selectedMobileCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedMobileCategory(cat.id);
                        setIsAllCategoriesModalOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-4 p-3 rounded-xl transition-all text-left",
                        isActive
                          ? "bg-primary/5 border border-primary/20 text-primary"
                          : "hover:bg-gray-50 border border-transparent text-gray-700",
                      )}
                    >
                      <div
                        className={cn(
                          "p-2.5 rounded-lg",
                          isActive
                            ? "bg-primary text-white"
                            : "bg-gray-100 text-gray-500",
                        )}
                      >
                        <CategoryIcon iconName={cat.icon} className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="font-black text-sm block">
                          {cat.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          Discover active {cat.name.toLowerCase()} tours
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Sections */}
      <div className="hidden md:block">
        {renderHero()}
        {renderFeaturedTours()}

        <LazySection>
          <TopRatedTours />
        </LazySection>

        <LazySection>
          <ReviewSlider />
        </LazySection>

        <LazySection>
          <BlogSection />
        </LazySection>
      </div>
    </div>
  );
}
