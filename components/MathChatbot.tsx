"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, User, Sparkles, RefreshCw, Lightbulb } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  isFallback?: boolean;
}

const SUGGESTED_QUESTIONS = [
  "💡 일차방정식 2x + 3 = 11 수식 풀이 과정 알려줘!",
  "📈 정비례(y=ax)와 반비례(y=a/x) 관계식 차이점이 궁금해요",
  "🧭 좌표평면에서 제3사분면 순서쌍 (x, y) 부호는?",
  "✏️ y = 0.5x 그래프의 특징을 수식으로 알려줘",
];

/**
 * [수학 수식 파싱 렌더러 컴포넌트]
 * $...$ 인라인 수식과 $$...$$ 블록 수식을 아날로그 칠판 분필 수식 뱃지로 아름답게 렌더링합니다.
 */
function MathFormattedText({ content }: { content: string }) {
  // $$...$$ 블록 수식 파싱
  const blocks = content.split(/(\$\$[\s\S]*?\$\$)/g);

  return (
    <div className="space-y-1.5 leading-relaxed">
      {blocks.map((block, bIdx) => {
        if (block.startsWith("$$") && block.endsWith("$$")) {
          // \frac{a}{b} -> (a / b) 분수 변환 및 수식 정리
          const formula = block
            .slice(2, -2)
            .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1 / $2)")
            .replace(/\\rightarrow/g, "➔")
            .replace(/\\neq/g, "≠")
            .trim();

          return (
            <div
              key={`block-${bIdx}`}
              className="my-2 p-3 bg-teal-950/95 border-2 border-dashed border-chalk-yellow rounded-xl text-center font-mono text-lg sm:text-xl text-chalk-yellow chalk-yellow-shadow tracking-wider shadow-inner"
            >
              {formula}
            </div>
          );
        }

        // $...$ 인라인 수식 파싱
        const parts = block.split(/(\$.*?\$)/g);
        return (
          <span key={`text-${bIdx}`}>
            {parts.map((part, pIdx) => {
              if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
                const formula = part
                  .slice(1, -1)
                  .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1 / $2)")
                  .replace(/\\rightarrow/g, "➔")
                  .replace(/\\neq/g, "≠")
                  .trim();

                return (
                  <span
                    key={`inline-${pIdx}`}
                    className="font-mono text-chalk-yellow bg-teal-950 px-2 py-0.5 rounded-md border border-dashed border-chalk-yellow/70 font-bold mx-1 inline-block text-sm sm:text-base shadow-sm"
                  >
                    {formula}
                  </span>
                );
              }
              return part;
            })}
          </span>
        );
      })}
    </div>
  );
}

/**
 * [지윤샘 AI 수학 튜터 챗봇 컴포넌트]
 */
