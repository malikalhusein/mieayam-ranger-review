import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "id" | "en";

interface Translations {
  // Navbar
  home: string;
  about: string;
  supportUs: string;
  compare: string;
  admin: string;
  theme: string;
  language: string;
  
  // Home
  heroTitle: string;
  heroSubtitle: string;
  heroCTA: string;
  hallOfFame: string;
  bestOfBest: string;
  bestOfBestDesc: string;
  budgetFriendly: string;
  budgetFriendlyTitle: string;
  budgetFriendlyDesc: string;
  recentlyAdded: string;
  recentlyAddedDesc: string;
  allReviews: string;
  searchPlaceholder: string;
  allCities: string;
  allTypes: string;
  kuah: string;
  goreng: string;
  allStyles: string;
  advancedFilters: string;
  complexity: string;
  sweetness: string;
  off: string;
  sortBy: string;
  newest: string;
  oldest: string;
  highestScore: string;
  lowestScore: string;
  lowestPrice: string;
  highestPrice: string;
  showingReviews: string;
  loadMore: string;
  noReviewsFound: string;
  mapView: string;
  reviews: string;
  
  // Review Detail
  back: string;
  shareReview: string;
  overallScore: string;
  editorsChoice: string;
  takeItOrLeaveIt: string;
  visitInfo: string;
  visitDate: string;
  price: string;
  servingTime: string;
  minutes: string;
  notes: string;
  detailScoring: string;
  broth: string;
  thickness: string;
  stock: string;
  balance: string;
  aroma: string;
  friedSeasoning: string;
  aromaFried: string;
  seasoningFried: string;
  oilBalance: string;
  noodle: string;
  type: string;
  texture: string;
  chicken: string;
  seasoning: string;
  portion: string;
  facilities: string;
  cleanliness: string;
  utensils: string;
  place: string;
  toppings: string;
  available: string;
  notAvailable: string;
  scoreSummary: string;
  perceptualMap: string;
  visitHistory: string;
  generateScorecard: string;
  downloadScorecard: string;
  relatedReviews: string;
  
  // Compare
  compareTitle: string;
  compareSubtitle: string;
  selectWarung: string;
  addToCompare: string;
  removeFromCompare: string;
  clearAll: string;
  noWarungSelected: string;
  selectAtLeast2: string;
  comparison: string;
  filterByCity: string;
  filterByType: string;
  aspect: string;
  
  // Topping names
  toppingCeker: string;
  toppingBakso: string;
  toppingEkstraAyam: string;
  toppingEkstraSawi: string;
  toppingBalungan: string;
  toppingTetelan: string;
  toppingMieJumbo: string;
  toppingJenisMie: string;
  toppingPangsitBasah: string;
  toppingPangsitKering: string;
  toppingDimsum: string;
  toppingVariasiBumbu: string;
  toppingBawangDaun: string;
  wishlist: string;

  // Footer
  navigation: string;
  contact: string;
  directory: string;
  directoryDesc: string;
  madeWith: string;

  // About
  aboutTitle: string;
  aboutDesc: string;

  // Donation
  donationTitle: string;
  donationDesc: string;

  // General
  loading: string;
  error: string;
  tryAgain: string;
  viewDetails: string;
  seeAll: string;
}

