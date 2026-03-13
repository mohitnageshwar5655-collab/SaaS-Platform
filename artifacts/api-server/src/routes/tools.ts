import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { generationHistory } from "@workspace/db";
import { desc } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import { GenerateAiContentBody } from "@workspace/api-zod";

const router: IRouter = Router();

function buildSystemPrompt(toolType: string, opts: { language?: string; tone?: string; platform?: string; programmingLanguage?: string }): string {
  const lang = opts.language ? `Respond in ${opts.language}.` : "Respond in the same language as the prompt.";

  switch (toolType) {
    case "email":
      return `You are an expert email writer. Write a professional, well-structured email based on the user's input.
Tone: ${opts.tone || "professional"}. ${lang}
Format: Subject line first, then the email body. Be concise and clear.`;

    case "blog":
      return `You are a professional content writer and SEO expert. Write an engaging, well-structured blog post.
Tone: ${opts.tone || "informative and engaging"}. ${lang}
Include: A compelling headline, introduction, main sections with subheadings, conclusion, and a call-to-action.`;

    case "social":
      return `You are a social media expert specializing in ${opts.platform || "social media"} content.
Write an engaging, platform-optimized post for ${opts.platform || "social media"}.
Tone: ${opts.tone || "engaging"}. ${lang}
Include relevant hashtags. Keep it concise and impactful. Optimize for the platform's style.`;

    case "code":
      return `You are an expert ${opts.programmingLanguage || "software"} developer. Generate clean, well-documented, production-ready code.
Language: ${opts.programmingLanguage || "as appropriate"}.
Include: Code comments, proper error handling, and a brief explanation of how it works.`;

    case "translate":
      return `You are a professional translator. Translate the provided text accurately and naturally into ${opts.language || "English"}.
Preserve the original meaning, tone, and style. Only provide the translation, nothing else.`;

    case "chat":
      return `You are a helpful, knowledgeable AI assistant. ${lang}
Be conversational, clear, and helpful. Provide accurate information and acknowledge uncertainty when you're not sure.`;

    default:
      return `You are a helpful AI assistant. ${lang}`;
  }
}

router.post("/tools/generate", async (req, res) => {
  try {
    const body = GenerateAiContentBody.parse(req.body);

    const systemPrompt = buildSystemPrompt(body.toolType, {
      language: body.language,
      tone: body.tone,
      platform: body.platform,
      programmingLanguage: body.programmingLanguage,
    });

    const model = body.toolType === "code" ? "gpt-5.2" : "gpt-5.2";

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullResponse = "";

    const stream = await openai.chat.completions.create({
      model,
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: body.prompt },
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    try {
      const userId = req.isAuthenticated() ? req.user.id : null;
      await db.insert(generationHistory).values({
        userId,
        toolType: body.toolType,
        prompt: body.prompt.substring(0, 1000),
        result: fullResponse.substring(0, 10000),
      });
    } catch (dbErr) {
      console.error("Failed to save history:", dbErr);
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    console.error(err);
    res.write(`data: ${JSON.stringify({ error: "Generation failed" })}\n\n`);
    res.end();
  }
});

router.get("/tools/history", async (_req, res) => {
  try {
    const rows = await db.select().from(generationHistory).orderBy(desc(generationHistory.createdAt)).limit(50);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get history" });
  }
});

export default router;