export default function MathChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "ai",
      text: "안녕하세요! **지윤샘의 AI 수학 튜터**에 오신 것을 환영해요 🤖✏️\n\n일차방정식 풀이 $ax + b = c$, 정비례 $y = ax$, 반비례 $y = \\frac{a}{x}$, 좌표평면 $(x,y)$에 대해 모든 질문을 단계별 **수식**으로 깔끔하게 해설해 드립니다!",
      timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [inputQuery, setInputQuery] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (queryToSend?: string) => {
    const textToSubmit = (queryToSend || inputQuery).trim();
    if (!textToSubmit || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSubmit,
      timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryToSend) setInputQuery("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/math-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSubmit,
          history: messages,
        }),
      });

      const data = await response.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: data.reply || data.error || "답변을 가져오는 중 오류가 발생했습니다.",
        timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
        isFallback: data.isFallback,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: "ai",
        text: "네트워크 통신 중 에러가 발생했습니다. 잠시 후 다시 질문해 주세요!",
        timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: "welcome-reset",
        sender: "ai",
        text: "대화 내용이 초기화되었어요! 궁금한 수식이나 수학 질문을 입력해 주세요 ✏️",
        timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <section id="math-tutor" className="w-full py-10 px-4 sm:px-6 max-w-5xl mx-auto">
      {/* 헤더 타이틀 */}
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-950 rounded-full border border-dashed border-chalk-yellow text-chalk-yellow text-xs font-mono">
          <Bot className="w-4 h-4 text-chalk-yellow" />
          <span>수식 렌더링 지원 24시간 실시간 AI 수학 멘토</span>
        </div>
        <h2 className="font-pen text-3xl sm:text-4xl md:text-5xl text-chalk-yellow chalk-yellow-shadow tracking-wide whitespace-nowrap">
          🤖 지윤샘 AI 수학 튜터
        </h2>
        <p className="font-dodum text-sm sm:text-base text-teal-100/90 max-w-2xl mx-auto">
          궁금한 수학 문제나 공식을 입력해 보세요. <br />
          지윤샘 AI가 단계별 <strong>수식($...$)</strong>과 함께 알기 쉽게 해설해 드립니다!
        </p>
      </div>

      {/* 칠판 챗봇 메인 프레임 */}
      <div className="wood-frame bg-teal-900 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4">
        
        {/* 상단 컨트롤 바 */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-teal-700/60 text-xs font-dodum">
          <div className="flex items-center gap-2 text-chalk-yellow font-pen text-2xl">
            <Sparkles className="w-5 h-5 text-chalk-yellow" />
            <span>수식 자동 변환 Q&amp;A 칠판</span>
          </div>

          <button
            onClick={handleResetChat}
            className="px-3 py-1 bg-teal-950 hover:bg-teal-800 text-teal-300 rounded-lg border border-dashed border-teal-600 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>대화 새로고침</span>
          </button>
        </div>

        {/* 챗봇 대화 스크롤 영역 */}
        <div className="bg-teal-950/80 rounded-xl p-4 sm:p-6 border-2 border-dashed border-teal-600/60 min-h-[380px] max-h-[500px] overflow-y-auto space-y-4 shadow-inner">
          
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* 프로필 아바타 */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 border-dashed ${
                  msg.sender === "user"
                    ? "bg-amber-500 text-teal-950 border-amber-800"
                    : "bg-teal-800 text-chalk-yellow border-chalk-yellow shadow-md"
                }`}
              >
                {msg.sender === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>

              {/* 말풍선 버블 */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl border border-dashed space-y-1 ${
                  msg.sender === "user"
                    ? "bg-amber-500/20 border-amber-400/60 text-chalk-yellow text-right rounded-tr-none"
                    : "bg-teal-900/90 border-teal-500/50 text-chalk-white rounded-tl-none shadow-md"
                }`}
              >
                <div className="flex items-center justify-between gap-4 text-[10px] text-teal-300/70 font-mono mb-1">
                  <span className="font-bold font-pen text-sm text-chalk-yellow">
                    {msg.sender === "user" ? "나" : "지윤샘 AI 튜터 🤖"}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* 수식 파싱 렌더러 적용 */}
                <div className="font-dodum text-sm sm:text-base whitespace-pre-wrap break-words">
                  <MathFormattedText content={msg.text} />
                </div>
              </div>
            </div>
          ))}

          {/* AI 생성 중 인디케이터 */}
          {isTyping && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-teal-800 text-chalk-yellow border-2 border-dashed border-chalk-yellow flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="w-5 h-5" />
              </div>
              <div className="p-4 bg-teal-900/90 border border-dashed border-teal-500/50 text-chalk-yellow rounded-2xl rounded-tl-none font-dodum text-sm flex items-center gap-2 animate-pulse">
                <Sparkles className="w-4 h-4 text-chalk-yellow animate-spin" />
                <span>지윤샘 AI 튜터가 수식을 정리하며 칠판에 적고 있어요... ✏️</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* 추천 수학 질문 칩 패널 */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center gap-1 text-xs text-chalk-yellow font-pen text-lg">
            <Lightbulb className="w-4 h-4 text-chalk-yellow" />
            <span>추천 수식 질문 클릭해보기:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={`suggest-${idx}`}
                onClick={() => handleSendMessage(q)}
                disabled={isTyping}
                className="px-3 py-1.5 bg-teal-950 hover:bg-teal-800 disabled:opacity-50 text-teal-200 hover:text-chalk-yellow border border-dashed border-teal-600 rounded-xl text-xs font-dodum transition-all cursor-pointer text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* 질문 입력 서브밋 폼 */}
        <form onSubmit={handleSubmit} className="flex gap-2 pt-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="방정식이나 공식을 입력하세요! (예: 2x + 3 = 11 수식 풀이 과정)"
              disabled={isTyping}
              className="w-full px-4 py-3 bg-teal-950 border-2 border-dashed border-teal-500 rounded-xl text-chalk-white font-dodum text-sm sm:text-base focus:outline-none focus:border-chalk-yellow disabled:opacity-60"
            />
          </div>

          <button
            type="submit"
            disabled={!inputQuery.trim() || isTyping}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-teal-950 font-bold text-base rounded-xl border-2 border-dashed border-amber-900 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <span>질문하기</span>
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </section>
  );
}
