import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Ensure Gemini Client is initialized with API Key
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

const COLLECTION_NAME = "msme_schemes";

interface Chunk {
  text: string;
  document_name: string;
  page_number: number;
}

const LOCAL_CHUNKS: Chunk[] = [
  {
    document_name: "Karnataka_IT_Policy_Guidelines.pdf",
    page_number: 1,
    text: "The Government of Karnataka has formulated the Karnataka Information Technology Policy 2020-2025 to promote development of Information Technology and Information Technology Enabled Services across the State. The policy focuses on boosting local innovation, generating over 6 million direct and indirect jobs, and enhancing digital infrastructure in Beyond Bengaluru clusters (Mysuru, Hubballi-Dharwad, Mangaluru)."
  },
  {
    document_name: "Karnataka_IT_Policy_Guidelines.pdf",
    page_number: 14,
    text: "Indian startups registered in Karnataka with a valid MSME certification and turnover under ₹2 Crore are eligible for a direct Capital Investment Subsidy of 10% on qualifying technical infrastructure and capital assets, up to a maximum cap of ₹25 Lakhs per entity. Furthermore, eligible entities can claim up to ₹5 Lakhs reimbursement for patent filing expenses (both Indian and international patents) and 100% PF reimbursement for female employees for the first three years."
  },
  {
    document_name: "CGTMSE_Guidelines_2026.pdf",
    page_number: 3,
    text: "The Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE) provides collateral-free credit facilities to Micro and Small Enterprises (MSEs) across India. Credit facilities including term loans and working capital can be covered. Micro enterprises with credit requirements up to ₹5 Lakh are provided guarantee cover of up to 85%. For women-led enterprises, North-East region units, and ZED-certified MSEs, special concessions apply including premium reductions."
  },
  {
    document_name: "CGTMSE_Guidelines_2026.pdf",
    page_number: 7,
    text: "Effective for the fiscal year 2026, the maximum credit ceiling under the CGTMSE collateral guarantee scheme is enhanced to ₹5 Crore (₹500 Lakhs) per eligible borrower. The guarantee cover ranges from 75% to 85% depending on borrower category and loan volume. Retail trade enterprises are also eligible for credit guarantee up to ₹1 Crore with standard guarantee coverage of 50% on default risk."
  },
  {
    document_name: "Mudra_Yojana_Framework.pdf",
    page_number: 4,
    text: "Pradhan Mantri MUDRA Yojana (PMMY) is a flagship government scheme that facilitates subsidized credit up to ₹10 Lakhs to non-corporate, non-farm small and micro enterprises. These loans are classified into three distinct categories based on growth phase and funding requirements: 1. SHISHU: Covering loan requirements up to ₹50,000. 2. KISHOR: Covering loan requirements from ₹50,000 up to ₹5 Lakhs. 3. TARUN: Covering loan requirements from ₹5 Lakhs up to ₹10 Lakhs."
  }
];

