import { useState, useEffect } from "react";
import { 
  FileText, 
  Send, 
  CheckCircle, 
  Database, 
  Key, 
  Server, 
  Sliders, 
  Info, 
  BookOpen, 
  ExternalLink,
  Bot,
  User,
  ShieldCheck,
  Building,
  ChevronUp,
  ChevronDown
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
  ],
  "Maharashtra_Fintech_Guidelines.pdf": [
    {
      document_name: "Maharashtra_Fintech_Guidelines.pdf",
      page_number: 3,
      title: "Section 5.1: Fiscal Incentives for Fintech Startups",
      content: "The Government of Maharashtra, through the Maharashtra State Innovation Society (MSINS), provides robust support to registered FinTech startups. Startups operating in the fintech space qualify for: 1. Co-working & Incubation Subsidy: Reimbursement of incubator rent up to ₹1 Lakh per year for up to 3 years. 2. State GST (SGST) Reimbursement: 100% reimbursement of the SGST paid on commercial services for 3 years (capped at ₹10 Lakhs per year). 3. Travel & Exhibition Grant: Up to ₹2 Lakhs per startup for participating in national/international fintech conferences.",
      key_points: ["100% SGST Reimbursement for 3 years (up to ₹10 Lakhs/yr)", "Co-working rental subsidy up to ₹1 Lakh/yr", "Travel & exhibition grants up to ₹2 Lakhs"]
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

const PRESET_PROFILES = [
  {
    label: "Karnataka IT Startup",
    icon: "🏢",
    query: "I run a ₹2 Crore turnover IT services firm in Karnataka. What state tech subsidies can I claim?"
  },
  {
    label: "Maharashtra Fintech",
    icon: "🚀",
    query: "I run a fintech startup in Mumbai registered under Maharashtra's state cell. What incentives do we get?"
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

export default function App() {
  const [backendUrl, setBackendUrl] = useState(
    typeof window !== "undefined" ? window.location.origin : ""
  );
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [chatSessionId, setChatSessionId] = useState(`session_${Math.random().toString(36).substring(7)}`);
  const [isHeaderMinimized, setIsHeaderMinimized] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<"chat" | "document">("chat");

  interface HealthStatus {
    status: string;
    service: string;
    integrations: {
      gemini_api_configured: boolean;
      qdrant_cloud_configured: boolean;
    };
  }

  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/health`);
        if (response.ok) {
          const data = await response.json();
          setHealth(data);
        } else {
          setHealth(null);
        }
      } catch (err) {
        setHealth(null);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 8000); // Check health every 8 seconds
    return () => clearInterval(interval);
  }, [backendUrl]);
  
  // Default welcoming chat conversation matching real-world MSME queries
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "agent",
      text: "Hello! Welcome to the **FlowSense Scheme Navigator**.\n\nI can help you navigate dense official guidelines for subsidies, loan guarantees, and credit schemes from the Indian Government. Click one of our quick profiles below or ask a custom question to query the live RAG cognitive engine!",
      timestamp: "12:00 PM"
    }
  ]);

  // Document/PDF Viewer state
  const [viewingDoc, setViewingDoc] = useState<PDFDocumentPage>(DEFAULT_DOC_PAGE);

  // Aesthetic Custom Cursor State & Hook
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isHoveringPointer, setIsHoveringPointer] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 1023px)").matches);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      const isPointer = 
        window.getComputedStyle(target).cursor === "pointer" || 
        target.tagName === "BUTTON" || 
        target.tagName === "A" || 
        target.closest("button") || 
        target.closest("a");
      setIsHoveringPointer(!!isPointer);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

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
          throw new Error(`Server returned status: ${response.status}`);
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
        console.error("Connection failed to backend:", err);
        const errorMsg: Message = {
          id: `error_${Date.now()}`,
          sender: "agent",
          text: `⚠️ **Connection Failed to Cognitive Server**\n\nCould not connect to the server at \`${backendUrl}\`.\n\n*Error details: ${err.message}*\n\nPlease verify your environment API keys are correctly set. You can switch to **Simulation Mode** above to preview instant offline outputs.`,
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
        else if (normalizedQuery.includes("maharashtra") || normalizedQuery.includes("fintech") || normalizedQuery.includes("mumbai")) {
          answer = "Based on the official **Maharashtra FinTech Policy Guidelines (Section 5.1)**, eligible FinTech startups registered under Maharashtra State Innovation Society (MSINS) and operating out of Mumbai or elsewhere in Maharashtra qualify for:\n\n1. **State GST (SGST) Reimbursement:** 100% reimbursement of the SGST paid on commercial services for 3 years, capped at **₹10 Lakhs** per fiscal year.\n2. **Co-working & Incubation Subsidy:** Reimbursement of incubator desk rent or co-working rental fees up to **₹1 Lakh per year** for up to 3 years.\n3. **Travel & Exhibition Grant:** Direct grants of up to **₹2 Lakhs** to reimburse registrations, booths, or travel expenses for showcasing products at elite national or international fintech summits.";
          citations = [{ document_name: "Maharashtra_Fintech_Guidelines.pdf", page_number: 3 }];
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

        if (citations.length > 0) {
          handleLoadCitation(citations[0]);
        }

        setIsLoading(false);
      }, 1000);
    }
  };

  const handleLoadCitation = (citation: Citation) => {
    const doc = MOCK_POLICY_PDFS[citation.document_name];
    if (doc) {
      const page = doc.find(p => p.page_number === citation.page_number);
      if (page) {
        setViewingDoc(page);
        if (isMobile) {
          setActiveMobileTab("document");
        }
      }
    }
  };

  return (
    <div className="h-screen max-h-screen bg-[#F4F7F5] text-slate-800 font-sans antialiased flex flex-col overflow-hidden custom-cursor-active">
      {/* ==============================================================================
          NAVIGATION HEADER
          ============================================================================== */}
      <header className={`bg-white border-b border-[#E3ECE6]/80 sticky top-0 z-40 px-6 transition-all duration-300 shadow-sm ${
        isHeaderMinimized ? "py-2" : "py-4"
      }`}>
        <div className={`max-w-7xl mx-auto flex ${isHeaderMinimized ? "flex-row items-center justify-between" : "flex-col md:flex-row md:items-center justify-between"} gap-4`}>
          <div className="flex items-center justify-between w-full md:w-auto gap-3.5">
            <div className="flex items-center gap-3.5">
              <div className={`bg-[#E8F5EE] rounded-2xl border border-[#CDE5D8] transition-all duration-300 ${
                isHeaderMinimized ? "p-2" : "p-3"
              }`}>
                <ShieldCheck className={`text-[#15803D] transition-all duration-300 ${
                  isHeaderMinimized ? "h-4 w-4" : "h-6 w-6"
                }`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className={`font-extrabold tracking-tight text-[#1E3025] transition-all duration-300 ${
                    isHeaderMinimized ? "text-sm md:text-base" : "text-xl"
                  }`}>
                    {isMobile && isHeaderMinimized ? "FlowSense" : "FlowSense Scheme Navigator"}
                  </h1>
                  {!isHeaderMinimized && (
                    <span className="px-2.5 py-0.5 bg-[#E2EAF4] text-[#1E40AF] text-[10px] font-bold rounded-full border border-[#BFDBFE]">
                      B2B Regulatory RAG
                    </span>
                  )}
                </div>
                {!isHeaderMinimized && (
                  <p className="text-xs text-[#5D7265] mt-0.5">Government Schemes & Subsidies Verification Platform</p>
                )}
              </div>
            </div>

            {/* Mobile minimize/maximize button in the top row */}
            <button
              onClick={() => setIsHeaderMinimized(!isHeaderMinimized)}
              className="md:hidden p-2 bg-[#F1F5F2] border border-[#E3ECE6] hover:bg-[#E8F5EE] rounded-xl transition-all text-[#5D7265] hover:text-[#1E3025] flex items-center justify-center cursor-pointer shadow-xs"
              title={isHeaderMinimized ? "Expand Header" : "Minimize Header"}
            >
              {isHeaderMinimized ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>
          </div>

          {/* Desktop/Expanded Mobile Header Controls */}
          {!isHeaderMinimized && (
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {health ? (
                  <>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold border ${
                      health.integrations.gemini_api_configured 
                        ? "bg-[#E8F5EE] text-[#15803D] border-[#CDE5D8]" 
                        : "bg-red-50 text-red-600 border-red-200"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${health.integrations.gemini_api_configured ? "bg-[#15803D]" : "bg-red-500"}`}></span>
                      Gemini API: {health.integrations.gemini_api_configured ? "Active" : "Key Missing"}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold border ${
                      health.integrations.qdrant_cloud_configured 
                        ? "bg-[#EFF6FF] text-blue-600 border-[#BFDBFE]" 
                        : "bg-[#FFFBEB] text-amber-700 border-[#FDE68A]"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${health.integrations.qdrant_cloud_configured ? "bg-blue-500" : "bg-amber-500 animate-pulse"}`}></span>
                      Qdrant: {health.integrations.qdrant_cloud_configured ? "Connected" : "Local Fallback"}
                    </span>
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-gray-50 text-gray-500 border border-gray-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-300 animate-pulse"></span>
                    Checking Service...
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-[#F1F5F2] rounded-xl p-1 border border-[#E3ECE6]">
                  <button 
                    onClick={() => setIsLiveMode(false)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                      !isLiveMode 
                        ? "bg-white text-[#15803D] shadow-sm border border-gray-100" 
                        : "text-[#5D7265] hover:text-[#1E3025]"
                    }`}
                  >
                    Simulation
                  </button>
                  <button 
                    onClick={() => setIsLiveMode(true)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                      isLiveMode 
                        ? "bg-[#15803D] text-white shadow-sm" 
                        : "text-[#5D7265] hover:text-[#1E3025]"
                    }`}
                  >
                    Production Server
                  </button>
                </div>

                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-2 rounded-xl border transition-all ${
                    showSettings 
                      ? "bg-[#E8F5EE] border-[#CDE5D8] text-[#15803D]" 
                      : "bg-white border-[#E3ECE6] hover:bg-[#F8FAF9] text-[#5D7265]"
                  }`}
                  title="Configure Endpoint URL"
                >
                  <Sliders className="h-4 w-4" />
                </button>

                {/* Desktop-only minimize button */}
                <button
                  onClick={() => setIsHeaderMinimized(true)}
                  className="hidden md:flex p-2 bg-[#F1F5F2] border border-[#E3ECE6] hover:bg-[#E8F5EE] rounded-xl transition-all text-[#5D7265] hover:text-[#1E3025] items-center justify-center cursor-pointer shadow-xs"
                  title="Minimize Header"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Desktop-only expand button when minimized */}
          {isHeaderMinimized && (
            <button
              onClick={() => setIsHeaderMinimized(false)}
              className="hidden md:flex p-2 bg-[#F1F5F2] border border-[#E3ECE6] hover:bg-[#E8F5EE] rounded-xl transition-all text-[#5D7265] hover:text-[#1E3025] items-center justify-center cursor-pointer shadow-xs"
              title="Expand Header"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      {/* ==============================================================================
          MAIN CONTENT VIEWPORT
          ============================================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-5 overflow-hidden min-h-0">
        
        {/* Settings Panel Drawer */}
        <AnimatePresence>
          {showSettings && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white rounded-2xl border border-[#E3ECE6] p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-2.5">
                  <Info className="h-5 w-5 text-[#15803D] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-[#1E3025]">Cognitive Server Settings</h4>
                    <p className="text-[10.5px] text-[#5D7265]">Override the target server URL pointing to your running Express + Gemini backend container.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-[#F1F5F2] border border-[#E3ECE6] px-3 py-2 rounded-xl w-full sm:w-auto">
                  <span className="text-[10.5px] font-bold text-gray-500">API Endpoint:</span>
                  <input 
                    type="text" 
                    value={backendUrl}
                    onChange={(e) => setBackendUrl(e.target.value)}
                    className="bg-white border border-[#DCDFDCE] rounded px-2.5 py-1 text-xs font-mono text-gray-700 w-full sm:w-64 outline-none focus:ring-1 focus:ring-[#15803D]"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Tab Switcher */}
        {isMobile && (
          <div className="relative flex bg-[#E8ECE9] p-1 rounded-2xl border border-[#D5DCD8]">
            <motion.div
              className="absolute top-1 bottom-1 rounded-xl shadow-xs"
              animate={{
                left: activeMobileTab === "chat" ? "4px" : "calc(50% + 2px)",
                backgroundColor: activeMobileTab === "chat" ? "#15803D" : "#2563EB",
              }}
              style={{
                width: "calc(50% - 6px)",
              }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
            <button
              onClick={() => setActiveMobileTab("chat")}
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-xl transition-colors duration-200 cursor-pointer ${
                activeMobileTab === "chat" ? "text-white" : "text-[#5D7265] hover:text-[#1E3025]"
              }`}
            >
              <Bot className="h-4 w-4" />
              Chat Assistant
            </button>
            <button
              onClick={() => setActiveMobileTab("document")}
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-xl transition-colors duration-200 cursor-pointer ${
                activeMobileTab === "document" ? "text-white" : "text-[#5D7265] hover:text-[#1E3025]"
              }`}
            >
              <FileText className="h-4 w-4" />
              Document Auditor
            </button>
          </div>
        )}

        {/* Split-pane view */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
          
          {/* LEFT PANE: Chat Interface (Active Cognitive Discovery Room) */}
          <div className={`lg:col-span-7 bg-white rounded-3xl border border-[#E3ECE6] shadow-md h-full min-h-0 overflow-hidden ${
            isMobile && activeMobileTab !== "chat" ? "hidden" : "flex flex-col"
          }`}>
            <div className="bg-[#FAFBFB] px-6 py-4 border-b border-[#E3ECE6]/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Bot className="h-5 w-5 text-[#15803D]" />
                <div>
                  <h3 className="text-xs font-extrabold text-[#1E3025]">MSME Scheme Assistant</h3>
                  <p className="text-[10px] text-[#5D7265]">Formulate questions on subsidies, eligibility, and guarantee covers</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${isLiveMode ? "bg-blue-500 animate-pulse" : "bg-emerald-500"}`}></span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{isLiveMode ? "Active RAG" : "Sandbox"}</span>
              </div>
            </div>

            {/* Preset Profiles Horizontal Quickbar */}
            <div className="bg-white px-5 py-3 border-b border-[#F0F4F1] flex flex-wrap gap-2 items-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quick MSME Profiles:</span>
              {PRESET_PROFILES.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendQuery(preset.query)}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F8F5] border border-[#D5E6DC] hover:bg-[#E8F2EC] hover:border-[#15803D]/30 text-[#224A32] text-[10.5px] rounded-full transition-all font-semibold disabled:opacity-50 active:scale-95 cursor-pointer"
                >
                  <span>{preset.icon}</span>
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>

            {/* Chat Message Scroll */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#FAFDFB]">
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex items-start gap-3 max-w-[88%] ${
                    msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                  }`}
                >
                  <div className={`p-2 rounded-2xl flex-shrink-0 border shadow-sm ${
                    msg.sender === "user" 
                      ? "bg-blue-50 border-blue-200 text-blue-600" 
                      : "bg-[#E8F5EE] border-[#CDE5D8] text-[#15803D]"
                  }`}>
                    {msg.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>

                  <div className={`rounded-2xl p-4 text-xs shadow-sm ${
                    msg.sender === "user"
                      ? "bg-[#1E3025] text-white"
                      : "bg-white border border-[#E3ECE6] text-slate-700"
                  }`}>
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {msg.text.split("**").map((part, index) => 
                        index % 2 === 1 ? <strong key={index} className={msg.sender === "user" ? "font-bold text-[#E8F5EE]" : "font-extrabold text-[#1E3025]"}>{part}</strong> : part
                      )}
                    </div>

                    {/* Citations block */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-4 pt-3.5 border-t border-[#F0F4F1] flex flex-col gap-2">
                        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Verifiable Audit Citations:</span>
                        <div className="flex flex-wrap gap-2">
                          {msg.citations.map((cit, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleLoadCitation(cit)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] text-[#1E40AF] text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
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
                <div className="flex items-center gap-3 mr-auto bg-white border border-[#E3ECE6] rounded-2xl p-4 shadow-sm max-w-[85%]">
                  <div className="flex space-x-1.5">
                    <div className="h-2 w-2 bg-[#15803D] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="h-2 w-2 bg-[#15803D] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="h-2 w-2 bg-[#15803D] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-[10px] text-[#5D7265] font-semibold">Semantic cognitive retrieval engine processing query...</span>
                </div>
              )}
            </div>

            {/* Input Form Footer */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendQuery(inputQuery);
              }}
              className="bg-[#FAFBFB] p-4 border-t border-[#E3ECE6]/80 flex gap-2 items-center"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Query state subsidies, collateral-free loans, or Mudra Yojana criteria..."
                disabled={isLoading}
                className="flex-1 bg-white border border-[#DCE4DF] focus:border-[#15803D] text-xs outline-none rounded-xl px-4 py-3.5 text-gray-700 transition-colors placeholder:text-gray-400 shadow-sm"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isLoading}
                className="p-3.5 bg-[#15803D] hover:bg-[#166534] disabled:opacity-40 text-white rounded-xl transition-all shadow-sm flex items-center justify-center cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* RIGHT PANE: Document/PDF Viewer Highlighted Context */}
          <div className={`lg:col-span-5 bg-white rounded-3xl border border-[#E3ECE6] shadow-md h-full min-h-0 overflow-hidden ${
            isMobile && activeMobileTab !== "document" ? "hidden" : "flex flex-col"
          }`}>
            <div className="bg-[#FAFBFB] px-6 py-4 border-b border-[#E3ECE6]/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="text-xs font-extrabold text-[#1E3025]">Source Document Auditor</h3>
                  <p className="text-[10px] text-[#5D7265]">Live highlights anchored directly to regulatory source text</p>
                </div>
              </div>
              {viewingDoc.document_name !== DEFAULT_DOC_PAGE.document_name && (
                <span className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 font-bold text-[9px] rounded-full uppercase tracking-wider">
                  Page {viewingDoc.page_number} Active
                </span>
              )}
            </div>

            {/* PDF Viewer Mock Stage */}
            <div className="flex-1 bg-gray-50/50 p-5 overflow-y-auto flex flex-col gap-4">
              
              {/* Outer PDF Border container representing document sheet */}
              <div className="bg-white border border-[#E2E8F0] shadow-sm rounded-2xl p-5 flex-1 flex flex-col gap-4">
                
                {/* Mock header of the PDF */}
                <div className="flex items-center justify-between border-b border-[#EDF2F7] pb-3 text-gray-400 text-[10px] font-mono">
                  <div className="flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5 text-gray-400" />
                    <span className="font-semibold text-gray-500">Ministry of MSME, Govt of India</span>
                  </div>
                  <span>RAG_PROOF_V26</span>
                </div>

                {/* PDF Document Body */}
                <div className="flex-1 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9.5px] font-mono text-blue-600 font-bold uppercase tracking-wider">{viewingDoc.document_name}</span>
                    <h4 className="text-sm font-extrabold text-[#1E293B]">
                      {viewingDoc.title}
                    </h4>
                  </div>

                  {/* Content block with mock highlighter */}
                  <div className="bg-blue-50/40 border-l-4 border-blue-500 rounded-r-xl p-3.5 text-[11px] leading-relaxed text-gray-600 font-sans shadow-sm">
                    {viewingDoc.content}
                  </div>

                  {/* Structured highlights checklist */}
                  <div className="mt-2 flex flex-col gap-2.5">
                    <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 font-mono">Policy Highlights Checklist:</h5>
                    <div className="space-y-2">
                      {viewingDoc.key_points.map((pt, i) => (
                        <div key={i} className="flex items-start gap-2 text-[10.5px] text-gray-600">
                          <CheckCircle className="h-4 w-4 text-[#15803D] mt-0.5 flex-shrink-0" />
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* PDF Footer with Watermark */}
                <div className="border-t border-[#EDF2F7] pt-2.5 flex items-center justify-between text-[9px] text-gray-400 font-mono mt-auto">
                  <span>Ref ID: FS_NAV_AUDIT_TRAIL_026</span>
                  <span>Page {viewingDoc.page_number}</span>
                </div>
              </div>

              {/* Official Direct Download Reference Portal */}
              <div className="bg-gradient-to-tr from-[#F1F7F4] to-[#EAF5EE] border border-[#D5E6DC] rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-[#15803D]" />
                  <h4 className="text-xs font-bold text-[#1E3025]">Official PDF Reference Portals</h4>
                </div>
                <p className="text-[10.5px] text-[#4A5D50] leading-relaxed">
                  Download the complete, official policy guidelines directly from Government repositories:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  <a 
                    href="https://karnatakadigital.in" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 bg-white hover:bg-gray-50 rounded-xl border border-[#D5E6DC] transition-all text-[11px] shadow-sm cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🏢</span>
                      <div>
                        <div className="font-bold text-[#1E3025]">Karnataka IT Policy 2020-25</div>
                        <div className="text-[10px] text-gray-500">Official State Digital Portal</div>
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-[#15803D]" />
                  </a>

                  <a 
                    href="https://fintech.maharashtra.gov.in" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 bg-white hover:bg-gray-50 rounded-xl border border-[#D5E6DC] transition-all text-[11px] shadow-sm cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🚀</span>
                      <div>
                        <div className="font-bold text-[#1E3025]">Maharashtra FinTech Policy</div>
                        <div className="text-[10px] text-gray-500">Maharashtra State Innovation Society (MSINS)</div>
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-[#15803D]" />
                  </a>

                  <a 
                    href="https://www.cgtmse.in" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 bg-white hover:bg-gray-50 rounded-xl border border-[#D5E6DC] transition-all text-[11px] shadow-sm cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🛡️</span>
                      <div>
                        <div className="font-bold text-[#1E3025]">CGTMSE Credit Scheme Guidelines</div>
                        <div className="text-[10px] text-gray-500">Credit Guarantee Fund Trust Portal</div>
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-[#15803D]" />
                  </a>

                  <a 
                    href="https://www.mudra.org.in" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 bg-white hover:bg-gray-50 rounded-xl border border-[#D5E6DC] transition-all text-[11px] shadow-sm cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🧵</span>
                      <div>
                        <div className="font-bold text-[#1E3025]">Mudra Yojana Scheme Guidelines</div>
                        <div className="text-[10px] text-gray-500">Pradhan Mantri MUDRA Yojana (PMMY) Portal</div>
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-[#15803D]" />
                  </a>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* ==============================================================================
          FOOTER WITH COPYRIGHT
          ============================================================================== */}
      <footer className="bg-white border-t border-[#E3ECE6]/80 py-5 mt-auto shadow-inner">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#5D7265]">
          <div className="flex items-center gap-1.5 font-medium">
            <span>&copy; 2026 FlowSense Scheme Navigator.</span>
            <span>All rights reserved.</span>
          </div>
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1 font-medium">
              <Database className="h-3.5 w-3.5 text-[#15803D]" />
              Qdrant Cloud
            </span>
            <span className="flex items-center gap-1 font-medium">
              <Key className="h-3.5 w-3.5 text-blue-600" />
              Gemini AI Studio
            </span>
            <span className="flex items-center gap-1 font-medium">
              <Server className="h-3.5 w-3.5 text-[#1E40AF]" />
              Fullstack Node Engine
            </span>
          </div>
        </div>
      </footer>

      {!isMobile && (
        <>
          <div 
            className="fixed pointer-events-none z-[9999] rounded-full bg-[#15803D] transition-transform duration-75 ease-out -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${mousePos.x}px`,
              top: `${mousePos.y}px`,
              width: isHoveringPointer ? '8px' : '6px',
              height: isHoveringPointer ? '8px' : '6px',
            }}
          />
          <div 
            className="fixed pointer-events-none z-[9998] rounded-full border border-[#15803D]/60 transition-all duration-300 ease-out -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${mousePos.x}px`,
              top: `${mousePos.y}px`,
              width: isHoveringPointer ? '44px' : '24px',
              height: isHoveringPointer ? '44px' : '24px',
              backgroundColor: isHoveringPointer ? 'rgba(21, 128, 61, 0.05)' : 'transparent',
            }}
          />
        </>
      )}
    </div>
  );
}
