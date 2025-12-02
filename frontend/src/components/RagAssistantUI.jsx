import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Send,
  Moon,
  Sun,
  Bot,
  User,
  Upload,
  AlertCircle,
  CheckCircle,
  Loader,
} from "lucide-react";
import { API_BASE_URL } from "../config";

const RagAssistantUI = ({ sessionId }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ message: "", type: "" });
  const [apiStatus, setApiStatus] = useState({
    connected: false,
    documentsLoaded: false,
  });

  const { token } = useAuth();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  // API Configuration


  // Prevent page scrolling on mount/unmount
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    checkApiConnection();

    return () => {
      document.body.style.overflow = originalOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, []);

  // Fetch messages when sessionId changes
  useEffect(() => {
    if (sessionId) {
      fetchMessages(sessionId);
    } else {
      setMessages([
        {
          id: 1,
          text: "Hello! I'm AI RAG Assistant. Select a chat or start a new one!",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    }
  }, [sessionId]);

  const fetchMessages = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/history/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.map((msg, idx) => ({
          id: idx,
          text: msg.content,
          sender: msg.role === 'assistant' ? 'bot' : 'user',
          timestamp: new Date(msg.created_at)
        })));
      }
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check API connection and status
  const checkApiConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      if (response.ok) {
        const data = await response.json();
        setApiStatus({
          connected: true,
          documentsLoaded: data.documents_loaded,
          chunksCount: data.chunks_count,
        });
      }
    } catch (error) {
      console.error("API connection failed:", error);
      setApiStatus({ connected: false, documentsLoaded: false });
    }
  };

  // Add system message
  const addSystemMessage = (text, type = "info") => {
    const systemMessage = {
      id: Date.now(),
      text: text,
      sender: "system",
      timestamp: new Date(),
      type: type,
    };
    setMessages((prev) => [...prev, systemMessage]);
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    const maxSize = 16 * 1024 * 1024; // 16MB

    if (!allowedTypes.includes(file.type)) {
      setUploadStatus({
        message: "Please upload a PDF, DOCX, or TXT file.",
        type: "error",
      });
      return;
    }

    if (file.size > maxSize) {
      setUploadStatus({
        message: "File size must be less than 16MB.",
        type: "error",
      });
      return;
    }

    setIsUploading(true);
    setUploadStatus({
      message: "Uploading and processing document...",
      type: "loading",
    });

    addSystemMessage(`📄 Uploading "${file.name}"...`);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadStatus({
          message: "Document uploaded successfully! Processing...",
          type: "success",
        });

        addSystemMessage(
          `✅ "${file.name}" uploaded successfully! You can now ask questions about this document.`,
          "success"
        );

        pollUploadStatus();
      } else {
        throw new Error(result.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus({
        message: `Upload failed: ${error.message}`,
        type: "error",
      });
      addSystemMessage(`❌ Upload failed: ${error.message}`, "error");
    }

    setIsUploading(false);
    event.target.value = "";
  };

  // Poll upload status
  const pollUploadStatus = async () => {
    const maxAttempts = 30;
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/upload/status`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true'
          }
        });
        const status = await response.json();

        if (status.is_processing && attempts < maxAttempts) {
          setUploadStatus({
            message: status.message || "Processing document...",
            type: "loading",
          });
          attempts++;
          setTimeout(poll, 1000);
        } else {
          setUploadStatus({
            message: status.message || "Document processed successfully!",
            type: status.message?.includes("Error") ? "error" : "success",
          });

          checkApiConnection();

          setTimeout(() => {
            setUploadStatus({ message: "", type: "" });
          }, 3000);
        }
      } catch (error) {
        console.error("Status polling error:", error);
        setUploadStatus({
          message: "Processing status unknown",
          type: "error",
        });
      }
    };

    poll();
  };

  // Send chat message to backend
  const sendMessageToBackend = async (userMessage) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({
          message: userMessage,
          session_id: sessionId
        }),
      });

      const result = await response.json();

      if (response.ok) {
        const botMessage = {
          id: Date.now(),
          text: result.response,
          sender: "bot",
          timestamp: new Date(),
          sources: result.sources || [],
          chunksUsed: result.chunks_used || 0,
        };

        setMessages((prev) => [...prev, botMessage]);

        if (result.sources && result.sources.length > 0) {
          const sourcesMessage = {
            id: Date.now() + 1,
            text: `📚 Sources: ${result.sources.join(", ")} (${result.chunks_used
              } chunks used)`,
            sender: "system",
            timestamp: new Date(),
            type: "info",
          };
          setMessages((prev) => [...prev, sourcesMessage]);
        }
      } else {
        throw new Error(result.error || "Failed to get response");
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = {
        id: Date.now(),
        text: `❌ Error: ${error.message}. Please make sure the Flask API is running.`,
        sender: "system",
        timestamp: new Date(),
        type: "error",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleSendMessage = async () => {
    if (inputText.trim() === "" || isTyping) return;

    const newMessage = {
      id: Date.now(),
      text: inputText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    const messageText = inputText;
    setInputText("");
    setIsTyping(true);

    await sendMessageToBackend(messageText);
    setIsTyping(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleClearDocuments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/clear`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (response.ok) {
        addSystemMessage("🗑️ All documents cleared successfully!", "success");
        checkApiConnection();
      }
    } catch (error) {
      addSystemMessage("❌ Failed to clear documents", "error");
    }
  };

  const themeClasses = isDarkTheme
    ? "bg-gray-900 text-white"
    : "bg-white text-gray-900";

  const headerClasses = isDarkTheme
    ? "bg-gray-800 border-gray-700"
    : "bg-gray-50 border-gray-200";

  const messageAreaClasses = isDarkTheme ? "bg-gray-800" : "bg-gray-50";

  const inputAreaClasses = isDarkTheme
    ? "bg-gray-800 border-gray-700"
    : "bg-white border-gray-200";

  const userMessageClasses = isDarkTheme
    ? "bg-blue-600 text-white"
    : "bg-blue-500 text-white";

  const botMessageClasses = isDarkTheme
    ? "bg-gray-700 text-gray-100"
    : "bg-gray-200 text-gray-800";

  const systemMessageClasses = (type) => {
    const base = isDarkTheme ? "bg-gray-600" : "bg-gray-100";
    switch (type) {
      case "error":
        return isDarkTheme
          ? "bg-red-900 text-red-200"
          : "bg-red-100 text-red-800";
      case "success":
        return isDarkTheme
          ? "bg-green-900 text-green-200"
          : "bg-green-100 text-green-800";
      case "info":
        return isDarkTheme
          ? "bg-blue-900 text-blue-200"
          : "bg-blue-100 text-blue-800";
      default:
        return base;
    }
  };

  return (
    <div
      className={`font-outfit transition-all duration-300 ${themeClasses} h-full flex flex-col`}
    >
      {/* Header */}
      <div
        className={`
          ${headerClasses}
          border-b-2 px-6 py-4
          flex items-center justify-between
          transition-all duration-300
        `}
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${apiStatus.connected
                ? "bg-green-500 animate-ping"
                : "bg-red-500"
                }`}
            ></div>
          </div>

          <div className="animate-fadeIn">
            <h1 className="text-xl font-bold text-primary">
              AI RAG Assistant
            </h1>
            <p className="text-sm text-gray-500">
              {apiStatus.connected
                ? `${apiStatus.documentsLoaded
                  ? "Document loaded"
                  : "Ready for upload"
                }`
                : "Disconnected"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Upload Status */}
          {uploadStatus.message && (
            <div className="flex items-center space-x-2">
              {uploadStatus.type === "loading" && (
                <Loader className="w-4 h-4 animate-spin" />
              )}
              {uploadStatus.type === "success" && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
              {uploadStatus.type === "error" && (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm">{uploadStatus.message}</span>
            </div>
          )}

          {/* Clear Documents Button */}
          {apiStatus.documentsLoaded && (
            <button
              onClick={handleClearDocuments}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              Clear Docs
            </button>
          )}

          <button
            onClick={toggleTheme}
            className={`
                p-2 rounded-full transition-all duration-300 hover:scale-110
                ${isDarkTheme
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-200 hover:bg-gray-300"
              }
              `}
          >
            {isDarkTheme ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div
        className={`
            flex-1 ${messageAreaClasses}
            overflow-hidden flex flex-col
            `}
      >
        <div
          className="flex-1 overflow-y-auto px-4 py-6 space-y-4 custom-scrollbar"
        >
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`
                    flex items-start space-x-3
                    animate-slideUp
                    ${message.sender === "user"
                  ? "flex-row-reverse space-x-reverse"
                  : ""
                }
                  `}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Avatar */}
              <div
                className={`
                    w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                    ${message.sender === "user"
                    ? "bg-gradient-to-br from-blue-500 to-blue-600"
                    : message.sender === "system"
                      ? "bg-gradient-to-br from-gray-500 to-gray-600"
                      : "bg-gradient-to-br from-purple-500 to-pink-600"
                  }
                    animate-bounceIn
                  `}
              >
                {message.sender === "user" ? (
                  <User className="w-4 h-4 text-white" />
                ) : message.sender === "system" ? (
                  <AlertCircle className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`
                    max-w-xs md:max-w-md lg:max-w-lg
                    px-4 py-3 rounded-2xl
                    ${message.sender === "user"
                    ? userMessageClasses
                    : message.sender === "system"
                      ? systemMessageClasses(message.type)
                      : botMessageClasses
                  }
                    shadow-lg transform transition-all duration-300
                    animate-fadeIn
                  `}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.text}
                </p>
                <div
                  className={`
                      text-xs mt-2 opacity-70
                      ${message.sender === "user"
                      ? "text-blue-100"
                      : "text-gray-500"
                    }
                    `}
                >
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start space-x-3 animate-slideUp">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div
                className={`
                    px-4 py-3 rounded-2xl ${botMessageClasses}
                    shadow-lg animate-pulse
                  `}
              >
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div
        className={`
            ${inputAreaClasses}
            border-t-2 p-4
            animate-slideUp
            `}
      >
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                apiStatus.documentsLoaded
                  ? "Ask questions about your document..."
                  : "Upload a document first, then ask questions..."
              }
              disabled={!apiStatus.connected || !sessionId}
              className={`
                    w-full px-4 py-3 rounded-full
                    resize-none outline-none
                    transition-all duration-300
                    ${isDarkTheme
                  ? "bg-gray-700 text-white placeholder-gray-400 focus:bg-gray-600"
                  : "bg-gray-100 text-gray-900 placeholder-gray-500 focus:bg-white"
                }
                    focus:ring-2 focus:ring-primary
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
              rows={1}
              style={{ minHeight: "50px", maxHeight: "120px" }}
            />
          </div>

          <div className="flex items-end h-full space-x-2">
            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={
                inputText.trim() === "" || isTyping || !apiStatus.connected || !sessionId
              }
              className={`
                    w-14 h-14 rounded-full
                    bg-primary hover:bg-blue-600
                    disabled:bg-gray-400 disabled:cursor-not-allowed
                    flex items-center justify-center
                    transition-all duration-300 transform
                    hover:scale-110 active:scale-95
                    disabled:hover:scale-100
                    shadow-lg hover:shadow-xl
                    align-bottom
                  `}
              style={{ marginBottom: "2px" }}
            >
              <Send className="w-5 h-5 text-white" />
            </button>

            {/* Upload Button */}
            <label
              className={`
                    w-14 h-14 rounded-full
                    ${isUploading
                  ? "bg-blue-400"
                  : "bg-gray-300 hover:bg-gray-400"
                }
                    flex items-center justify-center
                    transition-all duration-300 transform
                    hover:scale-110 active:scale-95
                    shadow-lg hover:shadow-xl
                    cursor-pointer
                    align-bottom
                    ${isUploading || !sessionId ? "cursor-not-allowed opacity-50" : ""}
                  `}
              style={{ marginBottom: "2px" }}
              title="Upload document (PDF, DOCX, TXT)"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                style={{ display: "none" }}
                onChange={handleFileUpload}
                disabled={isUploading || !sessionId}
              />
              {isUploading ? (
                <Loader className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Upload className="w-5 h-5 text-gray-700" />
              )}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RagAssistantUI;
