import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
// Note: API Key is accessed via process.env.API_KEY as per instructions
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateDreamText = async (keywords: string[]): Promise<string> => {
  if (!apiKey) {
    console.warn("No API Key found, using fallback text.");
    return "The simulation is paused.";
  }

  try {
    const prompt = `
      You are a surreal, liminal space generator. 
      Based on these keywords: "${keywords.join(', ')}".
      Generate a single, short, cryptic, comforting yet slightly unsettling sentence (max 10 words).
      It should feel like a "Dreamcore" or "Weirdcore" caption.
      Examples: 
      - "You have been here before."
      - "The pain doesn't exist here."
      - "Don't wake up yet."
      - "It is safe in the static."
      - "Playtime is eternal."
      
      Output ONLY the sentence. No quotes.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() || "You have been here before.";
  } catch (error) {
    console.error("Gemini generation error:", error);
    return "You have been here before."; // Fallback
  }
};

export const constructImageURL = (keywords: string[]): string => {
  const styleKeywords = "dreamcore, weirdcore, liminal space, soft lighting, grain, low fidelity, 90s aesthetic, ethereal, vhs quality";
  const prompt = `surreal version of ${keywords.join(', ')}, ${styleKeywords}`;
  const seed = Math.floor(Math.random() * 99999);
  // Using Pollinations as it matches the user's original intent and is open for this aesthetic
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=600&nologo=true&seed=${seed}`;
};

export const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Failed to load image"));
  });
};
