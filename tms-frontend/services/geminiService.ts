
import { GoogleGenerativeAI } from "@google/generative-ai";

const ai = new GoogleGenerativeAI(process.env.API_KEY);

export async function getLogisticsInsights(context: string) {
  try {
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are a logistics expert assistant. Based on the following data context from our TMS system, provide 3 brief actionable insights to optimize performance: ${context}`;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not load AI insights at this moment.";
  }
}
