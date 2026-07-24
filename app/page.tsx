"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import MathChatbot from "@/components/MathChatbot";
import EquationGame from "@/components/EquationGame";
import ProportionGraph from "@/components/ProportionGraph";
import BlindOmok from "@/components/BlindOmok";
import Footer from "@/components/Footer";
import { ArrowLeft, Bot, Zap, TrendingUp, Target, LayoutGrid } from "lucide-react";

type AppType = "home" | "tutor" | "equation" | "proportion" | "omok";

/**
 * [메인 동적 라우팅/탭 애플리케이션 (app/page.tsx)]
 * 
 * 💡 UX 개선 사항:
 * - 하단에 모든 앱이 나열되어 길게 스크롤되던 구조를 개선했습니다.
 * - 메인 칠판 대시보드에서 원하는 앱 버튼을 누르면 해당 앱 페이지로 독립 전환됩니다.
 * - 상단 '메인 메뉴로 돌아가기' 버튼 및 퀵 앱 전환 탭을 통해 자유롭게 이동할 수 있습니다.
 */
export default function Home() {
  const [activeApp, setActiveApp] = useState<AppType>("home");

  // URL 해시(#tutor, #equation 등) 동기화 지원
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash === "tutor" || hash === "equation" || hash === "proportion" || hash === "omok") {
        setActiveApp(hash as AppType);
      } else {
        setActiveApp("home");
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const changeApp = (app: AppType) => {
    setActiveApp(app);
    window.location.hash = app === "home" ? "" : app;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-yellow-300 selection:text-teal-950">
      {/* 1. 상단 브랜딩 헤더 */}
      <Header onGoHome={() => changeApp("home")} />

      {/* 2. 메인 컨텐츠 영역 */}
      <main className="flex-1 flex flex-col items-center">
        
        {/* === A. 메인 칠판 대시보드 (activeApp === 'home') === */}
        {activeApp === "home" && (
          <Hero onSelectApp={(selectedApp) => changeApp(selectedApp)} />
        )}

        {/* === B. 개별 앱 페이지 모드 (activeApp !== 'home') === */}
        {activeApp !== "home" && (
          <div className="w-full flex flex-col items-center">
            
            {/* 앱 페이지 상단 서브 네비게이션 서브바 */}
            <div className="w-full bg-teal-950/90 border-b border-dashed border-teal-600/70 sticky top-20 z-40 backdrop-blur-md py-3 px-4 sm:px-6 shadow-md">
              <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
                
                {/* 메인 메뉴로 돌아가기 버튼 */}
                <button
                  onClick={() => changeApp("home")}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-teal-950 font-bold rounded-xl border border-dashed border-amber-900 shadow transition-all flex items-center gap-2 cursor-pointer font-dodum text-sm sm:text-base"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>🔙 칠판 메인 메뉴로 돌아가기</span>
                </button>

                {/* 퀵 앱 전환 탭 바 */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                  <button
                    onClick={() => changeApp("tutor")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-dodum border border-dashed transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                      activeApp === "tutor"
                        ? "bg-teal-800 border-chalk-yellow text-chalk-yellow font-bold shadow"
                        : "bg-teal-900/60 border-teal-700 text-teal-300 hover:text-chalk-white"
                    }`}
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>AI 수학 튜터</span>
                  </button>

                  <button
                    onClick={() => changeApp("equation")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-dodum border border-dashed transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                      activeApp === "equation"
                        ? "bg-teal-800 border-amber-400 text-amber-300 font-bold shadow"
                        : "bg-teal-900/60 border-teal-700 text-teal-300 hover:text-chalk-white"
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>방정식 랭킹</span>
                  </button>

                  <button
                    onClick={() => changeApp("proportion")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-dodum border border-dashed transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                      activeApp === "proportion"
                        ? "bg-teal-800 border-chalk-pink text-chalk-pink font-bold shadow"
                        : "bg-teal-900/60 border-teal-700 text-teal-300 hover:text-chalk-white"
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>비례 그래프</span>
                  </button>

                  <button
                    onClick={() => changeApp("omok")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-dodum border border-dashed transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                      activeApp === "omok"
                        ? "bg-teal-800 border-chalk-white text-chalk-white font-bold shadow"
                        : "bg-teal-900/60 border-teal-700 text-teal-300 hover:text-chalk-white"
                    }`}
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>순서쌍 오목</span>
                  </button>
                </div>

              </div>
            </div>

            {/* 선택된 독립 앱 컴포넌트 렌더링 */}
            <div className="w-full py-4 animate-fadeIn">
              {activeApp === "tutor" && <MathChatbot />}
              {activeApp === "equation" && <EquationGame />}
              {activeApp === "proportion" && <ProportionGraph />}
              {activeApp === "omok" && <BlindOmok />}
            </div>

          </div>
        )}

      </main>

      {/* 3. 하단 푸터 */}
      <Footer />
    </div>
  );
}
