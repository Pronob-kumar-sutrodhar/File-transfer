import { GoogleGenAI } from "@google/genai";
import { ArchitectureSection } from "../types";

const initGenAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const auditArchitecture = async (sections: ArchitectureSection[]): Promise<string> => {
  const ai = initGenAI();
  if (!ai) return "Gemini API Key is missing. Please set REACT_APP_GEMINI_API_KEY.";

  const architectureText = sections.map(s => `## ${s.title}\n${s.content}\n${s.codeSnippet || ''}`).join("\n\n");

  const prompt = `
    You are a Senior Security Architect. Review the following system architecture for a local file transfer application (Android <-> Windows).
    Identify potential security bottlenecks, performance improvements, or missing modern best practices.
    Keep the response concise, bulleted, and professional.

    ARCHITECTURE:
    ${architectureText}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini Audit Error:", error);
    return "Failed to perform AI audit. Please try again.";
  }
};
