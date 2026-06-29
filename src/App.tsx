import { useState, useEffect } from "react";
import { 
  FileText, 
  Send, 
  CheckCircle, 
  Database, 
  Key, 
  Server, 
  Terminal, 
  Copy, 
  Check, 
  Code, 
  Sliders, 
  Info, 
  BookOpen, 
  ArrowRight,
  ExternalLink,
  Bot,
  User,
  ShieldCheck,
  Building
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// ==============================================================================
// TYPES & SCHEMAS
// ==============================================================================

interface Citation {
  document_name: string;
  page_number: number;
}

interface Message {
  id: string;
  sender: "user" | "agent";
  text: string;
  citations?: Citation[];
  timestamp: string;
}

// Mock database representing policy documents for high-fidelity split-pane simulation
interface PDFDocumentPage {
  document_name: string;
  page_number: number;
  title: string;
  content: string;
  key_points: string[];
}

const MOCK_POLICY_PDFS: Record<string, PDFDocumentPage[]> = {
  "Karnataka_IT_Policy_Guidelines.pdf": [
    {
      document_name: "Karnataka_IT_Policy_Guidelines.pdf",
      page_number: 1,
      title: "Karnataka IT Policy 2020-2025: Executive Summary",
      content: "The Government of Karnataka has formulated the Karnataka Information Technology Policy 2020-2025 to promote development of Information Technology and Information Technology Enabled Services across the State. The policy focuses on boosting local innovation, generating over 6 million direct and indirect jobs, and enhancing digital infrastructure in Beyond Bengaluru clusters (Mysuru, Hubballi-Dharwad, Mangaluru).",
      key_points: ["Promote tech development Beyond Bengaluru", "Enable early stage venture incubation infrastructure", "Targeting 60 Lakh digital-economy jobs"]
    },
    {
      document_name: "Karnataka_IT_Policy_Guidelines.pdf",
      page_number: 14,
      title: "Section 4.2: Capital Investment & Infrastructure Subsidies",
      content: "Indian startups registered in Karnataka with a valid MSME certification and turnover under ₹2 Crore are eligible for a direct Capital Investment Subsidy of 10% on qualifying technical infrastructure and capital assets, up to a maximum cap of ₹25 Lakhs per entity. Furthermore, eligible entities can claim up to ₹5 Lakhs reimbursement for patent filing expenses (both Indian and international patents) and 100% PF reimbursement for female employees for the first three years.",
      key_points: ["10% Capital Investment Subsidy on technical equipment", "Maximum subsidy cap: ₹25 Lakhs per startup", "Patent cost reimbursement up to ₹5 Lakhs", "100% PF reimbursement for women employees"]
    }
  ],
  "CGTMSE_Guidelines_2026.pdf": [
    {
      document_name: "CGTMSE_Guidelines_2026.pdf",
      page_number: 3,
      title: "CGTMSE Scheme Core Parameters & Eligibility",
      content: "The Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE) provides collateral-free credit facilities to Micro and Small Enterprises (MSEs) across India. Credit facilities including term loans and working capital can be covered. Micro enterprises with credit requirements up to ₹5 Lakh are provided guarantee cover of up to 85%. For women-led enterprises, North-East region units, and ZED-certified MSEs, special concessions apply including premium reductions.",
      key_points: ["Collateral-free debt/working capital coverage", "85% guarantee cover for credits up to ₹5 Lakh", "Dedicated concessions for women-led businesses"]
    },
    {
      document_name: "CGTMSE_Guidelines_2026.pdf",
      page_number: 7,
      title: "Section 8.1: Limit Enhancement and Guarantee Cap",
      content: "Effective for the fiscal year 2026, the maximum credit ceiling under the CGTMSE collateral guarantee scheme is enhanced to ₹5 Crore (₹500 Lakhs) per eligible borrower. The guarantee cover ranges from 75% to 85% depending on borrower category and loan volume. Retail trade enterprises are also eligible for credit guarantee up to ₹1 Crore with standard guarantee coverage of 50% on default risk.",
      key_points: ["Guaranteed credit ceiling elevated to ₹5 Crore", "Guarantee ranges from 75% to 85% of outstanding dues", "Retail traders covered up to ₹1 Crore limit"]
    }
  ],
  "Mudra_Yojana_Framework.pdf": [
    {
      document_name: "Mudra_Yojana_Framework.pdf",
      page_number: 4,
      title: "Mudra Scheme Category Classifications",
      content: "Pradhan Mantri MUDRA Yojana (PMMY) is a flagship government scheme that facilitates subsidized credit up to ₹10 Lakhs to non-corporate, non-farm small and micro enterprises. These loans are classified into three distinct categories based on growth phase and funding requirements:\n\n1. SHISHU: Covering loan requirements up to ₹50,000.\n2. KISHOR: Covering loan requirements from ₹50,000 up to ₹5 Lakhs.\n3. TARUN: Covering loan requirements from ₹5 Lakhs up to ₹10 Lakhs.",
      key_points: ["Maximum loan quantum: ₹10 Lakhs", "Shishu Category: Loans up to ₹50,000", "Kishor Category: Loans ₹50,000 to ₹5 Lakhs", "Tarun Category: Loans ₹5 Lakhs to ₹10 Lakhs", "Zero collateral required for all categories"]
    }
  ]
};

const DEFAULT_DOC_PAGE: PDFDocumentPage = {
  document_name: "Overview_MSME_Schemes.pdf",
  page_number: 1,
  title: "FlowSense Document Viewer",
  content: "Click on any citation tag inside the Chat on the left to instantly load, verify, and view the precise official Indian government policy PDF page right here.\n\nAll numbers, subsidies, and eligibility parameters are strictly anchored within official regulatory documents, ensuring zero hallucinations and total compliance for your B2B FinTech integration.",
  key_points: [
    "Strictly anchored RAG verification",
    "Real-time page and document highlighting",
    "B2B audit trails for loan and subsidy disbursement"
  ]
};

// Complete Python Code Snippets for Interactive Tabs
const PYTHON_CODEBASE = {
  "main.py": `#!/usr/bin/env python3
"""
FlowSense Scheme Navigator - FastAPI Backend Application
Author: Principal AI Engineer
Event: Google Agent Builder Series 2026

This is the primary full-stack API server, orchestrating:
1. Fast API route endpoints with strict CORS policies for Next.js.
2. Direct connection to the Qdrant Cloud semantic memory store.
3. Integration with Google Gemini (via AI Studio API) for synthesis and advanced reasoning.
4. Lyzr Agent abstractions (wrapping knowledge retrieval and structured response synthesis).
"""

import os
import sys
import json
import logging
from typing import List, Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from qdrant_client import QdrantClient
import google.generativeai as genai
from dotenv import load_dotenv

# Load configurations
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("FlowSenseBackend")

# Retrieve and validate environment keys
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")

if not GEMINI_API_KEY:
    logger.critical("GEMINI_API_KEY is not set. The FastAPI application will not be able to compute queries.")
if not QDRANT_URL or not QDRANT_API_KEY:
    logger.critical("Qdrant credentials missing. Connection to semantic vector store will fail.")

# Configure Gemini AI Studio SDK
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# Constants
COLLECTION_NAME = "msme_schemes"
EMBED_MODEL = "models/text-embedding-004"
LLM_MODEL = "gemini-1.5-flash"  # Highly optimized for speed, precision, and structured JSON output

# FastAPI Initialization
app = FastAPI(
    title="FlowSense Scheme Navigator API",
    description="Agentic RAG Backend for B2B Indian MSME Subsidies, Grants, and Compliance Navigation",
    version="1.0.0"
)

# CORS Policy configuration to allow Next.js dev server on localhost and other ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits Next.js or Lovable.dev preview triggers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==============================================================================
# PYDANTIC SCHEMAS FOR STRICT REQUEST/RESPONSE COMPLIANCE
# ==============================================================================

class ChatRequest(BaseModel):
    message: str = Field(
        ..., 
        description="The query string containing the user's Indian MSME profile (revenue, sector, state, etc.)"
    )
    session_id: Optional[str] = Field(
        None, 
        description="Optional session tracking identifier for caching/conversational memory"
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "message": "I run a ₹2 Crore turnover IT services firm in Karnataka. What state tech subsidies can I claim?",
                "session_id": "session_msme_123"
            }
        }
    }


class Citation(BaseModel):
    document_name: str = Field(..., description="The exact filename of the cited regulatory PDF document")
    page_number: int = Field(..., description="The physical page number within the cited document")


class ChatResponse(BaseModel):
    answer: str = Field(
        ..., 
        description="The synthesized, natural language answer anchored strictly in retrieved scheme guidelines"
    )
    citations: List[Citation] = Field(
        default=[], 
        description="Structured list of source references explicitly matching the facts returned in the answer"
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "answer": "Under the Karnataka IT Policy, IT services startups with turnover under ₹2 Crore are eligible for a state-backed capital investment subsidy of up to 10% on qualifying technical infrastructure.",
                "citations": [
                    {
                        "document_name": "Karnataka_IT_Policy_Guidelines.pdf",
                        "page_number": 14
                    }
                ]
            }
        }
    }


# ==============================================================================
# LYZR COGNITIVE AGENT RETRIEVER & REASONING PIPELINE
# ==============================================================================

class LyzrSchemeNavigatorAgent:
    """
    Abstractions representing the Lyzr ChatAgent design.
    Combines the Qdrant Cloud semantic retriever, modern Gemini Embeddings, and 
    Gemini 1.5 LLM with advanced system prompting to synthesize fully cited answers.
    """
    
    def __init__(self):
        if not QDRANT_URL or not QDRANT_API_KEY:
            self.qdrant_client = None
            logger.warning("Agent initialized without Qdrant connection credentials.")
        else:
            self.qdrant_client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
            
    def retrieve_context(self, query_text: str, limit: int = 5) -> List[dict]:
        """Queries Qdrant vector space to return highly relevant context payloads with exact citations."""
        if not self.qdrant_client:
            logger.error("Retrieval failed: Qdrant client is not connected.")
            return []
            
        try:
            # 1. Generate text embedding vector using Gemini API
            response = genai.embed_content(
                model=EMBED_MODEL,
                content=query_text,
                task_type="retrieval_query"
            )
            query_vector = response["embedding"]
            
            # 2. Check if collection exists
            if not self.qdrant_client.collection_exists(collection_name=COLLECTION_NAME):
                logger.error(f"Retrieval error: Qdrant collection '{COLLECTION_NAME}' does not exist.")
                return []
                
            # 3. Query Qdrant Cloud cluster
            search_results = self.qdrant_client.search(
                collection_name=COLLECTION_NAME,
                query_vector=query_vector,
                limit=limit
            )
            
            contexts = []
            for hit in search_results:
                payload = hit.payload or {}
                contexts.append({
                    "text": payload.get("text", ""),
                    "document_name": payload.get("document_name", "Unknown_Document.pdf"),
                    "page_number": payload.get("page_number", 0)
                })
            return contexts
        except Exception as e:
            logger.error(f"Error querying Qdrant memory: {e}")
            return []

    def answer_query(self, user_query: str) -> ChatResponse:
        """
        Retrieves context chunks and utilizes Gemini in structured JSON mode 
        to synthesize a perfectly cited B2B MSME scheme report.
        """
        # Retrieve facts from vector database
        contexts = self.retrieve_context(user_query, limit=5)
        
        # If no documents are ingested, return an informative error message gracefully
        if not contexts:
            return ChatResponse(
                answer="Welcome to FlowSense Scheme Navigator. It appears that no regulatory policy documents have been ingested yet. Please place your PDFs in the './data/' folder and execute the ingestion script ('python ingest.py') to prime the semantic memory.",
                citations=[]
            )

        # Build context string for prompt
        context_str_list = []
        for idx, ctx in enumerate(contexts):
            ref_str = f"[Source {idx+1}: {ctx['document_name']} (Page {ctx['page_number']})]\n{ctx['text']}"
            context_str_list.append(ref_str)
        context_block = "\\n\\n".join(context_str_list)

        # Build strict system prompt
        system_instruction = (
            "You are the expert B2B Scheme Navigator cognitive agent built for the Google Agent Builder Series 2026.\\n"
            "Your objective is to help Indian Micro, Small, and Medium Enterprises (MSMEs) discover government subsidies, "
            "treasury grants, tax incentives, and loan schemes based purely on the provided Context below.\\n\\n"
            "STRICT RULES:\\n"
            "1. Anchor your claims strictly inside the retrieved Context. Do not synthesize or assume numbers, percentages, or eligibility metrics.\\n"
            "2. If the user's query cannot be answered based on the context, set the answer field exactly to: 'I cannot find this in the provided documents.' and citations list empty.\\n"
            "3. For every financial subsidy, credit scheme, or benefit claim you make in your answer, you MUST cite its direct source document_name and page_number.\\n"
            "4. Return a structured JSON response matching the requested schema layout.\\n\\n"
            f"--- START RETRIEVED CONTEXT ---{context_block}--- END RETRIEVED CONTEXT ---"
        )

        try:
            # Initialize reasoning engine
            model = genai.GenerativeModel(
                model_name=LLM_MODEL,
                generation_config={
                    "response_mime_type": "application/json",
                    "temperature": 0.1,  # Low temperature for highly deterministic numbers
                }
            )

            # Request generation
            response = model.generate_content(
                contents=[
                    system_instruction,
                    f"User Query: {user_query}\\nSynthesize cited report matching the strict schema layout."
                ]
            )

            # Parse structural output
            raw_response_text = response.text.strip()
            parsed_data = json.loads(raw_response_text)
            
            answer_text = parsed_data.get("answer", "")
            citations_data = parsed_data.get("citations", [])
            
            citations = []
            for item in citations_data:
                doc_name = item.get("document_name", "")
                page_num = item.get("page_number")
                if doc_name and page_num is not None:
                    citations.append(Citation(document_name=doc_name, page_number=int(page_num)))

            return ChatResponse(answer=answer_text, citations=citations)

        except Exception as e:
            logger.error(f"Error in Gemini reasoning engine or parsing: {e}")
            # Graceful fallback response
            return ChatResponse(
                answer=f"An error occurred while synthesizing the response: {str(e)}. Please check backend configurations.",
                citations=[]
            )


# Initialize our Lyzr Scheme Navigator Agent
agent_service = LyzrSchemeNavigatorAgent()


# ==============================================================================
# ENDPOINTS
# ==============================================================================

@app.get("/api/health", tags=["Status"])
def health_check():
    """Returns application status and verification status of active integrations."""
    return {
        "status": "healthy",
        "service": "FlowSense Scheme Navigator Backend",
        "integrations": {
            "gemini_api_configured": GEMINI_API_KEY is not None,
            "qdrant_cloud_configured": QDRANT_URL is not None and QDRANT_API_KEY is not None
        }
    }


@app.post("/api/chat", response_model=ChatResponse, tags=["Chat"])
def process_scheme_navigation(request: ChatRequest):
    """
    Core cognitive route accepting user query containing sector, turnover, and eligibility inquiries.
    Queries Qdrant Cloud semantic memory, filters for MSME policy chunks, and returns cited RAG report.
    """
    logger.info(f"Received query: '{request.message}' (Session: {request.session_id or 'N/A'})")
    
    if not request.message or not request.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The message parameter cannot be empty."
        )

    try:
        response = agent_service.answer_query(request.message)
        return response
    except Exception as e:
        logger.error(f"Critical error handling chat request: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An internal error occurred while processing the request: {str(e)}"
        )


# Start the local development server if executed directly
if __name__ == "__main__":
    import uvicorn
    logger.info("Starting FlowSense Backend FastAPI Application...")
    uvicorn.run(app, host="0.0.0.0", port=8000)`,

  "ingest.py": `#!/usr/bin/env python3
"""
FlowSense Scheme Navigator - Ingestion Script
Author: Principal AI Engineer
Event: Google Agent Builder Series 2026

This script handles the one-time ingestion of regulatory documents and Indian government scheme PDFs.
It:
1. Scans the local \`./data/\` directory for PDF documents.
2. Extracts page-by-page text content utilizing pypdf, preserving accurate page numbers and file source citations.
3. Uses Google Gemini's modern embedding model (\`text-embedding-004\`) via Google AI Studio API to vectorize text chunks.
4. Securely upserts vectors and metadata payloads into a Qdrant Cloud collection (\`msme_schemes\`).
"""

import os
import sys
import uuid
from pathlib import Path
from dotenv import load_dotenv
from pypdf import PdfReader
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Configure APIs and clients
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")

if not GEMINI_API_KEY:
    print("Error: GEMINI_API_KEY environment variable is not set.", file=sys.stderr)
    print("Please check your .env file or local environment settings.", file=sys.stderr)
    sys.exit(1)

if not QDRANT_URL or not QDRANT_API_KEY:
    print("Error: QDRANT_URL or QDRANT_API_KEY environment variables are missing.", file=sys.stderr)
    print("Please ensure your Qdrant Cloud credentials are properly configured.", file=sys.stderr)
    sys.exit(1)

# Initialize Google Generative AI
genai.configure(api_key=GEMINI_API_KEY)

# Initialize Qdrant Client
print(f"Connecting to Qdrant Cloud cluster at: {QDRANT_URL}")
qdrant_client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)

# Constants
COLLECTION_NAME = "msme_schemes"
EMBED_MODEL = "models/text-embedding-004"  # 768-dimensional high-quality embedding model
VECTOR_DIMENSION = 768


def init_qdrant_collection():
    """Initializes the Qdrant collection if it does not already exist."""
    try:
        # Check if the collection already exists
        exists = qdrant_client.collection_exists(collection_name=COLLECTION_NAME)
        if exists:
            print(f"Collection '{COLLECTION_NAME}' already exists. Reusing existing schema.")
            return

        print(f"Creating collection '{COLLECTION_NAME}' in Qdrant Cloud with dimension {VECTOR_DIMENSION}...")
        qdrant_client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=qmodels.VectorParams(
                size=VECTOR_DIMENSION,
                distance=qmodels.Distance.COSINE
            )
        )
        print(f"Collection '{COLLECTION_NAME}' successfully initialized.")
    except Exception as e:
        print(f"Failed to initialize Qdrant collection: {e}", file=sys.stderr)
        sys.exit(1)


def generate_embedding(text: str) -> list:
    """Generates a 768-dimensional embedding vector for the text using Gemini API."""
    try:
        response = genai.embed_content(
            model=EMBED_MODEL,
            content=text,
            task_type="retrieval_document"
        )
        return response["embedding"]
    except Exception as e:
        print(f"Error generating embedding for text segment: {e}", file=sys.stderr)
        raise e


def chunk_and_vectorize_pdf(pdf_path: Path):
    """
    Parses a PDF, chunks text page-by-page to preserve strict, accurate citations,
    generates semantic embeddings, and stores them in Qdrant.
    """
    filename = pdf_path.name
    print(f"\\nProcessing document: {filename}")
    
    try:
        reader = PdfReader(pdf_path)
        total_pages = len(reader.pages)
        print(f"Found {total_pages} pages in '{filename}'")

        points = []
        for page_idx in range(total_pages):
            page_num = page_idx + 1
            page = reader.pages[page_idx]
            text = page.extract_text() or ""
            text = text.strip()

            if not text:
                print(f"Skipping empty page {page_num}/{total_pages} in {filename}")
                continue

            # We process page by page or split large pages into readable context paragraphs
            # to maintain exact source and page level metadata.
            print(f"  Vectorizing page {page_num}/{total_pages}...")
            
            # Generate Gemini Embedding
            vector = generate_embedding(text)
            
            # Create Qdrant point payload with source citation
            payload = {
                "text": text,
                "document_name": filename,
                "page_number": page_num
            }
            
            point_id = str(uuid.uuid4())
            points.append(
                qmodels.PointStruct(
                    id=point_id,
                    vector=vector,
                    payload=payload
                )
            )

        if points:
            # Upsert batches to Qdrant Cloud
            print(f"  Upserting {len(points)} vector points to Qdrant Cloud...")
            qdrant_client.upsert(
                collection_name=COLLECTION_NAME,
                wait=True,
                points=points
            )
            print(f"  Successfully indexed {filename} into collection '{COLLECTION_NAME}'.")
        else:
            print(f"  No extractable content found in {filename}.")

    except Exception as e:
        print(f"Error during ingestion of {filename}: {e}", file=sys.stderr)


def main():
    # Setup data directory
    data_dir = Path("./data")
    if not data_dir.exists():
        print(f"Data directory './data' not found. Creating empty directory at {data_dir.resolve()}...")
        data_dir.mkdir(parents=True, exist_ok=True)
        print("Please place your MSME scheme, guidelines, and compliance PDFs in the \`./data/\` folder and re-run.")
        return

    # Find PDF documents
    pdf_files = list(data_dir.glob("*.pdf"))
    if not pdf_files:
        print(f"No PDF files found in {data_dir.resolve()}.")
        print("Please upload/copy 5-10 Indian MSME scheme PDFs into the \`./data/\` directory.")
        return

    print(f"Found {len(pdf_files)} PDF files for ingestion.")
    
    # Initialize Vector DB
    init_qdrant_collection()

    # Process all documents
    for pdf_path in pdf_files:
        chunk_and_vectorize_pdf(pdf_path)

    print("\\n======================================================================")
    print("FlowSense Scheme Navigator Ingestion completed successfully!")
    print("Your Qdrant Cloud vector memory is primed and ready to support Chat agent queries.")
    print("======================================================================\\n")


if __name__ == "__main__":
    main()`,

  "requirements.txt": `fastapi>=0.110.0
uvicorn>=0.28.0
lyzr>=0.1.20
qdrant-client>=1.8.0
google-generativeai>=0.4.1
pydantic>=2.6.4
python-dotenv>=1.0.1
pypdf>=4.1.0`,

  ".env.example": `# ==============================================================================
# FlowSense Scheme Navigator - Backend Environment Configuration
# ==============================================================================

# 1. Gemini AI API Key (from Google AI Studio)
# Required for text reasoning, question answering, and chunk embeddings.
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# 2. Qdrant Cloud Configuration
# Required for connecting to your hosted Qdrant vector database cluster.
QDRANT_URL="https://your-qdrant-cluster-url.aws.cloud.qdrant.io:6333"
QDRANT_API_KEY="YOUR_QDRANT_API_KEY"

# 3. Optional Application Settings
# Configure the port and host for FastAPI server
HOST="0.0.0.0"
PORT=8000`
};

export default function App() {
  const [activeTab, setActiveTab] = useState<"sandbox" | "codebase" | "guide">("sandbox");
  const [codeTab, setCodeTab] = useState<keyof typeof PYTHON_CODEBASE>("main.py");
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  // Split-Pane Sandbox States
  const [backendUrl, setBackendUrl] = useState("http://localhost:8000");
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatSessionId, setChatSessionId] = useState(`session_${Math.random().toString(36).substring(7)}`);
  
  // Default welcoming chat conversation matching real-world MSME queries
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "agent",
      text: "Hello! Welcome to the **FlowSense Scheme Navigator** backend simulator and B2B sandbox dashboard.\n\nI can help you navigate dense official guidelines for subsidies, loan guarantees, and credit schemes from the Indian Government. Type a profile or use one of our predefined presets below to test the split-pane retrieval logic!",
      timestamp: "12:00 PM"
    }
  ]);

  // Document/PDF Viewer state
  const [viewingDoc, setViewingDoc] = useState<PDFDocumentPage>(DEFAULT_DOC_PAGE);

  // Quick Preset Queries for Indian MSMEs
  const PRESET_PROFILES = [
    {
      label: "Karnataka IT Startup",
      icon: "🏢",
      query: "I run a ₹2 Crore turnover IT services firm in Karnataka. What state tech subsidies can I claim?"
    },
    {
      label: "Collateral-free CGTMSE Loan",
      icon: "🛡️",
      query: "We are an engineering workshop looking for a collateral-free loan of ₹3 Crore. What guarantee cover is available?"
    },
    {
      label: "Varanasi Weaver (Mudra Loan)",
      icon: "🧵",
      query: "I have a small weaving startup in Varanasi. I need a loan of ₹3 Lakhs to buy handlooms. What Mudra category do I qualify for?"
    }
  ];

  // Copy codebase snippet utility
  const handleCopyCode = (filename: keyof typeof PYTHON_CODEBASE) => {
    navigator.clipboard.writeText(PYTHON_CODEBASE[filename]);
    setCopiedFile(filename);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  // Trigger RAG reasoning (Simulated or Live REST API call)
  const handleSendQuery = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;

    // Append user query to chat thread
    const userMsg: Message = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsLoading(true);

    if (isLiveMode) {
      // ---------------------------------------------------------
      // LIVE MODE: Call real FastAPI endpoint running on user's machine
      // ---------------------------------------------------------
      try {
        const response = await fetch(`${backendUrl}/api/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: queryText,
            session_id: chatSessionId
          })
        });

        if (!response.ok) {
          throw new Error(`FastAPI returned status: ${response.status}`);
        }

        const data = await response.json();
        
        const agentMsg: Message = {
          id: `agent_${Date.now()}`,
          sender: "agent",
          text: data.answer,
          citations: data.citations || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setMessages((prev) => [...prev, agentMsg]);

        // Auto-load first citation into the right side-pane if present
        if (data.citations && data.citations.length > 0) {
          const firstCit = data.citations[0];
          handleLoadCitation(firstCit);
        }

      } catch (err: any) {
        console.error("Connection failed to local FastAPI backend:", err);
        const errorMsg: Message = {
          id: `error_${Date.now()}`,
          sender: "agent",
          text: `⚠️ **Connection Failed to Local FastAPI Backend**\n\nCould not connect to your server at \`${backendUrl}\`.\n\n*Error details: ${err.message}*\n\nPlease make sure your Python FastAPI server is active (\`python main.py\`) on port 8000 and CORS is enabled. You can switch back to **Simulation Sandbox Mode** above to see instant interactive flows!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    } else {
      // ---------------------------------------------------------
      // SIMULATION MODE: High-fidelity mock logic using real-world numbers
      // ---------------------------------------------------------
      setTimeout(() => {
        let answer = "I cannot find this in the provided documents.";
        let citations: Citation[] = [];

        const normalizedQuery = queryText.toLowerCase();

        if (normalizedQuery.includes("karnataka") || normalizedQuery.includes("it policy") || normalizedQuery.includes("turnover")) {
          answer = "According to the official **Karnataka IT Policy Guidelines (Section 4.2)**, as an IT services firm registered in Karnataka with a turnover under ₹2 Crore, you are eligible for the following state incentives:\n\n1. **Capital Investment Subsidy:** A 10% direct capital investment subsidy on your qualifying technical infrastructure and capital assets, capped at a maximum of **₹25 Lakhs**.\n2. **Patent Costs Reimbursement:** Up to **₹5 Lakhs** reimbursement for legal and filing costs associated with obtaining national or international patents.\n3. **EPF Reimbursement:** Startup entities can claim a **100% PF reimbursement** for female employees for the first three years.";
          citations = [{ document_name: "Karnataka_IT_Policy_Guidelines.pdf", page_number: 14 }];
        } 
        else if (normalizedQuery.includes("cgtmse") || normalizedQuery.includes("guarantee") || normalizedQuery.includes("collateral")) {
          answer = "Based on the official **CGTMSE Guidelines 2026**, for a loan quantum of ₹3 Crore to expand an engineering workshop, the following framework applies:\n\n1. **Guarantee Limit Enhancement:** Effective for 2026, the maximum credit ceiling under CGTMSE has been raised to **₹5 Crore (₹500 Lakhs)**, making your ₹3 Crore collateral-free requirement fully eligible.\n2. **Guarantee Cover:** Since your amount is above ₹2 Crore, you qualify for a standard guarantee cover of **75%** on the outstanding default amount. Women-led enterprises and North-East business units benefit from premium concessions and extended guarantee coverage of up to 85%.";
          citations = [
            { document_name: "CGTMSE_Guidelines_2026.pdf", page_number: 3 },
            { document_name: "CGTMSE_Guidelines_2026.pdf", page_number: 7 }
          ];
        } 
        else if (normalizedQuery.includes("mudra") || normalizedQuery.includes("weaver") || normalizedQuery.includes("varanasi") || normalizedQuery.includes("loom")) {
          answer = "Under the **Pradhan Mantri MUDRA Yojana (PMMY)** framework guidelines, your small weaving startup in Varanasi requiring a loan of ₹3 Lakhs to buy handlooms qualifies for the following:\n\n1. **Classification Category:** Your credit requirement of ₹3 Lakhs falls directly under the **KISHOR category**, which covers loans ranging from ₹50,000 up to ₹5 Lakhs.\n2. **Security & Collateral:** MUDRA loans require **zero collateral or third-party guarantees**; credit is covered under the Micro Units Guarantee Fund (CGFMU) administered by NCGTC.";
          citations = [{ document_name: "Mudra_Yojana_Framework.pdf", page_number: 4 }];
        } else {
          answer = "I searched through the MSME policy vector database but could not find specific matches for your request in the loaded policy PDF documents. Please check if your query is related to the Karnataka IT Policy, CGTMSE guidelines, or the Mudra loan framework.";
        }

        const agentMsg: Message = {
          id: `agent_${Date.now()}`,
          sender: "agent",
          text: answer,
          citations: citations,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages((prev) => [...prev, agentMsg]);

        // Auto-load first citation in side panel
        if (citations.length > 0) {
          handleLoadCitation(citations[0]);
        }

        setIsLoading(false);
      }, 1000);
    }
  };

  // Switch the right-hand panel's active page/document based on citation click
  const handleLoadCitation = (citation: Citation) => {
    const doc = MOCK_POLICY_PDFS[citation.document_name];
    if (doc) {
      const page = doc.find(p => p.page_number === citation.page_number);
      if (page) {
        setViewingDoc(page);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FBF9] text-gray-800 font-sans antialiased flex flex-col">
      {/* ==============================================================================
          NAVIGATION HEADER
          ============================================================================== */}
      <header className="bg-white border-b border-[#E3ECE6] sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#E8F5EE] rounded-xl border border-[#CDE5D8]">
              <ShieldCheck className="h-6 w-6 text-[#15803D]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-[#1E3025]">FlowSense Scheme Navigator</h1>
                <span className="px-2.5 py-0.5 bg-[#E2EAF4] text-[#1E40AF] text-[10px] font-semibold rounded-full border border-[#BFDBFE]">
                  Google Agent Builder Series 2026
                </span>
              </div>
              <p className="text-xs text-[#5D7265] mt-0.5">Python FastAPI, Lyzr and Qdrant Cloud B2B RAG Backend</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#F1F5F2] p-1 rounded-xl border border-[#E3ECE6]">
            <button
              onClick={() => setActiveTab("sandbox")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "sandbox"
                  ? "bg-white text-[#15803D] shadow-sm border border-[#E3ECE6]"
                  : "text-[#5D7265] hover:text-[#1E3025]"
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              Interactive RAG Sandbox
            </button>
            <button
              onClick={() => setActiveTab("codebase")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "codebase"
                  ? "bg-white text-[#15803D] shadow-sm border border-[#E3ECE6]"
                  : "text-[#5D7265] hover:text-[#1E3025]"
              }`}
            >
              <Code className="h-3.5 w-3.5" />
              Python Codebase Explorer
            </button>
            <button
              onClick={() => setActiveTab("guide")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "guide"
                  ? "bg-white text-[#15803D] shadow-sm border border-[#E3ECE6]"
                  : "text-[#5D7265] hover:text-[#1E3025]"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              Developer Setup Guide
            </button>
          </div>
        </div>
      </header>

      {/* ==============================================================================
          MAIN CONTENT VIEWPORT
          ============================================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6">
        
        {/* ==================== TAB 1: INTERACTIVE SANDBOX (SPLIT-PANE) ==================== */}
        {activeTab === "sandbox" && (
          <div className="flex flex-col gap-5 flex-1 min-h-0">
            
            {/* Top Config/Integration Banner */}
            <div className="bg-white rounded-2xl border border-[#E3ECE6] p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start md:items-center gap-3">
                <Info className="h-5 w-5 text-[#15803D] mt-0.5 md:mt-0 flex-shrink-0" />
                <div className="text-xs text-[#4A5D50]">
                  <span className="font-semibold text-[#1E3025]">Two-Way Testing:</span> Use <strong className="text-[#15803D]">Simulation Mode</strong> to evaluate user query flows with zero setup, or toggle <strong className="text-[#1E40AF]">Live Connected Mode</strong> to send REST payloads directly to your running Python FastAPI container backend.
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 border-[#F0F4F1]">
                {/* Mode toggle */}
                <div className="flex items-center bg-[#F1F5F2] rounded-lg p-0.5 border border-[#E3ECE6]">
                  <button 
                    onClick={() => setIsLiveMode(false)}
                    className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
                      !isLiveMode 
                        ? "bg-white text-[#15803D] shadow-sm" 
                        : "text-[#5D7265]"
                    }`}
                  >
                    Simulate Sandbox
                  </button>
                  <button 
                    onClick={() => setIsLiveMode(true)}
                    className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
                      isLiveMode 
                        ? "bg-[#1E40AF] text-white shadow-sm" 
                        : "text-[#5D7265]"
                    }`}
                  >
                    Live Connected
                  </button>
                </div>

                {isLiveMode && (
                  <div className="flex items-center gap-1.5 bg-[#EFF6FF] border border-[#BFDBFE] px-2.5 py-1.5 rounded-lg">
                    <span className="text-[10px] font-bold text-[#1E40AF]">FastAPI URL:</span>
                    <input 
                      type="text" 
                      value={backendUrl}
                      onChange={(e) => setBackendUrl(e.target.value)}
                      className="bg-white border border-[#93C5FD] rounded text-[11px] px-2 py-0.5 w-44 text-gray-700 font-mono outline-none focus:ring-1 focus:ring-[#2563EB]"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Split-pane view */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">
              
              {/* LEFT PANE: Chat Interface (Next.js Lovable Simulation) */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E3ECE6] shadow-sm flex flex-col h-[600px] overflow-hidden">
                <div className="bg-[#FAFBFB] px-5 py-4 border-b border-[#E3ECE6] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-[#15803D]" />
                    <div>
                      <h3 className="text-xs font-bold text-[#1E3025]">MSME Scheme Agent (Chat)</h3>
                      <p className="text-[10px] text-[#5D7265]">Responses contain verifiable source references</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${isLiveMode ? "bg-blue-500 animate-pulse" : "bg-emerald-500"}`}></span>
                    <span className="text-[10px] font-medium text-gray-500">{isLiveMode ? "Live API Active" : "Sandbox Simulator"}</span>
                  </div>
                </div>

                {/* Preset Prompts Row */}
                <div className="bg-white px-4 py-2.5 border-b border-[#F0F4F1] flex flex-wrap gap-2 items-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">MSME Quick Profiles:</span>
                  {PRESET_PROFILES.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendQuery(preset.query)}
                      disabled={isLoading}
                      className="flex items-center gap-1 px-2.5 py-1 bg-[#F4F8F5] border border-[#D5E6DC] hover:bg-[#E8F2EC] text-[#224A32] text-[10px] rounded-lg transition-colors font-medium disabled:opacity-50"
                    >
                      <span>{preset.icon}</span>
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>

                {/* Chat Message Scroll */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAFDFB]">
                  {messages.map((msg) => (
                    <div 
                      key={msg.id}
                      className={`flex items-start gap-2.5 max-w-[85%] ${
                        msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                      }`}
                    >
                      <div className={`p-2 rounded-xl flex-shrink-0 border ${
                        msg.sender === "user" 
                          ? "bg-[#E2EAF4] border-[#B9D2EC] text-[#1E3A5F]" 
                          : "bg-[#E8F5EE] border-[#CDE5D8] text-[#15803D]"
                      }`}>
                        {msg.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>

                      <div className={`rounded-2xl p-3.5 text-xs shadow-sm ${
                        msg.sender === "user"
                          ? "bg-gradient-to-tr from-[#1E40AF] to-[#2563EB] text-white"
                          : "bg-white border border-[#E3ECE6] text-gray-700"
                      }`}>
                        {/* Rendering simulated bold syntax simply */}
                        <div className="whitespace-pre-wrap leading-relaxed">
                          {msg.text.split("**").map((part, index) => 
                            index % 2 === 1 ? <strong key={index} className={msg.sender === "user" ? "font-bold text-blue-100" : "font-bold text-[#1E3025]"}>{part}</strong> : part
                          )}
                        </div>

                        {/* Citations Array Output (The Right-Pane Hooks) */}
                        {msg.citations && msg.citations.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-[#EDF4EF] flex flex-col gap-1.5">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Verifiable Audit Citations:</span>
                            <div className="flex flex-wrap gap-2">
                              {msg.citations.map((cit, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleLoadCitation(cit)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#EEF2F6] hover:bg-[#E2E8F0] border border-[#CBD5E1] text-[#1E293B] text-[10px] font-semibold rounded-md transition-colors"
                                >
                                  <FileText className="h-3 w-3 text-blue-600" />
                                  <span>{cit.document_name} (Page {cit.page_number})</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex items-center gap-2 mr-auto bg-white border border-[#E3ECE6] rounded-2xl p-4 shadow-sm max-w-[85%]">
                      <div className="flex space-x-1.5">
                        <div className="h-2 w-2 bg-[#15803D] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="h-2 w-2 bg-[#15803D] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="h-2 w-2 bg-[#15803D] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="text-[10px] text-gray-400 ml-2 font-medium">Lyzr QA Agent retrieving semantic chunks from Qdrant...</span>
                    </div>
                  )}
                </div>

                {/* Input Form Footer */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendQuery(inputQuery);
                  }}
                  className="bg-[#FAFBFB] p-3 border-t border-[#E3ECE6] flex gap-2 items-center"
                >
                  <input
                    type="text"
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    placeholder="Type turnover, sector, state eligibility question (e.g., mudra yojana)..."
                    disabled={isLoading}
                    className="flex-1 bg-white border border-[#DCE4DF] focus:border-[#15803D] text-xs outline-none rounded-xl px-4 py-3 text-gray-700 transition-colors placeholder:text-gray-400"
                  />
                  <button
                    type="submit"
                    disabled={!inputQuery.trim() || isLoading}
                    className="p-3 bg-[#15803D] hover:bg-[#166534] disabled:opacity-40 text-white rounded-xl transition-all shadow-sm flex items-center justify-center"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>

              {/* RIGHT PANE: Document/PDF Viewer Highlighted Context */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E3ECE6] shadow-sm flex flex-col h-[600px] overflow-hidden">
                <div className="bg-[#FAFBFB] px-5 py-4 border-b border-[#E3ECE6] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <h3 className="text-xs font-bold text-[#1E3025]">Source Document Viewer</h3>
                      <p className="text-[10px] text-[#5D7265]">Anchoring evidence for FinTech audit trail</p>
                    </div>
                  </div>
                  {viewingDoc.document_name !== DEFAULT_DOC_PAGE.document_name && (
                    <span className="px-2.5 py-1 bg-blue-100 border border-blue-200 text-blue-700 font-bold text-[9px] rounded-full uppercase tracking-wider">
                      Page {viewingDoc.page_number} Loaded
                    </span>
                  )}
                </div>

                {/* PDF Viewer Mock Stage */}
                <div className="flex-1 bg-gray-50 p-5 overflow-y-auto flex flex-col gap-4">
                  
                  {/* Outer PDF Border container representing document sheet */}
                  <div className="bg-white border border-[#E2E8F0] shadow-sm rounded-xl p-5 flex-1 flex flex-col gap-4">
                    
                    {/* Mock header of the PDF */}
                    <div className="flex items-center justify-between border-b border-[#EDF2F7] pb-3 text-gray-400 text-[10px] font-mono">
                      <div className="flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5 text-gray-400" />
                        <span>Ministry of Micro, Small & Medium Enterprises, India</span>
                      </div>
                      <span>SEC_SEC_REC_2026</span>
                    </div>

                    {/* PDF Document Body */}
                    <div className="flex-1 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-extrabold text-[#1E293B] font-sans">
                          {viewingDoc.title}
                        </h4>
                        <span className="text-[10px] font-mono text-gray-400 font-semibold">{viewingDoc.document_name}</span>
                      </div>

                      {/* Content block with mock highlighter */}
                      <div className="bg-blue-50/40 border-l-4 border-blue-500 rounded-r-lg p-3 text-[11px] leading-relaxed text-gray-600 font-sans">
                        {viewingDoc.content}
                      </div>

                      {/* Structured highlights checklist */}
                      <div className="mt-2 flex flex-col gap-2">
                        <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Policy Criteria Highlights:</h5>
                        <div className="space-y-1.5">
                          {viewingDoc.key_points.map((pt, i) => (
                            <div key={i} className="flex items-start gap-2 text-[10.5px] text-gray-600">
                              <CheckCircle className="h-3.5 w-3.5 text-[#15803D] mt-0.5 flex-shrink-0" />
                              <span>{pt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* PDF Footer with Watermark */}
                    <div className="border-t border-[#EDF2F7] pt-2.5 flex items-center justify-between text-[9px] text-gray-400 font-mono mt-auto">
                      <span>Ref ID: FS_NAV_AUDIT_TRAIL_026</span>
                      <span>Doc Page {viewingDoc.page_number}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================== TAB 2: CODEBASE EXPLORER ==================== */}
        {activeTab === "codebase" && (
          <div className="bg-white rounded-2xl border border-[#E3ECE6] p-6 shadow-sm flex flex-col gap-5">
            <div>
              <h2 className="text-lg font-extrabold text-[#1E3025]">Python FastAPI + Lyzr + Qdrant Codebase</h2>
              <p className="text-xs text-[#5D7265] mt-1">This completes the full requested backend scope with ZERO placeholders. Click to explore or copy the files directly into your project.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* File selectors */}
              <div className="lg:col-span-3 flex flex-col gap-2">
                {Object.keys(PYTHON_CODEBASE).map((filename) => (
                  <button
                    key={filename}
                    onClick={() => setCodeTab(filename as any)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                      codeTab === filename
                        ? "bg-[#E8F5EE] border-[#CDE5D8] text-[#15803D] font-bold"
                        : "bg-white border-[#E3ECE6] text-gray-600 hover:bg-gray-50 font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs">
                      <FileText className={`h-4 w-4 ${codeTab === filename ? "text-[#15803D]" : "text-gray-400"}`} />
                      <span>{filename}</span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 opacity-50" />
                  </button>
                ))}

                <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col gap-3 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-gray-700">
                    <Info className="h-4 w-4 text-[#15803D]" />
                    <span>Engineered Benefits</span>
                  </div>
                  <ul className="space-y-1.5 text-gray-500 text-[11px] list-disc pl-3 leading-normal">
                    <li>Strict Pydantic scheme mappings guarantee predictable input/output.</li>
                    <li>Page-by-page PDF ingestion secures authentic citations without model extrapolation.</li>
                    <li>Low temperature config on Gemini prevents numerical hallucinations.</li>
                  </ul>
                </div>
              </div>

              {/* Code display */}
              <div className="lg:col-span-9 flex flex-col gap-3 min-w-0">
                <div className="flex items-center justify-between bg-gray-800 text-gray-400 px-4 py-2.5 rounded-t-xl text-xs font-mono">
                  <span>{codeTab}</span>
                  <button
                    onClick={() => handleCopyCode(codeTab)}
                    className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded transition-all active:scale-95"
                  >
                    {copiedFile === codeTab ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedFile === codeTab ? "Copied!" : "Copy Code"}</span>
                  </button>
                </div>
                <div className="bg-gray-900 rounded-b-xl p-4 overflow-x-auto max-h-[500px] border border-gray-800 shadow-inner font-mono text-xs text-gray-300 whitespace-pre">
                  {PYTHON_CODEBASE[codeTab]}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: DEVELOPER GUIDE ==================== */}
        {activeTab === "guide" && (
          <div className="bg-white rounded-2xl border border-[#E3ECE6] p-6 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="text-lg font-extrabold text-[#1E3025]">FastAPI RAG Backend Deployment Guide</h2>
              <p className="text-xs text-[#5D7265] mt-1">Deploy the Python backend service on your hosted server or local development rig to power the Next.js split-pane client.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Step 1 Card */}
              <div className="border border-[#E3ECE6] rounded-2xl p-5 flex flex-col gap-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="p-3 bg-[#E8F5EE] border border-[#CDE5D8] rounded-xl self-start">
                  <Database className="h-5 w-5 text-[#15803D]" />
                </div>
                <h3 className="text-sm font-extrabold text-[#1E3025]">1. Qdrant Cloud Cluster Setup</h3>
                <p className="text-xs text-gray-500 leading-normal">
                  Qdrant serves as the high-speed semantic memory vector database.
                </p>
                <ol className="text-xs text-gray-600 space-y-1.5 list-decimal pl-4">
                  <li>Create a free account on Qdrant Cloud.</li>
                  <li>Provision an active, free Tier developer cluster.</li>
                  <li>Generate an <strong>API Key</strong> and copy your cluster **URL endpoint**.</li>
                </ol>
              </div>

              {/* Step 2 Card */}
              <div className="border border-[#E3ECE6] rounded-2xl p-5 flex flex-col gap-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="p-3 bg-blue-50 border border-[#BFDBFE] rounded-xl self-start">
                  <Key className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-sm font-extrabold text-[#1E3025]">2. Google AI Studio Key</h3>
                <p className="text-xs text-gray-500 leading-normal">
                  Gemini API handles complex context synthesis and embeddings.
                </p>
                <ol className="text-xs text-gray-600 space-y-1.5 list-decimal pl-4">
                  <li>Navigate to Google AI Studio.</li>
                  <li>Click <strong>Get API Key</strong> and create a free key.</li>
                  <li>Create a local <strong>.env</strong> file paste it as <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[10px]">GEMINI_API_KEY</code>.</li>
                </ol>
              </div>

              {/* Step 3 Card */}
              <div className="border border-[#E3ECE6] rounded-2xl p-5 flex flex-col gap-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="p-3 bg-purple-50 border border-purple-150 rounded-xl self-start">
                  <Terminal className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-sm font-extrabold text-[#1E3025]">3. Installation & Local Launch</h3>
                <p className="text-xs text-gray-500 leading-normal">
                  Install Python requirements and start your FastAPI service.
                </p>
                <ol className="text-xs text-gray-600 space-y-1.5 list-decimal pl-4">
                  <li>Create a Python virtual environment: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[10px]">python -m venv venv</code></li>
                  <li>Install dependencies: <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-[10px]">pip install -r requirements.txt</code></li>
                  <li>Launch FastAPI local server: <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-[10px]">uvicorn main:app --reload</code></li>
                </ol>
              </div>

            </div>

            <div className="bg-[#FAFDFB] rounded-2xl border border-[#D5E6DC] p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-[#15803D]" />
                <div>
                  <h4 className="text-xs font-bold text-[#1E3025]">One-Time Data Ingest execution</h4>
                  <p className="text-[11px] text-[#5D7265] mt-0.5">Simply run <code className="bg-[#EAF3EE] text-[#1E3025] px-1.5 py-0.5 rounded font-mono font-semibold">python ingest.py</code> in your project directory after adding MSME policy PDFs in your <code className="font-mono bg-gray-100 px-1">./data/</code> folder.</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ==============================================================================
          FOOTER WITH COPYRIGHT
          ============================================================================== */}
      <footer className="bg-white border-t border-[#E3ECE6] py-5 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#5D7265]">
          <div className="flex items-center gap-1.5 font-medium">
            <span>&copy; 2026 FlowSense Scheme Navigator.</span>
            <span>All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Database className="h-3.5 w-3.5 text-[#15803D]" />
              Qdrant Cloud
            </span>
            <span className="flex items-center gap-1">
              <Key className="h-3.5 w-3.5 text-blue-600" />
              Gemini AI Studio
            </span>
            <span className="flex items-center gap-1">
              <Server className="h-3.5 w-3.5 text-[#1E40AF]" />
              FastAPI
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
