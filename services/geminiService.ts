
import { GoogleGenAI, Type } from "@google/genai";
import { LocationData, BusinessParams, AnalysisResult } from "../types";

export const analyzeLocation = async (
  location: LocationData, 
  params: BusinessParams, 
  language: 'id' | 'en' = 'id'
): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const targetLang = language === 'id' ? 'Bahasa Indonesia' : 'English';

  const prompt = `
    Conduct a business potential analysis for "${params.type}" at coordinates ${location.lat}, ${location.lng}.
    Investment scale is ${params.investmentSize} and target demographic is ${params.targetDemographic}.

    Use Google Maps data and area socio-economic knowledge to identify:
    1. Nearby competitors, public facilities, and foot traffic drivers.
    2. Average Purchasing Power (Daya Beli Rata-rata) of the population in a 2-3km radius.
    3. Accessibility (Parking, public transport, ease of access).

    Scoring Logic (Total Max 100):
    Evaluate and give a score from 0 to 20 for each of these 5 categories:
    - Demografi: Alignment between target demographic and area population.
    - Traffic: Volume of foot/vehicle traffic.
    - Kompetitor: Market gap (High score if competition is low or niche is empty).
    - Akses: Ease of customer access (parking/road).
    - Harga: Pricing fit with local purchasing power.

    Determine the business feasibility conclusion at this location:
    - "${language === 'id' ? 'Layak Buka' : 'Recommended'}": If the total score is high and market potential is large.
    - "${language === 'id' ? 'Boleh dengan catatan' : 'Possible with notes'}": If the score is moderate.
    - "${language === 'id' ? 'Tidak Rekomendasi' : 'Not Recommended'}": If the score is low.

    IMPORTANT: Provide the entire analysis report in ${targetLang}.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: {
            latitude: location.lat,
            longitude: location.lng
          }
        }
      },
    },
  });

  const textOutput = response.text || "";
  
  const structuringAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const structurePrompt = `
    Structure the following business analysis into JSON.
    ENSURE ALL TEXT FIELDS ARE IN ${targetLang.toUpperCase()}.
    
    Raw Analysis:
    ${textOutput}

    JSON Format:
    {
      "locationSummary": "summary",
      "conclusion": "Allowed strings: Layak Buka/Boleh dengan catatan/Tidak Rekomendasi (or EN equivalents)",
      "competitorDensity": "Allowed strings: Rendah/Sedang/Tinggi (or EN equivalents)",
      "competitorAnalysis": [
        {"name": "Competitor Name", "distance": "e.g. 200m", "strength": "Niche/Strength"}
      ],
      "purchasingPower": "qualitative level + short reason",
      "estimatedFootTraffic": "string",
      "dailyRevenuePotential": "string",
      "trafficConversionEstimate": "string",
      "keyStrengths": ["string"],
      "potentialRisks": ["string"],
      "projectedRevenue": [{"year": number, "low": number, "expected": number, "high": number}],
      "suggestedStrategy": "string",
      "recommendedOpeningHours": "string",
      "estimatedPricing": "string",
      "alternativeRecommendations": [{"type": "Business Name", "reason": "Short reason"}],
      "scores": {
        "demografi": number (0-20),
        "traffic": number (0-20),
        "kompetitor": number (0-20),
        "akses": number (0-20),
        "harga": number (0-20),
        "total": number (sum of the above)
      }
    }
  `;

  const structuredResponse = await structuringAi.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: structurePrompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          locationSummary: { type: Type.STRING },
          conclusion: { type: Type.STRING },
          competitorDensity: { type: Type.STRING },
          competitorAnalysis: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                distance: { type: Type.STRING },
                strength: { type: Type.STRING }
              }
            }
          },
          purchasingPower: { type: Type.STRING },
          estimatedFootTraffic: { type: Type.STRING },
          dailyRevenuePotential: { type: Type.STRING },
          trafficConversionEstimate: { type: Type.STRING },
          keyStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          potentialRisks: { type: Type.ARRAY, items: { type: Type.STRING } },
          projectedRevenue: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                year: { type: Type.NUMBER },
                low: { type: Type.NUMBER },
                expected: { type: Type.NUMBER },
                high: { type: Type.NUMBER }
              }
            }
          },
          suggestedStrategy: { type: Type.STRING },
          recommendedOpeningHours: { type: Type.STRING },
          estimatedPricing: { type: Type.STRING },
          alternativeRecommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                reason: { type: Type.STRING }
              }
            }
          },
          scores: {
            type: Type.OBJECT,
            properties: {
              demografi: { type: Type.NUMBER },
              traffic: { type: Type.NUMBER },
              kompetitor: { type: Type.NUMBER },
              akses: { type: Type.NUMBER },
              harga: { type: Type.NUMBER },
              total: { type: Type.NUMBER }
            },
            required: ["demografi", "traffic", "kompetitor", "akses", "harga", "total"]
          }
        },
        required: ["locationSummary", "conclusion", "competitorDensity", "competitorAnalysis", "purchasingPower", "estimatedFootTraffic", "dailyRevenuePotential", "trafficConversionEstimate", "keyStrengths", "potentialRisks", "projectedRevenue", "suggestedStrategy", "recommendedOpeningHours", "estimatedPricing", "alternativeRecommendations", "scores"]
      }
    }
  });

  const finalJson = JSON.parse(structuredResponse.text || "{}");
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  const groundingUrls = groundingChunks?.map((chunk: any) => {
    if (chunk.maps) return { title: chunk.maps.title, uri: chunk.maps.uri };
    if (chunk.web) return { title: chunk.web.title, uri: chunk.web.uri };
    return null;
  }).filter(Boolean);

  return { ...finalJson, groundingUrls: groundingUrls || [] };
};
