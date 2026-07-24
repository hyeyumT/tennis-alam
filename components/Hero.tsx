"use client";

import React, { useState } from "react";
import { Sparkles, Pencil, Rocket, CheckCircle2 } from "lucide-react";

/**
 * [메인 히어로 세션 컴포넌트]
 * 아날로그 교실의 대형 칠판과 원목 틀 느낌의 레이아웃입니다.
 * "지윤샘과 함께하는 즐거운 수학" 환영 문구와 가짜(Placeholder) 버튼을 포함합니다.
 */
export default function Hero() {
  // 선생님들이 나중에 버튼 클릭 이벤트 등의 로직을 쉽게 작성할 수 있도록 예시 상태를 준비했습니다.
  const [clickedCount, setClickedCount] = useState<number>(0);

  const handlePlaceholderClick = () => {
    setClickedCount((prev) => prev + 1);
    alert(`🎉 지윤샘과 수학 공부 시작! (버튼 클릭 횟수: ${clickedCount + 1}회)`);
  };

  return (
    <section id="hero" className="w-full py-12 md:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* 칠판 틀 (아날로그 원목 테두리 & 깊이감) */}
      <div className="relative wood-frame rounded-2xl bg-teal-900/90 p-6 sm:p-10 md:p-14 border-4 border-amber-900/80 shadow-2xl overflow-hidden">
        
        {/* 칠판 상단 장식: 분필 받침대 및 지우개 모티브 */}
        <div className="absolute top-0 right-8 bg-amber-950 px-4 py-1 rounded-b-md text-amber-200/60 text-xs font-mono border-t-0 border border-amber-800 hidden sm:block">
          지윤샘의 칠판 #01
        </div>

        {/* 칠판 점선 데코레이션 */}
        <div className="border-2 border-dashed border-teal-500/40 rounded-xl p-6 sm:p-10 flex flex-col items-center text-center space-y-6">
          
          {/* 배지 */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-950/80 border border-dashed border-chalk-yellow text-chalk-yellow text-sm font-medium animate-pulse">
            <Sparkles className="w-4 h-4 text-chalk-yellow" />
            <span>아날로그 교실 감성 칠판</span>
          </div>

          {/* 메인 타이틀 (환영 문구) */}
          <h1 className="font-pen text-4xl sm:text-6xl md:text-7xl font-bold text-chalk-white chalk-shadow tracking-wide leading-tight">
            지윤샘과 함께하는 <br />
            <span className="text-chalk-yellow chalk-yellow-shadow underline decoration-dashed decoration-chalk-pink underline-offset-8">
              즐거운 수학!
            </span>
          </h1>

          {/* 설명 문구 */}
          <p className="font-dodum text-base sm:text-xl text-teal-100/90 max-w-2xl leading-relaxed">
            어려운 수학도 지윤샘과 함께라면 쉽게 풀려요. <br className="hidden sm:inline" />
            손글씨 칠판 느낌의 공간에서 흥미로운 수학 개념과 다양한 문제를 함께 탐구해보세요.
          </p>

          {/* 분필 색상 포인트 가이드 카드 (확장성 고려 예시) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl py-2">
            <div className="p-3 bg-teal-950/50 rounded-lg border border-dashed border-chalk-white/30 text-center">
              <span className="text-chalk-white font-pen text-xl">⚪ 흰색 분필</span>
              <p className="text-xs text-teal-200/80 mt-1">핵심 개념 정리</p>
            </div>
            <div className="p-3 bg-teal-950/50 rounded-lg border border-dashed border-chalk-yellow/40 text-center">
              <span className="text-chalk-yellow font-pen text-xl">🟡 노란 분필</span>
              <p className="text-xs text-teal-200/80 mt-1">중요 공식 강조</p>
            </div>
            <div className="p-3 bg-teal-950/50 rounded-lg border border-dashed border-chalk-pink/40 text-center">
              <span className="text-chalk-pink font-pen text-xl">🩷 핑크 분필</span>
              <p className="text-xs text-teal-200/80 mt-1">꿀팁 & 퀴즈</p>
            </div>
          </div>

          {/* 3. 요구사항 [필수]: 기능 추가를 위한 가짜(Placeholder) 버튼 1개 */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
            <button
              onClick={handlePlaceholderClick}
              className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-400 active:translate-y-0.5 text-teal-950 font-bold text-lg rounded-xl shadow-lg border-2 border-dashed border-amber-900 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <Rocket className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>지윤샘 수학 시작하기</span>
              <Pencil className="w-4 h-4 ml-1 opacity-70 group-hover:opacity-100" />
            </button>
          </div>

          {/* 클릭 상태 확인 피드백 코멘트 */}
          {clickedCount > 0 && (
            <p className="text-xs text-chalk-yellow font-pen text-lg flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              선생님! 버튼이 성공적으로 동작하고 있어요 (누른 횟수: {clickedCount})
            </p>
          )}

        </div>

        {/* 칠판 하단 분필 받침대 디자인 요소 */}
        <div className="mt-6 pt-4 border-t-2 border-dashed border-teal-700/50 flex justify-between items-center text-xs text-teal-300/70 font-pen text-lg">
          <span>✏️ 분필 한 자루: 지윤샘의 첫 수학 웹앱</span>
          <span>🧹 지우개: 언제든 코드를 자유롭게 수정하세요</span>
        </div>
      </div>
    </section>
  );
}
