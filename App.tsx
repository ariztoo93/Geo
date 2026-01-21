
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  TrendingUp, 
  Users, 
  Target, 
  RefreshCw,
  Search,
  ExternalLink,
  MapPin,
  Filter,
  Minimize2,
  Maximize2,
  X,
  Lightbulb,
  ArrowRight,
  LogIn,
  BarChart3,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Wallet,
  ShoppingBag,
  Download,
  Key,
  Clock,
  Map as MapIcon,
  Languages,
  UserPlus,
  User,
  Tag,
  Rocket,
  Compass,
  CreditCard,
  Store,
  Gauge,
  Info
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { analyzeLocation } from './services/geminiService';
import { LocationData, BusinessParams, AnalysisResult, BusinessType, HistoryItem } from './types';

const translations = {
  id: {
    appTitle: "GeoRevenue Insights",
    appSubtitle: "Analisis Cerdas Untuk Ekspansi Bisnis",
    loginTitle: "Masuk ke Dashboard",
    registerTitle: "Daftar Akun Baru",
    loginBtn: "Masuk Sekarang",
    registerBtn: "Daftar Akun",
    noAccount: "Belum punya akun? Daftar",
    hasAccount: "Sudah punya akun? Masuk",
    fullName: "Nama Lengkap",
    loginFooter: "Akses premium khusus mitra korporat & UMKM terpilih.",
    apiKeyTitle: "Aktivasi API Premium",
    apiKeyDesc: "Model analisis 2.5 Pro memerlukan API Key berbayar untuk mengakses fitur Maps Grounding secara real-time.",
    apiKeyBtn: "Pilih API Key",
    businessType: "Jenis Bisnis",
    businessTypePlaceholder: "Ketik jenis bisnis (Contoh: Toko Roti)",
    investmentSize: "Skala Investasi",
    targetMarket: "Target Pasar",
    selectedLoc: "Lokasi Terpilih",
    clickMap: "Klik pada peta untuk memilih lokasi",
    analyzeBtn: "Analisis Potensi Pendapatan",
    analyzing: "Menganalisis",
    historyTitle: "Riwayat Analisis",
    searchPlaceholder: "Cari lokasi atau alamat (min. 4 karakter)...",
    filterTitle: "Filter Kepadatan",
    densityLow: "Rendah",
    densityMed: "Sedang",
    densityHigh: "Tinggi",
    analysisResult: "Hasil Analisis",
    downloadPdf: "Unduh PDF",
    conclusionTitle: "Kesimpulan Akhir",
    dataSources: "Sumber Data & Referensi Lokasi",
    opHours: "Rekomendasi Strategi Jam Operasional",
    pricingTitle: "Strategi Harga (Pricing)",
    marketingTitle: "Strategi Marketing & Bisnis",
    competitorTitle: "Analisis Pesaing Terdekat",
    competitorName: "Nama Bisnis",
    competitorDist: "Jarak",
    competitorNote: "Kekuatan/Fokus",
    purchasingPower: "Daya Beli",
    altUsaha: "Rekomendasi Alternatif Usaha",
    revenueProj: "Proyeksi Omzet Tahunan",
    strategyTitle: "Strategi & Fokus",
    dailyRev: "Omzet Harian",
    estConv: "Est. Konversi",
    competition: "Kompetisi",
    traffic: "Traffic",
    language: "Bahasa",
    step1: "Mengambil data Google Maps...",
    step2: "Menyusun laporan AI...",
    step3: "Finalisasi hasil...",
    potentialScore: "Skor Potensi Lokasi",
    scoreDetail: "Detail Penilaian",
    catDemography: "Demografi",
    catTraffic: "Traffic",
    catCompetitor: "Kompetitor",
    catAccess: "Akses",
    catPrice: "Harga"
  },
  en: {
    appTitle: "GeoRevenue Insights",
    appSubtitle: "Smart Analytics for Business Expansion",
    loginTitle: "Login to Dashboard",
    registerTitle: "Create New Account",
    loginBtn: "Login Now",
    registerBtn: "Register Account",
    noAccount: "Don't have an account? Register",
    hasAccount: "Already have an account? Login",
    fullName: "Full Name",
    loginFooter: "Premium access for corporate partners & selected SMEs.",
    apiKeyTitle: "Premium API Activation",
    apiKeyDesc: "The 2.5 Pro analysis model requires a paid API Key for real-time Maps Grounding features.",
    apiKeyBtn: "Select API Key",
    businessType: "Business Type",
    businessTypePlaceholder: "Type business type (e.g. Bakery)",
    investmentSize: "Investment Scale",
    targetMarket: "Target Market",
    selectedLoc: "Selected Location",
    clickMap: "Click on the map to select a location",
    analyzeBtn: "Analyze Revenue Potential",
    analyzing: "Analyzing",
    historyTitle: "Analysis History",
    searchPlaceholder: "Search location or address (min. 4 characters)...",
    filterTitle: "Density Filter",
    densityLow: "Low",
    densityMed: "Medium",
    densityHigh: "High",
    analysisResult: "Analysis Result",
    downloadPdf: "Download PDF",
    conclusionTitle: "Final Conclusion",
    dataSources: "Data Sources & Location References",
    opHours: "Operational Hours Strategy Recommendation",
    pricingTitle: "Pricing Strategy",
    marketingTitle: "Marketing & Business Strategy",
    competitorTitle: "Nearby Competitor Analysis",
    competitorName: "Business Name",
    competitorDist: "Distance",
    competitorNote: "Strength/Niche",
    purchasingPower: "Purchasing Power",
    altUsaha: "Alternative Business Recommendations",
    revenueProj: "Annual Revenue Projection",
    strategyTitle: "Strategy & Focus",
    dailyRev: "Daily Revenue",
    estConv: "Est. Conversion",
    competition: "Competition",
    traffic: "Traffic",
    language: "Language",
    step1: "Fetching Google Maps data...",
    step2: "Generating AI report...",
    step3: "Finalizing results...",
    potentialScore: "Location Potential Score",
    scoreDetail: "Scoring Details",
    catDemography: "Demographics",
    catTraffic: "Traffic",
    catCompetitor: "Competitors",
    catAccess: "Accessibility",
    catPrice: "Price"
  }
};

