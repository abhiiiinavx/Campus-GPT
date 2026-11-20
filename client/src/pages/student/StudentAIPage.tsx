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
  Trash2,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

const SUGGESTED_PROMPTS = [
  "How is my attendance across all subjects?",
  "My DBMS attendance is low. How many classes do I need to attend to reach 75%?",
  "What classes do I have today?",
  "What is the university attendance and condonation policy?",
  "What are the eligibility criteria for placement drives?",
];

export const StudentAIPage = () => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: "welcome-msg",
      sender: "ai",
      text: "Hello! I am your **CampusIQ AI Assistant**.\n\nI have access to your authenticated student profile, real-time subject attendance, live timetable schedule, and verified university regulations.\n\nHow can I assist your academic journey today?",
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

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await aiService.sendChatMessage(text);

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
      const errorMessage: AIChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: "ai",
        text:
          err.response?.data?.message ||
          "Sorry, I could not process your query right now. Please try again.",
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

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: "ai",
        text: "Chat history cleared. What would you like to explore next?",
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
              CampusIQ AI Assistant
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Context-Aware RAG Engine (Student Records + Regulations)
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          title="Clear Conversation"
          className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
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
                    : "bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-glow"
                }`}
              >
                {isUser ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[85%] sm:max-w-2xl space-y-2`}>
                <div
                  className={`rounded-3xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? "bg-indigo-600 text-white rounded-tr-none shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700/60 shadow-sm"
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm">
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
                          {msg.sources!.length} Verified Campus Document Sources
                          Cited
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
                  Retrieving student records & RAG context...
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
            placeholder="Ask CampusIQ AI anything about your attendance, schedule, or regulations..."
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
