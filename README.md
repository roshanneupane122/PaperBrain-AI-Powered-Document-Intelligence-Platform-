# 🚀 AI Summarize RAG: Enterprise-Grade SaaS System

A premium, full-stack **Retrieval-Augmented Generation (RAG)** application built with a secure **Node.js Gateway**, a high-performance **FastAPI AI Service**, and a stunning **Glassmorphism React Frontend**.

---

## 📸 Overview
This system allows users to upload documents (PDF, DOCX, TXT, MD), index them into a high-speed vector database, and chat with them using context-grounded AI answers. It is designed with a **Security-First** architecture, ensuring all AI interactions are authenticated and proxied.

---

## 🏗 System Architecture

The application uses a **3-Tier Microservices Architecture**:

### 1. 🛡️ Node.js Proxy Gateway (The Controller)
*   **Role**: Handles User Authentication, API Security, and Proxying.
*   **Security**: Implements JWT-based authentication, `bcrypt` for password hashing, and `helmet` for secure headers.
*   **Proxy**: Uses `axios` to securely forward requests to the private AI backend. It hides the AI service's origin from the internet.

### 🧠 2. FastAPI Intelligence Service (The Brain)
*   **Framework**: FastAPI (Python) for asynchronous, high-speed processing.
*   **RAG Logic**: Built using **LangChain**.
*   **Vector Database**: Uses **ChromaDB** for local vector storage.
*   **Model Autopilot**: 
    *   **Auto-Detection**: Scans the provided **Google Gemini API Key** at startup to find the best available LLM (Gemini 2.5 Flash, 1.5 Pro, etc.) and Embedding models.
    *   **Smart Fallback**: If Gemini Cloud embeddings are unavailable, it automatically starts a **local HuggingFace model** (`all-MiniLM-L6-v2`) to keep the system running.

### 🎨 3. React Dashboard (The Interface)
*   **UI/UX**: Premium "Apple-style" glassmorphism theme using Vanilla CSS and Lucide Icons.
*   **State Management**: `AuthContext` for secure sessions.
*   **Features**: Real-time upload progress, interactive chat bubbles, and source-citation system.

---

## 🛠 Tech Stack

| Tier | Technologies |
| :--- | :--- |
| **Frontend** | React, Vite, Lucide React, CSS Variables |
| **Backend** | Node.js, Express, MongoDB/Mongoose, JWT |
| **AI Service** | FastAPI, LangChain, Google Gemini API, ChromaDB |
| **Embeddings** | Gemini `embedding-001` OR Local `sentence-transformers` |

---

## 🚀 Installation & Setup

### 1. Prerequisites
*   Node.js (v18+)
*   Python (3.10+)
*   MongoDB (Compass or Atlas)
*   Google AI Studio API Key (Gemini)

### 2. AI Intelligence Service
```bash
cd AI
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
# Configure .env with GEMINI_API_KEY
python main.py
```

### 3. Backend Gateway
```bash
cd Backend
npm install
# Configure .env with MONGODB_URI and JWT_SECRET
npm run dev
```

### 4. Frontend Client
```bash
cd Frontend
npm install
npm run dev
```

---

## 💡 Key Interview Highlights
*   **RAG Workflow**: Document → Text Extraction → Semantic Chunking → Vector Embedding → ChromaDB Indexing → Similarity Search → Contextual Prompting → LLM Generation.
*   **Security**: All AI endpoints are private; they can only be reached if the Node.js middleware validates the user's JWT.
*   **Resilience**: The system handles "Model Disconnection" by falling back to local computation for embeddings.
*   **Optimization**: Implemented **Semantic Separators** and **Deduplication** in the RAG pipeline to ensure the AI gets the most relevant high-quality context.

---

## 🔒 License
Proprietary / Educational Project by **Roshan Neupane**.
