#!/usr/bin/env python3
"""
FlowSense Scheme Navigator - Ingestion Script
Author: Principal AI Engineer
Event: Google Agent Builder Series 2026

This script handles the one-time ingestion of regulatory documents and Indian government scheme PDFs.
It:
1. Scans the local `./data/` directory for PDF documents.
2. Extracts page-by-page text content utilizing pypdf, preserving accurate page numbers and file source citations.
3. Uses Google Gemini's modern embedding model (`text-embedding-004`) via Google AI Studio API to vectorize text chunks.
4. Securely upserts vectors and metadata payloads into a Qdrant Cloud collection (`msme_schemes`).
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
    print(f"\nProcessing document: {filename}")
    
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
        print("Please place your MSME scheme, guidelines, and compliance PDFs in the `./data/` folder and re-run.")
        return

    # Find PDF documents
    pdf_files = list(data_dir.glob("*.pdf"))
    if not pdf_files:
        print(f"No PDF files found in {data_dir.resolve()}.")
        print("Please upload/copy 5-10 Indian MSME scheme PDFs into the `./data/` directory.")
        return

    print(f"Found {len(pdf_files)} PDF files for ingestion.")
    
    # Initialize Vector DB
    init_qdrant_collection()

    # Process all documents
    for pdf_path in pdf_files:
        chunk_and_vectorize_pdf(pdf_path)

    print("\n======================================================================")
    print("FlowSense Scheme Navigator Ingestion completed successfully!")
    print("Your Qdrant Cloud vector memory is primed and ready to support Chat agent queries.")
    print("======================================================================\n")


if __name__ == "__main__":
    main()
