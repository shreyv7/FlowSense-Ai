#!/usr/bin/env python3
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
                answer="Welcome to FlowSense Scheme Navigator. It appears that no regulatory policy documents have been ingested yet. Please place your PDFs in the `./data/` folder and execute the ingestion script (`python ingest.py`) to prime the semantic memory.",
                citations=[]
            )

        # Build context string for prompt
        context_str_list = []
        for idx, ctx in enumerate(contexts):
            ref_str = f"[Source {idx+1}: {ctx['document_name']} (Page {ctx['page_number']})]\n{ctx['text']}"
            context_str_list.append(ref_str)
        context_block = "\n\n".join(context_str_list)

        # Build strict system prompt
        system_instruction = (
            "You are the expert B2B Scheme Navigator cognitive agent built for the Google Agent Builder Series 2026.\n"
            "Your objective is to help Indian Micro, Small, and Medium Enterprises (MSMEs) discover government subsidies, "
            "treasury grants, tax incentives, and loan schemes based purely on the provided Context below.\n\n"
            "STRICT RULES:\n"
            "1. Anchor your claims strictly inside the retrieved Context. Do not synthesize or assume numbers, percentages, or eligibility metrics.\n"
            "2. If the user's query cannot be answered based on the context, set the answer field exactly to: 'I cannot find this in the provided documents.' and citations list empty.\n"
            "3. For every financial subsidy, credit scheme, or benefit claim you make in your answer, you MUST cite its direct source document_name and page_number.\n"
            "4. Return a structured JSON response matching the requested schema layout.\n\n"
            f"--- START RETRIEVED CONTEXT ---\n{context_block}\n--- END RETRIEVED CONTEXT ---"
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
                    f"User Query: {user_query}\nSynthesize cited report matching the strict schema layout."
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
    uvicorn.run(app, host="0.0.0.0", port=8000)