function getLocalContext(query: string): Chunk[] {
  const norm = query.toLowerCase();
  const results: Chunk[] = [];
  if (norm.includes("karnataka") || norm.includes("it policy") || norm.includes("turnover") || norm.includes("bangalore") || norm.includes("subsidy")) {
    results.push(LOCAL_CHUNKS[0], LOCAL_CHUNKS[1]);
  }
  if (norm.includes("cgtmse") || norm.includes("guarantee") || norm.includes("collateral") || norm.includes("workshop") || norm.includes("loan")) {
    results.push(LOCAL_CHUNKS[2], LOCAL_CHUNKS[3]);
  }
  if (norm.includes("mudra") || norm.includes("weaver") || norm.includes("varanasi") || norm.includes("loom")) {
    results.push(LOCAL_CHUNKS[4]);
  }
  if (results.length === 0) {
    return LOCAL_CHUNKS;
  }
  return results;
}

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    answer: {
      type: Type.STRING,
      description: "The synthesized, natural language answer anchored strictly in retrieved scheme guidelines",
    },
    citations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          document_name: {
            type: Type.STRING,
            description: "The exact filename of the cited regulatory PDF document",
          },
          page_number: {
            type: Type.INTEGER,
            description: "The physical page number within the cited document",
          },
        },
        required: ["document_name", "page_number"],
      },
      description: "Structured list of source references explicitly matching the facts returned in the answer",
    },
  },
  required: ["answer", "citations"],
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // CORS middleware for any external callers (e.g. Lovable frontend)
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // API endpoints
  app.get("/api/health", (req, res) => {
    res.json({
      status: "healthy",
      service: "FlowSense Scheme Navigator Backend",
      integrations: {
        gemini_api_configured: !!apiKey,
        qdrant_cloud_configured: !!(process.env.QDRANT_URL && process.env.QDRANT_API_KEY),
      },
    });
  });

  app.post("/api/chat", async (req, res) => {
    const { message, session_id } = req.body;
    console.log(`Received query: "${message}" (Session: ${session_id || "N/A"})`);

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "The message parameter cannot be empty." });
    }

    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not set on the server." });
    }

    let contexts: Chunk[] = [];
    const qdrantUrl = process.env.QDRANT_URL;
    const qdrantApiKey = process.env.QDRANT_API_KEY;

    if (qdrantUrl && qdrantApiKey) {
      try {
        console.log("Vector DB is configured. Generating query embedding...");
        const embedRes = await ai.models.embedContent({
          model: "text-embedding-004",
          contents: message,
        });
        const embedResAny = embedRes as any;
        const vector = embedResAny.embedding?.values || embedResAny.embeddings?.[0]?.values;

        if (vector) {
          const cleanUrl = qdrantUrl.replace(/\/+$/, "");
          const searchUrl = `${cleanUrl}/collections/${COLLECTION_NAME}/points/search`;
          console.log(`Searching Qdrant Cloud at: ${searchUrl}`);

          const response = await fetch(searchUrl, {
            method: "POST",
            headers: {
              "api-key": qdrantApiKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              vector: vector,
              limit: 5,
              with_payload: true,
            }),
          });

          if (response.ok) {
            const data: any = await response.json();
            const results = data.result || [];
            console.log(`Retrieved ${results.length} relevant matches from Qdrant Cloud.`);
            contexts = results.map((hit: any) => ({
              text: hit.payload?.text || "",
              document_name: hit.payload?.document_name || "Unknown_Document.pdf",
              page_number: hit.payload?.page_number || 0,
            }));
          } else {
            console.warn(`Qdrant search API returned status: ${response.status}`);
          }
        }
      } catch (err) {
        console.error("Failed querying Qdrant Cloud cluster:", err);
      }
    }

    // Fallback to high-fidelity local chunks context if nothing was retrieved
    if (contexts.length === 0) {
      console.log("Qdrant collection not queried or empty. Utilizing local context chunks fallback...");
      contexts = getLocalContext(message);
    }

    const contextBlock = contexts
      .map((ctx, idx) => `[Source ${idx + 1}: ${ctx.document_name} (Page ${ctx.page_number})]\n${ctx.text}`)
      .join("\n\n");

    const systemInstruction = `You are the expert B2B Scheme Navigator cognitive agent built for the Google Agent Builder Series 2026.
Your objective is to help Indian Micro, Small, and Medium Enterprises (MSMEs) discover government subsidies, treasury grants, tax incentives, and loan schemes based purely on the provided Context below.

STRICT RULES:
1. Anchor your claims strictly inside the retrieved Context. Do not synthesize or assume numbers, percentages, or eligibility metrics.
2. If the user's query cannot be answered based on the context, set the answer field exactly to: 'I cannot find this in the provided documents.' and citations list empty.
3. For every financial subsidy, credit scheme, or benefit claim you make in your answer, you MUST cite its direct source document_name and page_number.
4. Return a structured JSON response matching the requested schema layout.

--- START RETRIEVED CONTEXT ---
${contextBlock}
--- END RETRIEVED CONTEXT ---`;

    try {
      console.log("Generating cited answer report with Gemini 3.5 Flash...");
      const geminiRes = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `User Query: ${message}\nSynthesize cited report matching the strict schema layout.`,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          temperature: 0.1,
        },
      });

      const text = geminiRes.text;
      if (!text) {
        throw new Error("Empty text returned from Gemini API");
      }

      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (err: any) {
      console.error("Gemini processing error:", err);
      res.status(500).json({
        answer: `An error occurred while synthesizing the response: ${err.message}. Please verify server secrets configuration.`,
        citations: [],
      });
    }
  });

  // Vite integration
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
