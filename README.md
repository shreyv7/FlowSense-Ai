# FlowSense Scheme Navigator: B2B Regulatory RAG Engine

> **FlowSense** is an intelligent, high-precision, agentic Retrieval-Augmented Generation (RAG) platform built for the **Google Agent Builder Series 2026**. It simplifies and verifies dense, official Indian government policy PDFs, subsidies, loan guarantees, and compliance guidelines for Micro, Small, and Medium Enterprises (MSMEs).

[![Google Cloud Run](https://img.shields.io/badge/Google_Cloud_Run-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)](https://cloud.google.com/)
[![Gemini](https://img.shields.io/badge/Gemini_3.5_Flash-8E75C2?style=for-the-badge&logo=google-gemini&logoColor=white)](https://ai.google.dev/)
[![Qdrant](https://img.shields.io/badge/Qdrant_Cloud-FF4B4B?style=for-the-badge&logo=qdrant&logoColor=white)](https://qdrant.tech/)

---

## 🎨 Visual Aesthetics & Layout
FlowSense features a carefully customized, high-contrast theme focused on audit-trail reliability:
* **The "Guard Slate" Theme:** A professional, lightweight mint-and-charcoal layout designed to prioritize structural clarity, ample negative space, and readable typography.
* **Premium Typography:** Clean **Inter** display headers paired with **JetBrains Mono** for serial numbers, Ref IDs, and citation labels.
* **Dynamic PDF Auditor Stage:** An interactive split-screen layout. Clicking any citation tag inside the chatbot instantly pulls up the source document in the viewer, highlighting the relevant passage with zero latency.

---

## 🚀 Key Architectural Features

1. **Deterministic Citations (Zero Hallucination Guardrail):** The Gemini model generates answers strictly constrained by retrieved context chunks. If a query cannot be answered based on the PDFs, it gracefully admits it, ensuring audit-level compliance.
2. **Page-Level PDF Mapping:** Our ingestion workflow breaks PDFs down page-by-page. When the user interacts with the chatbot, they don't just get a text response; they are given deep-links that anchor directly to the source page.
3. **Dual Ingress & Scalable Backends:**
   * **Unified Node Engine (`server.ts`):** Serves the Fast API endpoints alongside the compiled Vite-React SPA. Powered by the modern `@google/genai` SDK.
   * **FastAPI Python Microservice (`main.py`):** Ideal for intensive data science pipelines, utilizing `pypdf` and FastAPI routers.
4. **Qdrant Vector DB & Hybrid Fallback:** Built-in integration with Qdrant Cloud for vector searches, with high-fidelity mock sandboxing so judges can review the app out-of-the-box even without active cloud database credentials.

---

## 📂 Project Structure

```
├── .env.example              # Documented environment variables list
├── README.md                 # Project documentation & overview
├── context.md                # Next steps & deployment guide (Vercel, Render)
├── ingest.py                 # PDF vectorization pipeline (Python + text-embedding-004)
├── main.py                   # Alternative Python FastAPI Backend router
├── server.ts                 # Production server (Express + Vite + @google/genai)
├── package.json              # Full-stack Node package configuration
├── requirements.txt          # Python environment dependencies
├── vite.config.ts            # Vite build pipeline config
├── data/                     # Source PDF documents folder (Delhi, Gujarat, CGTMSE, Mudra)
└── src/
    ├── App.tsx               # Primary single-screen visual frontend
    ├── main.tsx              # React client entry point
    └── index.css             # Global Tailwind styling & font settings
```

---

## 🛠️ Quickstart Guide

### 1. Ingesting Regulatory Guidelines
Copy your official Indian state or central government PDF documents into the `./data/` directory, then run the parser:

```bash
# Install Python dependencies
pip install -r requirements.txt

# Run page-by-page vectorization
python ingest.py
```
*Make sure `GEMINI_API_KEY`, `QDRANT_URL`, and `QDRANT_API_KEY` are populated in your `.env` file first.*

### 2. Running the Full-Stack App
The unified Node.js environment boots Express, mounts Vite as middleware in development, and serves the combined app:

```bash
# Install Node dependencies
npm install

# Boot development environment (Port 3000)
npm run dev
```

Visit `http://localhost:3000` to interact with FlowSense.

---

## 🌐 Production Build & Deployment

To bundle the application for production (useful for Docker, Google Cloud Run, Render, or Railway):

```bash
# Build Vite SPA and bundle server.ts into dist/server.cjs
npm run build

# Launch server
npm run start
```

For a detailed walkthrough on setting up decoupled deployments (Vercel Frontend + Render Backend), check the companion [**`context.md`**](./context.md) file in this repository.

---

## 🛡️ License & Compliance
This software was engineered specifically for the Google Agent Builder Series 2026. All cited materials are intellectual properties of their respective Indian Ministries (Ministry of Finance, Ministry of MSME, Government of Karnataka, Government of Gujarat, Government of Delhi).