const translations: Record<Language, Translations> = {
  id: {
    // Navbar
    home: "Beranda",
    about: "Tentang",
    supportUs: "Dukung Kami",
    compare: "Bandingkan",
    admin: "Admin",
    theme: "Tema",
    language: "Bahasa",
    
    // Home
    heroTitle: "Mie Ayam Ranger",
    heroSubtitle: "Direktori review warung mie ayam dengan sistem penilaian yang adil dan transparan",
    heroCTA: "KLIK UNTUK CARI MIE AYAMMU!",
    hallOfFame: "Hall of Fame",
    bestOfBest: "The 5 Best of the Best",
    bestOfBestDesc: "Warung mie ayam dengan skor tertinggi",
    budgetFriendly: "Budget Friendly",
    budgetFriendlyTitle: "Top 5 Budget Friendly",
    budgetFriendlyDesc: "Mie ayam paling worth-it untuk kaum budget friendly",
    recentlyAdded: "Baru Ditambahkan",
    recentlyAddedDesc: "Review terbaru dari kunjungan kami",
    allReviews: "Semua Review",
    searchPlaceholder: "Cari warung...",
    allCities: "Semua Kota",
    allTypes: "Semua Tipe",
    kuah: "Kuah",
    goreng: "Goreng",
    allStyles: "Semua Gaya",
    advancedFilters: "Filter Lanjutan",
    complexity: "Kompleksitas",
    sweetness: "Kemanisan",
    off: "Mati",
    sortBy: "Urutkan",
    newest: "Terbaru",
    oldest: "Terlama",
    highestScore: "Skor Tertinggi",
    lowestScore: "Skor Terendah",
    lowestPrice: "Termurah",
    highestPrice: "Termahal",
    showingReviews: "Menampilkan",
    loadMore: "Memuat lebih banyak...",
    noReviewsFound: "Tidak ada review ditemukan",
    mapView: "Peta",
    reviews: "review",
    
    // Review Detail
    back: "Kembali",
    shareReview: "Bagikan review ini",
    overallScore: "Skor Keseluruhan",
    editorsChoice: "Editor's Choice",
    takeItOrLeaveIt: "Take It or Leave It",
    visitInfo: "Informasi Kunjungan",
    visitDate: "Tanggal Kunjungan",
    price: "Harga",
    servingTime: "Waktu Penyajian",
    minutes: "menit",
    notes: "Catatan",
    detailScoring: "Detail Penilaian",
    broth: "Kuah",
    thickness: "Kekentalan",
    stock: "Kaldu",
    balance: "Keseimbangan",
    aroma: "Aroma",
    friedSeasoning: "Tumisan Goreng",
    aromaFried: "Aroma Tumisan",
    seasoningFried: "Bumbu Tumisan",
    oilBalance: "Keseimbangan Minyak",
    noodle: "Mie",
    type: "Tipe",
    texture: "Tekstur",
    chicken: "Ayam",
    seasoning: "Bumbu",
    portion: "Potongan",
    facilities: "Fasilitas",
    cleanliness: "Kebersihan",
    utensils: "Alat Makan",
    place: "Tempat",
    toppings: "Pilihan Topping",
    available: "Tersedia",
    notAvailable: "Tidak Tersedia",
    scoreSummary: "Ringkasan Skor",
    perceptualMap: "Peta Persepsi",
    visitHistory: "Riwayat Kunjungan",
    generateScorecard: "Generate Scorecard",
    downloadScorecard: "Download Scorecard",
    relatedReviews: "Review Terkait",
    
    // Compare
    compareTitle: "Bandingkan Warung",
    compareSubtitle: "Pilih 2-3 warung untuk dibandingkan secara berdampingan",
    selectWarung: "Pilih Warung",
    addToCompare: "Tambahkan warung lain",
    removeFromCompare: "Hapus",
    clearAll: "Hapus Semua",
    noWarungSelected: "Belum ada warung dipilih",
    selectAtLeast2: "Pilih minimal 2 warung untuk membandingkan",
    comparison: "Perbandingan",
    filterByCity: "Filter Kota",
    filterByType: "Filter Tipe",
    aspect: "Aspek",
    
    // Topping names
    toppingCeker: "Ceker",
    toppingBakso: "Bakso",
    toppingEkstraAyam: "Ekstra Ayam",
    toppingEkstraSawi: "Ekstra Sawi",
    toppingBalungan: "Balungan",
    toppingTetelan: "Tetelan",
    toppingMieJumbo: "Mie Jumbo",
    toppingJenisMie: "Pilihan Jenis Mie",
    toppingPangsitBasah: "Pangsit Basah",
    toppingPangsitKering: "Pangsit Kering",
    toppingDimsum: "Dimsum",
    toppingVariasiBumbu: "Variasi Bumbu",
    toppingBawangDaun: "Bawang Daun",
    wishlist: "Wishlist",

    // Footer
    navigation: "Navigasi",
    contact: "Kontak",
    directory: "Mie Ayam Ranger",
    directoryDesc: "Direktori review warung mie ayam dengan sistem penilaian yang adil, transparan, dan objektif.",
    madeWith: "Dibuat dengan ❤️ dan 🍜",

    // About
    aboutTitle: "Tentang Kami",
    aboutDesc: "Mie Ayam Ranger adalah platform review mie ayam independen",

    // Donation
    donationTitle: "Dukung Kami",
    donationDesc: "Bantu kami terus mereview warung mie ayam",

    // General
    loading: "Memuat...",
    error: "Terjadi kesalahan",
    tryAgain: "Coba lagi",
    viewDetails: "Lihat Detail",
    seeAll: "Lihat Semua",
  },
  en: {
    // Navbar
    home: "Home",
    about: "About",
    supportUs: "Support Us",
    compare: "Compare",
    admin: "Admin",
    theme: "Theme",
    language: "Language",
    
    // Home
    heroTitle: "Mie Ayam Ranger",
    heroSubtitle: "Directory of chicken noodle reviews with fair and transparent rating system",
    heroCTA: "CLICK TO FIND YOUR MIE AYAM!",
    hallOfFame: "Hall of Fame",
    bestOfBest: "The 5 Best of the Best",
    bestOfBestDesc: "Highest rated chicken noodle stalls",
    budgetFriendly: "Budget Friendly",
    budgetFriendlyTitle: "Top 5 Budget Friendly",
    budgetFriendlyDesc: "Best value chicken noodles for budget-conscious folks",
    recentlyAdded: "Recently Added",
    recentlyAddedDesc: "Latest reviews from our visits",
    allReviews: "All Reviews",
    searchPlaceholder: "Search stalls...",
    allCities: "All Cities",
    allTypes: "All Types",
    kuah: "Soup",
    goreng: "Fried",
    allStyles: "All Styles",
    advancedFilters: "Advanced Filters",
    complexity: "Complexity",
    sweetness: "Sweetness",
    off: "Off",
    sortBy: "Sort By",
    newest: "Newest",
    oldest: "Oldest",
    highestScore: "Highest Score",
    lowestScore: "Lowest Score",
    lowestPrice: "Lowest Price",
    highestPrice: "Highest Price",
    showingReviews: "Showing",
    loadMore: "Loading more...",
    noReviewsFound: "No reviews found",
    mapView: "Map",
    reviews: "reviews",
    
    // Review Detail
    back: "Back",
    shareReview: "Share this review",
    overallScore: "Overall Score",
    editorsChoice: "Editor's Choice",
    takeItOrLeaveIt: "Take It or Leave It",
    visitInfo: "Visit Information",
    visitDate: "Visit Date",
    price: "Price",
    servingTime: "Serving Time",
    minutes: "minutes",
    notes: "Notes",
    detailScoring: "Scoring Details",
    broth: "Broth",
    thickness: "Thickness",
    stock: "Stock",
    balance: "Balance",
    aroma: "Aroma",
    friedSeasoning: "Fried Seasoning",
    aromaFried: "Fried Aroma",
    seasoningFried: "Seasoning Blend",
    oilBalance: "Oil Balance",
    noodle: "Noodle",
    type: "Type",
    texture: "Texture",
    chicken: "Chicken",
    seasoning: "Seasoning",
    portion: "Portion",
    facilities: "Facilities",
    cleanliness: "Cleanliness",
    utensils: "Utensils",
    place: "Place",
    toppings: "Topping Options",
    available: "Available",
    notAvailable: "Not Available",
    scoreSummary: "Score Summary",
    perceptualMap: "Perceptual Map",
    visitHistory: "Visit History",
    generateScorecard: "Generate Scorecard",
    downloadScorecard: "Download Scorecard",
    relatedReviews: "Related Reviews",
    
    // Compare
    compareTitle: "Compare Stalls",
    compareSubtitle: "Select 2-3 stalls to compare side by side",
    selectWarung: "Select Stall",
    addToCompare: "Add another stall",
    removeFromCompare: "Remove",
    clearAll: "Clear All",
    noWarungSelected: "No stall selected",
    selectAtLeast2: "Select at least 2 stalls to compare",
    comparison: "Comparison",
    filterByCity: "Filter by City",
    filterByType: "Filter by Type",
    aspect: "Aspect",
    
    // Topping names
    toppingCeker: "Chicken Feet",
    toppingBakso: "Meatball",
    toppingEkstraAyam: "Extra Chicken",
    toppingEkstraSawi: "Extra Greens",
    toppingBalungan: "Chicken Bone",
    toppingTetelan: "Beef Tendon",
    toppingMieJumbo: "Jumbo Noodle",
    toppingJenisMie: "Noodle Type Options",
    toppingPangsitBasah: "Steamed Dumpling",
    toppingPangsitKering: "Fried Dumpling",
    toppingDimsum: "Dimsum",
    toppingVariasiBumbu: "Seasoning Varieties",
    toppingBawangDaun: "Green Onion",
    wishlist: "Wishlist",

    // Footer
    navigation: "Navigation",
    contact: "Contact",
    directory: "Mie Ayam Ranger",
    directoryDesc: "Directory of chicken noodle reviews with fair, transparent, and objective rating system.",
    madeWith: "Made with ❤️ and 🍜",

    // About
    aboutTitle: "About Us",
    aboutDesc: "Mie Ayam Ranger is an independent chicken noodle review platform",

    // Donation
    donationTitle: "Support Us",
    donationDesc: "Help us continue reviewing chicken noodle stalls",

    // General
    loading: "Loading...",
    error: "An error occurred",
    tryAgain: "Try again",
    viewDetails: "View Details",
    seeAll: "See All",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved as Language) || "id";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
