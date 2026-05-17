import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", env: process.env.NODE_ENV, apiKeySet: !!process.env.GEMINI_API_KEY });
  });

  // API Routes
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, systemInstruction } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API key is not configured on the server." });
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: systemInstruction || "Você é o SISA AI, um assistente de saúde amigável e profissional."
      });

      const history = messages.slice(0, -1).map((m: any) => {
        const parts: any[] = [{ text: m.text || "" }];
        if (m.attachment) {
          parts.unshift({
            inlineData: {
              data: m.attachment.data,
              mimeType: m.attachment.type
            }
          });
        }
        return {
          role: m.role === 'user' ? 'user' : 'model',
          parts
        };
      });

      const lastMessage = messages[messages.length - 1];
      const lastParts: any[] = [{ text: lastMessage.text || "" }];
      if (lastMessage.attachment) {
        lastParts.unshift({
          inlineData: {
            data: lastMessage.attachment.data,
            mimeType: lastMessage.attachment.type
          }
        });
      }

      const chat = model.startChat({ history });
      const result = await chat.sendMessage(lastParts);
      const response = await result.response;
      
      res.json({ text: response.text() });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI response" });
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
