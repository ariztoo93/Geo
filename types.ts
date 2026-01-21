
export interface LocationData {
  lat: number;
  lng: number;
}

export interface BusinessParams {
  type: string;
  investmentSize: 'kecil' | 'menengah' | 'besar';
  targetDemographic: string;
}

export interface RevenueProjection {
  year: number;
  low: number;
  expected: number;
  high: number;
}

export interface AlternativeRecommendation {
  type: string;
  reason: string;
}

export interface Competitor {
  name: string;
  distance: string;
  strength: string;
}

export interface AnalysisScores {
  demografi: number;
  traffic: number;
  kompetitor: number;
  akses: number;
  harga: number;
  total: number;
}

export interface AnalysisResult {
  locationSummary: string;
  conclusion: 'Layak Buka' | 'Boleh dengan catatan' | 'Tidak Rekomendasi';
  competitorDensity: 'Rendah' | 'Sedang' | 'Tinggi';
  competitorAnalysis: Competitor[];
  purchasingPower: string;
  estimatedFootTraffic: string;
  dailyRevenuePotential: string;
  trafficConversionEstimate: string;
  keyStrengths: string[];
  potentialRisks: string[];
  projectedRevenue: RevenueProjection[];
  suggestedStrategy: string;
  recommendedOpeningHours: string;
  estimatedPricing: string;
  alternativeRecommendations: AlternativeRecommendation[];
  scores: AnalysisScores;
  groundingUrls?: Array<{ title: string; uri: string }>;
}

export interface HistoryItem {
  id: string;
  location: LocationData;
  params: BusinessParams;
  result: AnalysisResult;
}

export enum BusinessType {
  CAFE = 'Kafe / Kopi Spesialis',
  RETAIL = 'Ritel / Butik',
  GYM = 'Gym / Studio Kebugaran',
  RESTAURANT = 'Restoran / Rumah Makan',
  TECH = 'Hub Teknologi / Coworking Space',
  SERVICES = 'Layanan Profesional (Hukum/Medis)',
  BARBERSHOP = 'Barbershop / Pangkas Barber (UMKM)',
  BAKSO = 'Warung Bakso / Mie Ayam (UMKM)',
  LAUNDRY = 'Laundry Kiloan (UMKM)',
  MINIMARKET = 'Toko Kelontong / Minimarket (UMKM)',
  WARTEG = 'Warung Nasi / Warteg (UMKM)',
  STREET_FOOD = 'Jajanan Kaki Lima (UMKM)'
}
