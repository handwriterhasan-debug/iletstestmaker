import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API Routes MUST go before Vite middleware
  app.post("/api/chat", async (req, res) => {
    try {
      const dbKey = process.env.VITE_GROQ_API_KEY || process.env.GEMINI_API_KEY;
      
      const { messages } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required." });
      }

      // Check if we use groq or gemini, but since we have gemini installed, let's use gemini.
      // Actually, wait, if the user explicitly provided VITE_GROQ_API_KEY, maybe they want groq. But we don't have groq SDK.
      // So let's use Gemini!
      
      const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ error: "API key is not configured on the server. Please add VITE_GEMINI_API_KEY." });
      }

      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = `You are Vorynix AI Copilot, an expert IELTS mentor. You help evaluate scores, suggest study plans, and answer test format questions. Keep responses concise, supportive, and formatted cleanly.`;
      
      const history = messages.slice(0, -1).map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.text }]
      }));
      
      const lastMessageElem = messages[messages.length - 1]?.text || "";

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
            ...history,
            { role: "user", parts: [{ text: lastMessageElem }] }
        ],
        config: {
           systemInstruction,
        }
      });

      const reply = response.text || "I'm having trouble processing that right now.";
      
      res.json({ reply });
    } catch (error) {
      console.error("AI Chat Error:", error);
      res.status(500).json({ error: "Failed to process chat message." });
    }
  });

  app.post("/api/generateContent", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
      if (!apiKey || apiKey === 'undefined' || apiKey === 'null') {
        return res.status(500).json({ error: "API key is not configured on the server." });
      }

      const ai = new GoogleGenAI({ apiKey });
      const { model, contents, config } = req.body;
      
      const response = await ai.models.generateContent({
        model: model || "gemini-2.5-flash",
        contents,
        config
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Generate Content Error:", error);
      res.status(error.status || 500).json({ error: error.message || error });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.use((req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Handle SPA 404 in dev mode
  app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/api/')) return next();
    if (process.env.NODE_ENV !== "production") {
      req.url = '/index.html';
      // Let vite handle the request
      return next();
    }
    next();
  });

  // Global Error Handler for APIs
  app.use((err: any, req: any, res: any, next: any) => {
    if (req.originalUrl.startsWith('/api/')) {
       console.error("API Error:", err);
       return res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
    }
    next(err);
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
