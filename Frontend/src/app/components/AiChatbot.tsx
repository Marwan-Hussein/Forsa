import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, Loader2 } from "lucide-react"; // Removed MessageCircle, User since they aren't used
import { apiPost } from "../api/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import ForsaChatBotIcon from "../../assets/ForsaChatBotIcon.svg";

interface ChatMessage {
  content: string;
  isUser: boolean;
}

export function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, isLoading]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const token = localStorage.getItem("forsa_token");
    if (!token) {
      toast.error("Please login to chat with the AI assistant");
      return;
    }

    const newMessage = message.trim();
    setMessage(""); // clear input
    setHistory((prev) => [...prev, { content: newMessage, isUser: true }]);
    setIsLoading(true);

    try {
      const res = await apiPost<{ response: string }>("/api/LLM/ask", {
        message: newMessage,
        history: history,
      });

      setHistory((prev) => [
        ...prev,
        { content: res.response || "No response received.", isUser: false },
      ]);
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to get response from AI");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button Container */}
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className={`group h-14 w-14 hover:w-48 bg-gradient-to-r from-[#0ffff2] to-[#995cff] text-white flex items-center justify-center hover:justify-start rounded-full shadow-2xl transition-all duration-300 ease-in-out p-4 overflow-hidden ${
            isOpen ? "hidden" : "flex"
          }`}
        >
          {/* Logo Icon */}
          <img
          src={ForsaChatBotIcon}
          alt="Forsa AI Logo"
          className="w-12 h-12 min-w-12 object-contain transition-transform duration-300 ease-in-out group-hover:-rotate-12"
          />

          {/* Text that shows on hover */}
          <span className="opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-xs group-hover:ml-3 transition-all duration-300 ease-in-out whitespace-nowrap font-medium text-sm text-slate-900">
            Ask Forsa AI Assistant
          </span>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-6 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-50"
          >
            {/* Header */}
            <div className="bg-[#1E3D61] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <h3 className="font-bold">Forsa AI Assistant</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
              {history.length === 0 && (
                <div className="text-center text-slate-400 mt-10 text-sm">
                  Hello! How can I help you find the best events today?
                </div>
              )}
              {history.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      msg.isUser
                        ? "bg-[#1E3D61] text-white rounded-br-none"
                        : "bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] p-3 rounded-2xl text-sm bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#1E3D61]" />
                    <span>Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 bg-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-[#1E3D61]/50 text-sm"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !message.trim()}
                className="w-10 h-10 bg-[#1E3D61] text-white rounded-xl flex items-center justify-center hover:bg-[#152e4d] disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}