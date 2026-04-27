import { useEffect, useRef, useState } from "react";
import { useAuth } from "./context/AuthContext";
import { LogOut, Upload, FileText, Trash2, Send, Database, ShieldCheck } from "lucide-react";

const API_BASE = `${import.meta.env.VITE_API_BASE}/ai`;

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function App() {
  const { user, token, logout } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [activeDocumentId, setActiveDocumentId] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState("");
  const [question, setQuestion] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState("");
  const [health, setHealth] = useState(null);
  const fileInputRef = useRef(null);

  const activeDocument = documents.find((item) => item.id === activeDocumentId);

  useEffect(() => {
    void loadDocuments();
  }, []);

  useEffect(() => {
    if (!activeDocumentId || !conversationId) {
      return;
    }
    void loadHistory(activeDocumentId, conversationId);
  }, [activeDocumentId, conversationId]);

  const authenticatedFetch = async (url, options = {}) => {
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };
    return fetch(url, { ...options, headers });
  };

  async function loadDocuments() {
    try {
      const response = await authenticatedFetch(`${API_BASE}/documents`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setDocuments(data);
        if (!activeDocumentId && data.length > 0) {
          setActiveDocumentId(data[0].id);
        }
      }
    } catch (err) {
      setError("Failed to load documents");
    }
  }

  async function loadHistory(documentId, nextConversationId) {
    try {
      const response = await authenticatedFetch(
        `${API_BASE}/documents/${documentId}/history?conversation_id=${nextConversationId}`,
      );
      if (!response.ok) return;
      const data = await response.json();
      setMessages(
        data.messages.map((item, index) => ({
          id: `${item.role}-${index}`,
          role: item.role,
          content: item.content,
          sources: [],
        })),
      );
    } catch (err) {
      console.error(err);
    }
  }

  async function handleUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await authenticatedFetch(`${API_BASE}/documents/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.detail || "Upload failed.");
      }
      setDocuments((current) => [data, ...current]);
      setActiveDocumentId(data.id);
      setConversationId("");
      setMessages([]);
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleDelete(documentId) {
    try {
      const response = await authenticatedFetch(`${API_BASE}/documents/${documentId}`, {
        method: "DELETE",
      });
      if (!response.ok) return;
      
      const nextDocuments = documents.filter((item) => item.id !== documentId);
      setDocuments(nextDocuments);
      if (activeDocumentId === documentId) {
        setActiveDocumentId(nextDocuments[0]?.id || "");
        setConversationId("");
        setMessages([]);
      }
    } catch (err) {
      setError("Failed to delete document");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!question.trim() || !activeDocumentId) return;

    const outgoingQuestion = question.trim();
    const optimisticMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: outgoingQuestion,
      sources: [],
    };

    setMessages((current) => [...current, optimisticMessage]);
    setQuestion("");
    setIsThinking(true);
    setError("");

    try {
      const response = await authenticatedFetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_id: activeDocumentId,
          question: outgoingQuestion,
          conversation_id: conversationId || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.detail || "Chat request failed.");
      }

      setConversationId(data.conversation_id);
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.answer,
          sources: data.sources,
        },
      ]);
    } catch (chatError) {
      setError(chatError.message);
      setMessages((current) => current.filter((item) => item.id !== optimisticMessage.id));
      setQuestion(outgoingQuestion);
    } finally {
      setIsThinking(false);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="user-profile">
            <div className="avatar">{user?.name?.charAt(0) || "U"}</div>
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span className="user-status">Pro Member</span>
            </div>
            <button className="icon-button logout" onClick={logout} title="Logout">
              <LogOut size={16} />
            </button>
          </div>
          <h1>Document Chat RAG</h1>
          <p className="lede">
            Securely chat with your documents using grounded AI answers.
          </p>
        </div>

        <div className="panel">
          <label className="upload-card">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.md"
              onChange={handleUpload}
              hidden
            />
            <Upload size={24} className="upload-icon" />
            <span>{isUploading ? "Indexing..." : "Upload document"}</span>
            <small>PDF, DOCX, TXT, MD</small>
          </label>
          {error ? <p className="error-text">{error}</p> : null}
        </div>

        <div className="panel documents-panel">
          <div className="panel-header">
            <h2>Library</h2>
            <div className="badge">{documents.length}</div>
          </div>
          <div className="document-list">
            {documents.map((document) => (
              <div
                key={document.id}
                role="button"
                tabIndex={0}
                className={`document-card ${document.id === activeDocumentId ? "active" : ""}`}
                onClick={() => {
                  setActiveDocumentId(document.id);
                  setConversationId("");
                  setMessages([]);
                }}
              >
                <div className="doc-icon">
                  <FileText size={18} />
                </div>
                <div className="doc-content">
                  <strong>{document.filename}</strong>
                  <p>{document.embedded_with ? `Embedded with ${document.embedded_with}` : "No preview available"}</p>
                  <div className="document-footer">
                    <span>{formatDate(document.created_at)}</span>
                    <button
                      className="delete-btn"
                      onClick={(event) => {
                        event.stopPropagation();
                        void handleDelete(document.id);
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {documents.length === 0 && !isUploading ? (
              <div className="empty-card">Upload a file to start</div>
            ) : null}
          </div>
        </div>
      </aside>

      <main className="chat-layout">
        <section className="hero-panel">
          <div className="hero-content">
            <div className="badge accent">Secure Gateway Active</div>
            <h2>{activeDocument ? activeDocument.filename : "Select a document"}</h2>
            <p>Asking questions grounded in your selected source.</p>
          </div>
          <div className="hero-metrics">
            <div className="metric-card">
              <Database size={20} className="metric-icon" />
              <div>
                <strong>{activeDocument?.chunk_count || 0}</strong>
                <span>Chunks</span>
              </div>
            </div>
            <div className="metric-card">
              <ShieldCheck size={20} className="metric-icon" />
              <div>
                <strong>{messages.filter((m) => m.role === "assistant").length}</strong>
                <span>Secure Replies</span>
              </div>
            </div>
          </div>
        </section>

        <section className="chat-panel">
          <div className="messages">
            {messages.length === 0 && (
              <div className="empty-chat">
                <div className="empty-icon">💬</div>
                <h3>Start a Conversation</h3>
                <p>Try asking "Summarize the key points of this document"</p>
              </div>
            )}

            {messages.map((message) => (
              <article key={message.id} className={`message ${message.role}`}>
                <div className="message-role">{message.role === "user" ? "You" : "AI Assistant"}</div>
                <div className="message-body">{message.content}</div>
                {message.sources?.length ? (
                  <div className="sources-container">
                    <span className="sources-label">Sources:</span>
                    <div className="sources-grid">
                      {message.sources.map((source, index) => (
                        <div key={index} className="source-pill" title={source.content || "Source snippet"}>
                          Source {index + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </article>
            ))}

            {isThinking && (
              <div className="typing-indicator">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
                Searching document...
              </div>
            )}
          </div>

          <form className="composer-container" onSubmit={handleSubmit}>
            <div className="composer-wrapper">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={activeDocumentId ? "Type your question..." : "Select a document first"}
                disabled={!activeDocumentId || isThinking}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (question.trim()) handleSubmit(e);
                  }
                }}
              />
              <button 
                type="submit" 
                disabled={!activeDocumentId || isThinking || !question.trim()}
                className="send-button"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
