import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

export type AIModel = "openai" | "gemini";

export function getOpenAIClient(): OpenAI {
  const integrationKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  const integrationBaseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  const directKey = process.env.OPENAI_API_KEY;

  if (integrationKey && integrationBaseURL) {
    return new OpenAI({ apiKey: integrationKey, baseURL: integrationBaseURL });
  }

  if (directKey) {
    return new OpenAI({ apiKey: directKey });
  }

  throw new Error("No OpenAI API key found. Set OPENAI_API_KEY or provision the Replit OpenAI integration.");
}

export function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set.");
  return new GoogleGenerativeAI(apiKey);
}

export async function streamWithOpenAI(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  onChunk: (text: string) => void,
  model = "gpt-4o"
): Promise<string> {
  const client = getOpenAIClient();
  const stream = await client.chat.completions.create({
    model,
    messages,
    stream: true,
    max_tokens: 4096,
  });

  let full = "";
  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content;
    if (text) {
      full += text;
      onChunk(text);
    }
  }
  return full;
}

export async function streamWithGemini(
  systemPrompt: string,
  userPrompt: string,
  history: { role: "user" | "model"; parts: { text: string }[] }[],
  onChunk: (text: string) => void,
  model = "gemini-2.0-flash"
): Promise<string> {
  const genAI = getGeminiClient();
  const geminiModel = genAI.getGenerativeModel({
    model,
    systemInstruction: systemPrompt,
  });

  const chat = geminiModel.startChat({ history });
  const result = await chat.sendMessageStream(userPrompt);

  let full = "";
  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) {
      full += text;
      onChunk(text);
    }
  }
  return full;
}
