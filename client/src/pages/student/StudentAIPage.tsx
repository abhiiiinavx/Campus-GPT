import { useState, useRef, useEffect } from "react";
import { aiService } from "../../services/ai.service.js";
import { AIChatMessage, RAGSource } from "../../types/index.js";
import { Button } from "../../components/common/Button.js";
import {
  Sparkles,
  Send,
  User,
  Bot,
  FileText,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

const SUGGESTED_PROMPTS = [
  "What is artificial intelligence?",
  "Explain binary search in C++.",
  "What is the difference between SQL and NoSQL?",
  "Give me a 30-day placement preparation plan.",
  "How is my attendance across all subjects?",
  "What classes do I have today?",
];

export const StudentAIPage = () => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: "welcome-msg",
      sender: "ai",
      text: "Hello! I am your **CampusIQ AI Assistant** powered by Google Gemini.\n\nI can answer questions across computer science, programming in any language, algorithmic problems, career & placement roadmaps, as well as your live attendance, timetable, and campus documents.\n\nHow can I help you today?",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [openSourcesId, setOpenSourcesId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMessage: AIChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // Extract prior conversation turns for multi-turn conversational memory
    const historyPayload = messages
      .filter((m) => m.id !== "welcome-msg" && !m.id.startsWith("ai-err-"))
      .map((m) => ({
        role: (m.sender === "ai" ? "model" : "user") as "model" | "user",
        text: m.text,
      }));

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await aiService.sendChatMessage(text, historyPayload);

      const aiMessage: AIChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: response.answer,
        sources: response.sources,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      const errorText =
        err.response?.data?.message ||
        err.message ||
        "Could not generate an AI response. Please verify that a valid GEMINI_API_KEY is configured in server/.env.";

      const errorMessage: AIChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: "ai",
        text: `⚠️ **AI Service Notice**: ${errorText}`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNewConversation = () => {
    setMessages([
      {
        id: "welcome-msg",
        sender: "ai",
        text: "Fresh conversation started! Previous history cleared.\n\nAsk me any question about programming, algorithms, academic subjects, placement preparation, or your campus schedule.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] max-h-[900px] rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xl overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-glow">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              CampusIQ Conversational AI
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Multi-Turn Memory • Gemini LLM Engine • Context-Aware RAG
            </p>
          </div>
        </div>

        <button
          onClick={handleStartNewConversation}
          title="Start Fresh Conversation"
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          const isError = msg.id.startsWith("ai-err-");
          const hasSources = msg.sources && msg.sources.length > 0;
          const isSourceOpen = openSourcesId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3.5 ${isUser ? "flex-row-reverse" : ""}`}
            >
              {/* Avatar */}
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${
                  isUser
                    ? "bg-indigo-600 text-white"
                    : isError
                      ? "bg-rose-500 text-white"
                      : "bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-glow"
                }`}
              >
                {isUser ? (
                  <User className="h-4 w-4" />
                ) : isError ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>

              {/* Message Bubble */}
              <div className="max-w-[85%] sm:max-w-2xl space-y-2">
                <div
                  className={`rounded-3xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? "bg-indigo-600 text-white rounded-tr-none shadow-sm"
                      : isError
                        ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-tl-none"
                        : "bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700/60 shadow-sm"
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm overflow-x-auto">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  )}
                </div>

                {/* Source Citations Drawer if RAG documents were cited */}
                {hasSources && (
                  <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/30 p-3 text-xs">
                    <button
                      onClick={() =>
                        setOpenSourcesId(isSourceOpen ? null : msg.id)
                      }
                      className="flex items-center justify-between w-full font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      <span className="flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5" />
                        <span>
                          {msg.sources!.length} Verified Campus Document Sources Cited
                        </span>
                      </span>
                      {isSourceOpen ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>

                    {isSourceOpen && (
                      <div className="mt-3 space-y-2 border-t border-indigo-200 dark:border-indigo-900/60 pt-2.5">
                        {msg.sources!.map((src, i) => (
                          <div
                            key={i}
                            className="rounded-xl bg-white dark:bg-slate-900 p-2.5 border border-slate-200 dark:border-slate-800"
                          >
                            <div className="flex items-center justify-between font-bold text-[11px] text-slate-900 dark:text-white">
                              <span>{src.title}</span>
                              {src.page && (
                                <span className="text-[10px] text-slate-400">
                                  Page {src.page}
                                </span>
                              )}
                            </div>
                            {src.snippet && (
                              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 italic">
                                "{src.snippet}"
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div
                  className={`text-[10px] text-slate-400 px-1 ${
                    isUser ? "text-right" : "text-left"
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-glow">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-3xl rounded-tl-none border border-slate-200 dark:border-slate-700/60 bg-slate-100 dark:bg-slate-800/80 p-4">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" />
                <span
                  className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
                <span
                  className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                />
                <span className="text-xs text-slate-400 font-medium ml-2">
                  Gemini is thinking and reasoning...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-4 py-2 overflow-x-auto flex gap-2">
        {SUGGESTED_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={isLoading}
            className="rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 px-3 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 whitespace-nowrap transition-colors"
          >
            💬 {prompt}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask anything (AI, code, placement prep, timetable, attendance)..."
            disabled={isLoading}
            className="flex-1 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <Button
            type="submit"
            variant="glow"
            size="md"
            disabled={!inputMessage.trim() || isLoading}
            icon={<Send className="h-4 w-4" />}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};
