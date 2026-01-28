import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Question, QuestionType, Difficulty } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define the response schema for strict JSON output
const questionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    quiz: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          type: { type: Type.STRING, enum: [QuestionType.MCQ, QuestionType.MSQ, QuestionType.NAT] },
          text: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Provide 4 options for MCQ/MSQ. Leave empty for NAT."
          },
          correctAnswer: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "The correct option text(s) or the numerical value for NAT."
          },
          explanation: { type: Type.STRING },
        },
        required: ["id", "type", "text", "correctAnswer", "explanation"]
      }
    }
  }
};

export const generateQuestions = async (
  topic: string,
  examType: string,
  difficulty: Difficulty,
  count: number = 5
): Promise<Question[]> => {
  
  const systemInstruction = `
    You are an expert question setter for Indian Competitive Exams like ${examType}.
    Your goal is to generate high-quality, exam-relevant questions on the topic: "${topic}".
    
    Rules:
    1. Difficulty Level: ${difficulty}.
    2. Total Questions: ${count}.
    3. Include a mix of Question Types if appropriate for the topic, but prioritize:
       - GATE: Mix of MCQ, MSQ, NAT.
       - SSC/Bank: Mostly MCQ.
    4. For NAT (Numerical Answer Type), do not provide options. The user must type the number.
    5. For MSQ (Multiple Select), ensure multiple options can be correct.
    6. Provide clear, step-by-step explanations for the solutions.
    7. Ensure questions test application of concepts, not just memorization.
    8. For Spatial/Visual topics, describe the image scenario in text clearly if an image cannot be generated.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate ${count} ${difficulty} level questions for ${topic} focusing on ${examType} pattern.`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: questionSchema,
        temperature: 0.7, // Balance creativity with accuracy
      },
    });

    const jsonText = response.text || "{}";
    const parsed = JSON.parse(jsonText);
    
    // Post-processing to ensure data integrity
    const questions: Question[] = (parsed.quiz || []).map((q: any, index: number) => ({
      ...q,
      id: `q-${Date.now()}-${index}`,
      topic: topic,
      // Ensure options are present for MCQ/MSQ
      options: (q.type === QuestionType.NAT) ? [] : (q.options || []),
    }));

    return questions;

  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate questions. Please try again.");
  }
};