const getAIStudio = () => (window as any).aistudio;

const createMarkerIcon = (color: string, isPulse: boolean = false) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="relative flex items-center justify-center">
        ${isPulse ? `<div class="absolute w-10 h-10 rounded-full animate-ping opacity-20" style="background-color: ${color}"></div>` : ''}
        <div class="w-5 h-5 rounded-full border-2 border-white shadow-lg relative z-10" style="background-color: ${color}"></div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const formatCurrency = (value: number, lang: 'id' | 'en') => {
  if (lang === 'id') {
    if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(1)} M`;
    if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(0)} jt`;
    if (value >= 1000) return `Rp ${(value / 1000).toFixed(0)} rb`;
    return `Rp ${value.toLocaleString('id-ID')}`;
  } else {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toLocaleString('en-US')}`;
  }
};

const MapClickHandler = ({ onLocationSelect }: { onLocationSelect: (loc: LocationData) => void }) => {
  useMapEvents({
    click(e) {
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
};

const MapController = ({ center }: { center: LocationData | null }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo([center.lat, center.lng], 15, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
};

const StatCard = ({ label, value, icon, color }: { label: string, value: string, icon: React.ReactNode, color: string }) => (
  <div className={`${color} p-6 rounded-[2rem] border border-white/50 shadow-sm flex flex-col items-center justify-center text-center min-w-[140px]`}>
    <div className="mb-3 bg-white p-3 rounded-2xl shadow-sm">{icon}</div>
    <p className="text-[10px] font-bold uppercase text-slate-400 mb-1 tracking-widest">{label}</p>
    <p className="text-xl font-black text-slate-900">{value}</p>
  </div>
);

const ScoreBar = ({ label, score, color }: { label: string, score: number, color: string }) => {
  const percentage = (score / 20) * 100;
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{label}</span>
        <span className="text-xs font-black text-slate-900">{score}/20</span>
      </div>
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden shadow-inner">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-1000 ease-out shadow-sm`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const t = translations[lang];

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ fullName: '', email: '', password: '' });

  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [densityFilters, setDensityFilters] = useState({
    Rendah: true,
    Sedang: true,
    Tinggi: true
  });
  
  const [businessParams, setBusinessParams] = useState<BusinessParams>({
    type: BusinessType.CAFE,
    investmentSize: 'menengah',
    targetDemographic: 'Profesional Muda & Mahasiswa'
  });
  
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      const density = item.result.competitorDensity;
      if (density === 'Rendah' || (density as string) === 'Low') return densityFilters.Rendah;
      if (density === 'Sedang' || (density as string) === 'Medium') return densityFilters.Sedang;
      if (density === 'Tinggi' || (density as string) === 'High') return densityFilters.Tinggi;
      return true;
    });
  }, [history, densityFilters]);

  useEffect(() => {
    checkApiKey();
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 3 && !isSearching) {
        fetchSuggestions(searchQuery);
      } else if (searchQuery.trim().length === 0) {
        setSuggestions([]);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchSuggestions = async (query: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      );
      const data = await response.json();
      setSuggestions(data);
      if (data.length > 0) setShowSuggestions(true);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
    }
  };

  const handleSelectSuggestion = (suggestion: any) => {
    const newLoc = { lat: parseFloat(suggestion.lat), lng: parseFloat(suggestion.lon) };
    setSelectedLocation(newLoc);
    setSearchQuery(suggestion.display_name);
    setShowSuggestions(false);
    setError(null);
  };

  const checkApiKey = async () => {
    try {
      const aistudio = getAIStudio();
      if (aistudio) {
        const selected = await aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      }
    } catch (e) {
      console.error("Gagal memeriksa status API Key", e);
    }
  };

  const handleOpenKeyPicker = async () => {
    const aistudio = getAIStudio();
    if (aistudio) {
      await aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.email && loginForm.password) {
      setIsLoggedIn(true);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerForm.fullName && registerForm.email && registerForm.password) {
      setLoginForm({ email: registerForm.email, password: registerForm.password });
      setIsRegisterMode(false);
    }
  };

  const handleSearchAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setShowSuggestions(false);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newLoc = { lat: parseFloat(lat), lng: parseFloat(lon) };
        setSelectedLocation(newLoc);
        setSearchQuery(display_name);
        setError(null);
      } else {
        setError(lang === 'id' ? "Alamat tidak ditemukan." : "Address not found.");
      }
    } catch (err) {
      setError(lang === 'id' ? "Gagal melakukan pencarian alamat." : "Failed to search address.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedLocation) {
      setError(lang === 'id' ? "Silakan pilih lokasi di peta terlebih dahulu." : "Please select a location on the map first.");
      return;
    }
    setLoading(true);
    setProgress(5);
    setError(null);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev < 45) return prev + Math.random() * 2;
        if (prev < 85) return prev + Math.random() * 0.5;
        if (prev < 98) return prev + 0.1; 
        return prev;
      });
    }, 400);

    try {
      const result = await analyzeLocation(selectedLocation, businessParams, lang);
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        setAnalysis(result);
        setIsPanelExpanded(true);
        setLoading(false);
        setProgress(0);
        const newItem: HistoryItem = {
          id: Math.random().toString(36).substr(2, 9),
          location: selectedLocation,
          params: { ...businessParams },
          result: result
        };
        setHistory(prev => [newItem, ...prev]);
      }, 500);
    } catch (err: any) {
      clearInterval(interval);
      setLoading(false);
      setProgress(0);
      setError(lang === 'id' ? "Gagal menghasilkan analisis." : "Failed to generate analysis.");
    }
  };

  const handleDownloadPDF = () => {
    if (!reportRef.current) return;
    const element = reportRef.current;
    const printOnlyElements = element.querySelectorAll('.pdf-print-only');
    printOnlyElements.forEach(el => el.classList.remove('hidden'));

    const opt = {
      margin: 10,
      filename: `Report-GeoRevenue-${businessParams.type.replace(/\//g, '-')}-${new Date().getTime()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // @ts-ignore
    if (typeof html2pdf !== 'undefined') {
      // @ts-ignore
      html2pdf().from(element).set(opt).save().then(() => {
        printOnlyElements.forEach(el => el.classList.add('hidden'));
      });
    }
  };

  const toggleFilter = (density: keyof typeof densityFilters) => {
    setDensityFilters(prev => ({ ...prev, [density]: !prev[density] }));
  };

  const getConclusionStyle = (conclusion: string) => {
    if (conclusion === 'Layak Buka' || conclusion === 'Recommended') {
      return { bg: 'bg-emerald-500', text: 'text-emerald-700', icon: <ShieldCheck className="text-white" size={24} /> };
    }
    if (conclusion === 'Boleh dengan catatan' || conclusion === 'Possible with notes') {
      return { bg: 'bg-amber-500', text: 'text-amber-700', icon: <ShieldAlert className="text-white" size={24} /> };
    }
    return { bg: 'bg-rose-500', text: 'text-rose-700', icon: <ShieldX className="text-white" size={24} /> };
  };

  const scoreData = useMemo(() => {
    if (!analysis?.scores) return [];
    return [
      { name: 'Completed', value: analysis.scores.total },
      { name: 'Remaining', value: 100 - analysis.scores.total }
    ];
  }, [analysis]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl z-10 transition-all duration-500">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-blue-600 p-3 rounded-2xl text-white mb-4 shadow-lg shadow-blue-500/50">
              <TrendingUp size={32} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{t.appTitle}</h1>
            <p className="text-slate-400 text-sm mt-1">{t.appSubtitle}</p>
          </div>

          <div className="mb-6 flex p-1 bg-slate-800/50 rounded-2xl border border-slate-700">
            <button onClick={() => setIsRegisterMode(false)} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${!isRegisterMode ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>Masuk</button>
            <button onClick={() => setIsRegisterMode(true)} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${isRegisterMode ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>Daftar</button>
          </div>

          {!isRegisterMode ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <input type="email" required className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white outline-none" placeholder="email@bisnis.com" value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} />
              <input type="password" required className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white outline-none" placeholder="••••••••" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} />
              <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg">Masuk Sekarang</button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
              <input type="text" required className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white outline-none" placeholder="Nama Lengkap" value={registerForm.fullName} onChange={e => setRegisterForm({...registerForm, fullName: e.target.value})} />
              <input type="email" required className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white outline-none" placeholder="email@bisnis.com" value={registerForm.email} onChange={e => setRegisterForm({...registerForm, email: e.target.value})} />
              <input type="password" required className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white outline-none" placeholder="••••••••" value={registerForm.password} onChange={e => setRegisterForm({...registerForm, password: e.target.value})} />
              <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg">Daftar Akun</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  if (!hasApiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-md w-full p-8 bg-white rounded-3xl shadow-xl border border-slate-100 text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6"><Key size={32} /></div>
          <h2 className="text-2xl font-black text-slate-900 mb-4">{t.apiKeyTitle}</h2>
          <button onClick={handleOpenKeyPicker} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg">{t.apiKeyBtn}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen md:flex-row bg-slate-50 relative overflow-hidden">
      <div className="w-full md:w-[400px] bg-white border-r border-slate-200 p-6 overflow-y-auto flex flex-col shadow-xl z-20">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2"><div className="bg-blue-600 p-2 rounded-lg text-white"><TrendingUp size={24} /></div><h1 className="text-xl font-bold tracking-tight text-slate-800">GeoRevenue <span className="text-blue-600">Insights</span></h1></div>
          <div className="flex items-center gap-2"><button onClick={handleOpenKeyPicker} className="p-2 text-slate-400 hover:text-blue-600"><Key size={18} /></button><button onClick={() => setIsLoggedIn(false)} className="p-2 text-slate-400 hover:text-rose-500"><X size={20} /></button></div>
        </div>

        <section className="space-y-6">
          <div className="flex gap-2 mb-4">
            <button onClick={() => setLang('id')} className={`flex-1 py-2 rounded-xl text-xs font-bold ${lang === 'id' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>🇮🇩 ID</button>
            <button onClick={() => setLang('en')} className={`flex-1 py-2 rounded-xl text-xs font-bold ${lang === 'en' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>🇺🇸 EN</button>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Store size={16} className="text-slate-400" />
              {t.businessType}
            </label>
            <div className="relative">
              <input 
                list="business-types"
                type="text" 
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                placeholder={t.businessTypePlaceholder}
                value={businessParams.type} 
                onChange={(e) => setBusinessParams({...businessParams, type: e.target.value})} 
              />
              <datalist id="business-types">
                {Object.values(BusinessType).map(type => <option key={type} value={type} />)}
              </datalist>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">{t.investmentSize}</label>
              <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" value={businessParams.investmentSize} onChange={(e) => setBusinessParams({...businessParams, investmentSize: e.target.value as any})}>
                <option value="kecil">{lang === 'id' ? 'KECIL' : 'SMALL'}</option>
                <option value="menengah">{lang === 'id' ? 'MENENGAH' : 'MEDIUM'}</option>
                <option value="besar">{lang === 'id' ? 'BESAR' : 'LARGE'}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">{t.targetMarket}</label>
              <input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" placeholder={lang === 'id' ? "Mis: Mahasiswa" : "e.g. Students"} value={businessParams.targetDemographic} onChange={(e) => setBusinessParams({...businessParams, targetDemographic: e.target.value})} />
            </div>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <div className="flex items-start gap-3"><MapPin className="text-blue-600 mt-1" size={20} /><div><p className="text-sm font-bold text-blue-900">{t.selectedLoc}</p>{selectedLocation ? <p className="text-xs text-blue-700 mt-1">{selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}</p> : <p className="text-xs text-blue-700 mt-1 italic">{t.clickMap}</p>}</div></div>
          </div>
          
          <div className="space-y-4">
            <button 
              onClick={handleAnalyze} 
              disabled={loading || !selectedLocation} 
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 relative overflow-hidden group shadow-lg transition-all duration-300 active:scale-95"
            >
              {loading ? (
                <div className="flex items-center gap-2 z-10">
                  <RefreshCw className="animate-spin" size={20} />
                  <span className="tabular-nums">{t.analyzing} {Math.round(progress)}%</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Search size={20} />
                  <span>{t.analyzeBtn}</span>
                </div>
              )}
              {loading && (
                <div 
                  className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-300 shadow-[0_0_12px_rgba(59,130,246,1)]" 
                  style={{ width: `${progress}%` }}
                />
              )}
            </button>
            
            {loading && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner flex flex-col gap-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  <span className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                    {progress < 40 ? t.step1 : progress < 80 ? t.step2 : t.step3}
                  </span>
                  <span className="text-blue-600">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400 transition-all duration-500 ease-out rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {history.length > 0 && (
          <div className="mt-8 border-t pt-6">
            <h3 className="text-xs font-bold uppercase text-slate-400 mb-4">{t.historyTitle}</h3>
            <div className="space-y-3">
              {history.map(item => (
                <button key={item.id} onClick={() => {setAnalysis(item.result); setSelectedLocation(item.location);}} className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-blue-300 transition-all flex items-center gap-3">
                  <div className={`w-2 h-8 rounded-full ${getConclusionStyle(item.result.conclusion).bg}`}></div>
                  <div className="flex-1 min-w-0"><p className="text-xs font-bold text-slate-700 truncate">{item.params.type}</p><p className="text-[10px] text-slate-400 truncate">{item.result.conclusion}</p></div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 relative flex flex-col h-full overflow-hidden">
        <div ref={searchContainerRef} className="absolute top-6 left-6 right-6 md:left-auto md:w-[450px] z-[1000] flex flex-col gap-2">
          <form onSubmit={handleSearchAddress} className="bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-2">
            <div className="p-2 text-slate-400"><MapIcon size={20} /></div>
            <input type="text" placeholder={t.searchPlaceholder} className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <button type="submit" disabled={isSearching} className="bg-blue-600 p-2.5 rounded-xl text-white">{isSearching ? <RefreshCw className="animate-spin" size={20} /> : <Search size={20} />}</button>
          </form>
          {showSuggestions && suggestions.length > 0 && (
            <div className="bg-white border border-slate-100 rounded-2xl shadow-2xl max-h-72 overflow-y-auto">
              {suggestions.map((s, idx) => (
                <button key={idx} onClick={() => handleSelectSuggestion(s)} className="w-full text-left p-4 hover:bg-blue-50 border-b border-slate-50 last:border-none">
                  <p className="text-sm font-bold text-slate-800 truncate">{s.display_name.split(',')[0]}</p>
                  <p className="text-[10px] text-slate-400 truncate">{s.display_name}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-full relative z-0">
          <MapContainer center={[-6.2088, 106.8456]} zoom={12} className="h-full w-full">
            <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapClickHandler onLocationSelect={setSelectedLocation} />
            <MapController center={selectedLocation} />
            {selectedLocation && !analysis && <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={createMarkerIcon('#3b82f6', true)} />}
            {filteredHistory.map(item => <Marker key={item.id} position={[item.location.lat, item.location.lng]} icon={createMarkerIcon(getConclusionStyle(item.result.conclusion).bg.replace('bg-', '#').replace('emerald-500', '10b981').replace('amber-500', 'f59e0b').replace('rose-500', 'f43f5e'))} />)}
          </MapContainer>
          
          <div className="absolute bottom-6 left-6 z-10">
            <div className="bg-white/95 backdrop-blur-md p-5 rounded-[2rem] shadow-2xl border border-white/20 w-64">
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-4 flex items-center gap-2"><Filter size={16} className="text-blue-600" /> {t.filterTitle}</h3>
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => toggleFilter('Rendah')}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all border ${densityFilters.Rendah ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-400 opacity-60'}`}
                >
                  <div className={`w-3 h-3 rounded-full ${densityFilters.Rendah ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                  <span className="text-sm font-bold">{t.densityLow}</span>
                </button>
                <button 
                  onClick={() => toggleFilter('Sedang')}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all border ${densityFilters.Sedang ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-400 opacity-60'}`}
                >
                  <div className={`w-3 h-3 rounded-full ${densityFilters.Sedang ? 'bg-amber-500' : 'bg-slate-300'}`}></div>
                  <span className="text-sm font-bold">{t.densityMed}</span>
                </button>
                <button 
                  onClick={() => toggleFilter('Tinggi')}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all border ${densityFilters.Tinggi ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-400 opacity-60'}`}
                >
                  <div className={`w-3 h-3 rounded-full ${densityFilters.Tinggi ? 'bg-rose-500' : 'bg-slate-300'}`}></div>
                  <span className="text-sm font-bold">{t.densityHigh}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {analysis && (
          <div className={`absolute inset-x-0 bottom-0 z-20 bg-white/95 backdrop-blur-xl border-t transition-all duration-500 rounded-t-[2.5rem] shadow-2xl flex flex-col ${isPanelExpanded ? 'h-[85vh]' : 'h-[80px]'}`}>
            <div onClick={() => setIsPanelExpanded(!isPanelExpanded)} className="w-full flex flex-col items-center py-3 cursor-pointer shrink-0">
              <div className="w-12 h-1.5 bg-slate-300 rounded-full mb-2"></div>
              <div className="w-full px-8 flex items-center justify-between">
                <div className="flex items-center gap-3"><div className={`w-2 h-6 rounded-full ${getConclusionStyle(analysis.conclusion).bg}`}></div><h3 className="font-bold text-slate-800 text-sm">{t.analysisResult}</h3></div>
                <div className="flex items-center gap-4">
                  <button onClick={(e) => { e.stopPropagation(); handleDownloadPDF(); }} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-md"><Download size={14} /> {t.downloadPdf}</button>
                  <button className="text-slate-400">{isPanelExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}</button>
                  <button onClick={(e) => { e.stopPropagation(); setAnalysis(null); }} className="text-slate-400"><X size={18} /></button>
                </div>
              </div>
            </div>

            <div className={`flex-1 overflow-y-auto p-8 ${isPanelExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <div className="max-w-7xl mx-auto" ref={reportRef}>
                <div className="pdf-print-only hidden mb-10 pb-6 border-b"><h1 className="text-2xl font-black text-slate-900">GeoRevenue Analysis Report</h1></div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 items-stretch">
                   {/* Score Visualizations */}
                   <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] border shadow-sm flex flex-col items-center">
                      <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest mb-6 flex items-center gap-2">
                        <Gauge size={18} className="text-blue-600" />
                        {t.potentialScore}
                      </h3>
                      <div className="relative w-[180px] h-[180px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={scoreData}
                              innerRadius={65}
                              outerRadius={85}
                              startAngle={90}
                              endAngle={450}
                              paddingAngle={0}
                              dataKey="value"
                            >
                              <Cell fill="#3b82f6" />
                              <Cell fill="#f1f5f9" />
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-4xl font-black text-slate-900">{analysis.scores.total}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Points</span>
                        </div>
                      </div>
                      <div className="mt-6 text-center">
                        <p className="text-xs text-slate-500 font-medium italic">"{t.appSubtitle}"</p>
                      </div>
                   </div>

                   {/* Detailed Breakdown Bars */}
                   <div className="lg:col-span-2 bg-slate-50/50 p-8 rounded-[2.5rem] border shadow-sm">
                      <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest mb-8 flex items-center gap-2">
                        <BarChart3 size={18} className="text-blue-600" />
                        {t.scoreDetail}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                        <ScoreBar label={t.catDemography} score={analysis.scores.demografi} color="bg-blue-500" />
                        <ScoreBar label={t.catTraffic} score={analysis.scores.traffic} color="bg-emerald-500" />
                        <ScoreBar label={t.catCompetitor} score={analysis.scores.kompetitor} color="bg-rose-500" />
                        <ScoreBar label={t.catAccess} score={analysis.scores.akses} color="bg-amber-500" />
                        <ScoreBar label={t.catPrice} score={analysis.scores.harga} color="bg-purple-500" />
                      </div>
                      <div className="mt-4 p-4 bg-white/80 rounded-2xl border border-slate-100 flex items-start gap-3">
                        <Info className="text-blue-400 shrink-0 mt-0.5" size={16} />
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                          Skor dihitung berdasarkan algoritma Gemini 2.5 native-audio & spatial data. Skor di atas 70 menunjukkan potensi ekspansi yang sangat tinggi.
                        </p>
                      </div>
                   </div>
                </div>

                <div className="mb-12">
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 w-full">
                    <StatCard label={t.dailyRev} value={analysis.dailyRevenuePotential} icon={<Wallet className="text-blue-500" />} color="bg-blue-50" />
                    <StatCard label={t.estConv} value={analysis.trafficConversionEstimate} icon={<ShoppingBag className="text-emerald-500" />} color="bg-emerald-50" />
                    <StatCard label={t.competition} value={analysis.competitorDensity} icon={<Target className="text-rose-500" />} color="bg-rose-50" />
                    <StatCard label={t.traffic} value={analysis.estimatedFootTraffic} icon={<Users className="text-slate-500" />} color="bg-slate-100" />
                    <StatCard label={t.purchasingPower} value={analysis.purchasingPower} icon={<CreditCard className="text-purple-500" />} color="bg-purple-50" />
                  </div>
                </div>

                <div className="mb-12 p-8 bg-slate-50/50 rounded-[2.5rem] border shadow-inner">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`p-4 rounded-3xl ${getConclusionStyle(analysis.conclusion).bg}`}>{getConclusionStyle(analysis.conclusion).icon}</div>
                    <div><p className={`text-xs font-black uppercase ${getConclusionStyle(analysis.conclusion).text}`}>{t.conclusionTitle}</p><h2 className="text-3xl font-black text-slate-900">{analysis.conclusion}</h2></div>
                  </div>
                  <p className="text-slate-600 text-lg leading-relaxed font-medium">{analysis.locationSummary}</p>
                </div>

                <div className="mb-12">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="bg-rose-100 p-2 rounded-xl text-rose-600"><Compass size={20} /></div>
                      <h3 className="text-xl font-bold text-slate-800">{t.competitorTitle}</h3>
                   </div>
                   <div className="overflow-hidden border border-slate-100 rounded-[2rem] shadow-sm bg-white">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">{t.competitorName}</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">{t.competitorDist}</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">{t.competitorNote}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {analysis.competitorAnalysis.map((comp, i) => (
                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-4 text-sm font-bold text-slate-800">{comp.name}</td>
                              <td className="p-4 text-sm text-slate-600"><span className="px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-bold">{comp.distance}</span></td>
                              <td className="p-4 text-sm text-slate-500 italic">{comp.strength}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                   <div className="bg-blue-50/50 p-8 rounded-[2.5rem] border border-blue-100">
                      <div className="flex items-center gap-3 mb-4"><div className="bg-blue-100 p-2 rounded-xl text-blue-600"><Tag size={20} /></div><h3 className="text-xl font-bold text-slate-800">{t.pricingTitle}</h3></div>
                      <p className="text-slate-700 leading-relaxed">{analysis.estimatedPricing}</p>
                   </div>
                   <div className="bg-emerald-50/50 p-8 rounded-[2.5rem] border border-emerald-100">
                      <div className="flex items-center gap-3 mb-4"><div className="bg-emerald-100 p-2 rounded-xl text-emerald-600"><Clock size={20} /></div><h3 className="text-xl font-bold text-slate-800">{t.opHours}</h3></div>
                      <p className="text-slate-700 leading-relaxed">{analysis.recommendedOpeningHours}</p>
                   </div>
                </div>

                <div className="mb-12">
                   <div className="flex items-center gap-3 mb-6"><div className="bg-purple-100 p-2 rounded-xl text-purple-600"><Rocket size={20} /></div><h3 className="text-xl font-bold text-slate-800">{t.marketingTitle}</h3></div>
                   <div className="bg-purple-50/30 p-8 rounded-[2.5rem] border border-purple-100 text-slate-700 leading-relaxed whitespace-pre-wrap">{analysis.suggestedStrategy}</div>
                </div>

                <div className="mb-12">
                   <div className="flex items-center gap-2 mb-6"><div className="bg-amber-100 p-2 rounded-lg"><Lightbulb className="text-amber-600" size={20} /></div><h3 className="text-xl font-bold text-slate-800">{t.altUsaha}</h3></div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {analysis.alternativeRecommendations.map((rec, i) => (
                        <div key={i} className="bg-white p-5 rounded-2xl border shadow-sm group hover:border-amber-200 transition-all"><p className="font-bold text-slate-900 mb-2 flex items-center justify-between">{rec.type} <ArrowRight size={14} /></p><p className="text-xs text-slate-500">{rec.reason}</p></div>
                      ))}
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                  <div className="bg-slate-50 p-8 rounded-[2.5rem] border">
                    <h3 className="text-lg font-bold mb-8 flex items-center gap-2"><TrendingUp size={20} className="text-blue-600" /> {t.revenueProj}</h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analysis.projectedRevenue}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(value) => formatCurrency(value, lang)} />
                          <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} formatter={(value: number) => [formatCurrency(value, lang), t.revenueProj]} />
                          <Area type="monotone" dataKey="expected" stroke="#3b82f6" strokeWidth={4} fill="#3b82f6" fillOpacity={0.1} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-8 rounded-[2.5rem] border flex flex-col justify-center">
                    <h4 className="text-slate-900 font-bold mb-6 flex items-center gap-2"><BarChart3 className="text-blue-500" size={18} /> {t.strategyTitle}</h4>
                    <p className="text-slate-600 italic">"{analysis.suggestedStrategy.split('\n')[0]}"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
