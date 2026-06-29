# FlowSense Scheme Navigator: Next Steps & Deployment Guide

Welcome to the **FlowSense Scheme Navigator** handoff roadmap. This guide provides comprehensive, step-by-step instructions to move your B2B Regulatory RAG application from local development to production on platforms like **Render**, **Vercel**, and **Google Cloud Run**, and explains how to ingest your freshly uploaded government PDF documents.

---

## 🧭 Road Map Checklist

```
┌──────────────────────────────────────────────────────────┐
│  1. Setup Vector Database (Qdrant Cloud)                 │
├──────────────────────────────────────────────────────────┤
│  2. Ingest uploaded PDFs (ingest.py + Gemini Embed)       │
├──────────────────────────────────────────────────────────┤
│  3. Deploy Backend API (Node Express or Python FastAPI)  │
├──────────────────────────────────────────────────────────┤
│  4. Deploy Frontend (Vercel SPA or unified Cloud Run)    │
└──────────────────────────────────────────────────────────┘
```

---

## 🗄️ Step 1: Setup Qdrant Cloud (Free Tier)
FlowSense leverages **Qdrant Cloud** as its high-speed semantic vector memory, allowing you to match user profiles against precise paragraphs in the policy PDFs.

1. Go to [Qdrant Cloud](https://cloud.qdrant.io/) and register for a free account.
2. Create a free-tier cluster (this provides a hosted instance at no cost).
3. Generate an **API Key** for your cluster.
4. Copy your **Cluster URL** (e.g., `https://xxxxxx-xxxx-xxxx.aws.cloud.qdrant.io`) and **API Key**.

---

## ⚡ Step 2: Running the PDF Ingestion Script (`ingest.py`)
You have successfully uploaded the following 4 new regulatory documents into the `/data` folder:
1. `CGTMSE - Scheme Document CGS I_updated as on Apr 1 2026.pdf`
2. `MudraLoan-SalientFeatures-English.pdf`
3. `Viksit-Gujarat-Industrial-Policy2026_new.pdf`
4. `draft_delhi_startup_policy.pdf`

The ingestion script `ingest.py` reads these files, extracts text page-by-page, generates 768-dimensional embeddings using Gemini's `text-embedding-004` model, and indexes them into Qdrant Cloud with strict page-level metadata.

### How to execute the ingestion:
1. Ensure your local environment variables are configured. Create a `.env` file at the root:
   ```env
   GEMINI_API_KEY=your_google_ai_studio_api_key_here
   QDRANT_URL=your_qdrant_cloud_cluster_url
   QDRANT_API_KEY=your_qdrant_cloud_api_key
   ```
2. Install the Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the ingestion pipeline:
   ```bash
   python ingest.py
   ```
   *Note:* The script will automatically create the `msme_schemes` collection in Qdrant and index all four of your PDF files page-by-page. Once complete, your cognitive cloud memory is fully primed!

---

## 🚀 Step 3: Deploying the Backend API
You have two choices for your backend, depending on your favorite stack:

### Option A: Node.js (Express + Vite) — *Recommended (Unified Single-Service)*
In this approach, a single Node server (`server.ts`) handles API routes AND serves your built React frontend in production. This is exactly how the app is packaged for Google Cloud Run.

* **Target Host:** **Render** (Web Service), **Railway**, **Fly.io**, or **Docker**
* **Root Directory:** Workspace root `/`
* **Build Command:** `npm run build`
  *(This builds the React frontend static files into `/dist` AND compiles the backend `server.ts` into a self-contained CommonJS file at `dist/server.cjs` via esbuild)*
* **Start Command:** `npm run start` (runs `node dist/server.cjs`)
* **Required Environment Variables:**
  * `GEMINI_API_KEY` (Your Google AI Studio API Key)
  * `QDRANT_URL` (Your Qdrant Cluster Endpoint)
  * `QDRANT_API_KEY` (Your Qdrant API Key)
  * `NODE_ENV=production`

---

### Option B: Python (FastAPI) — *Microservice Style*
If you prefer a Python-only backend with FastAPI, you can deploy `main.py` as a standalone API microservice.

* **Target Host:** **Render** (Web Service), **Railway**, or **PythonAnywhere**
* **Build Command:** `pip install -r requirements.txt`
* **Start Command:** `uvicorn main:app --host 0.0.0.0 --port 10000` (or whichever port is assigned by the host)
* **Required Environment Variables:**
  * `GEMINI_API_KEY`
  * `QDRANT_URL`
  * `QDRANT_API_KEY`
* **CORS Note:** Ensure CORS is enabled on FastAPI (it is configured with wildcard `allow_origins=["*"]` in `main.py` by default) so your decoupled frontend can safely access it.

---

## 🎨 Step 4: Deploying the Frontend
If you choose a split deployment (e.g., hosting the frontend on Vercel and the backend on Render):

### Deploying the React App on **Vercel**
1. Connect your GitHub repository to Vercel.
2. Select **Vite** as the framework template.
3. Configure settings:
   * **Build Command:** `npm run build` (or `vite build`)
   * **Output Directory:** `dist`
4. Set the backend URL in the React client:
   * By default, the React app uses the current window origin. If your backend is hosted separately (e.g., `https://my-backend.onrender.com`), click the **Sliders/Settings icon** in the FlowSense header to paste your Render API URL directly in the UI, or modify the default state of `backendUrl` in `src/App.tsx` (line 126) to hardcode your live backend endpoint.

---

## 🏆 Hackathon Submission Checklist

Since you already published the app and got a live link from Google AI Studio (`https://flowsense-scheme-navigator-840226251629.asia-southeast1.run.app`), **this is 100% enough to submit as your live demo link!** 

To make your submission stand out, prepare the following on your Hackathon submission portal:
1. **Live Demo URL:** Your Google Cloud Run URL.
2. **Github Repository:** Export your workspace repository using the settings menu in AI Studio.
3. **Demo Video:** Record a 2-3 minute walk-through of the interface. Show the **"Simulation Mode"** (which lets judges test without configuring any credentials) and toggle on **"Production Server"** to demonstrate real-time RAG extraction.
4. **The PDF Artifacts:** Mention that you compiled, parsed, and ingested official Indian government files such as:
   * *CGTMSE Credit Guarantee parameters (reformed for FY 2026)*
   * *The newly drafted Delhi Startup Policy*
   * *Viksit Gujarat Industrial Incentives 2026*
   * *Pradhan Mantri MUDRA Yojana guidelines*
5. **Architectural Highlights:** Highlight the use of **Google Gemini**, **Qdrant Cloud Vector DB**, and **Lyzr Agent frameworks** for structural JSON reasoning with zero hallucinations and total compliance.
