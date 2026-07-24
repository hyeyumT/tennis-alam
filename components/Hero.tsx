"use client";

import React from "react";
import { Sparkles, Zap, TrendingUp, Target, Bot, ArrowRightCircle } from "lucide-react";

interface HeroProps {
  onSelectApp: (appId: "tutor" | "equation" | "proportion" | "omok") => void;
}

/**
 * [메인 히어로 대시보드 컴포넌트]
 * 메인 칠판 환영 타이틀은 기존대로 2줄로 유지하고,
 * 각 수학 학습 앱 카드들의 제목은 한 줄로 깔끔하게 배치합니다.
 */
export default function Hero({ onSelectApp }: HeroProps) {
  return (
    <section id="hero" className="w-full py-8 md:py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* 칠판 프레임 (아날로그 원목 테두리) */}
      <div className="relative wood-frame rounded-2xl bg-teal-900/90 p-6 sm:p-10 md:p-12 border-4 border-amber-900/80 shadow-2xl overflow-hidden">
        
        {/* 칠판 배지 및 메인 타이틀 (기존대로 즐거운 수학! 아랫줄 배치) */}
        <div className="border-2 border-dashed border-teal-500/40 rounded-xl p-6 sm:p-8 flex flex-col items-center text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-950/80 border border-dashed border-chalk-yellow text-chalk-yellow text-sm font-medium animate-pulse">
            <Sparkles className="w-4 h-4 text-chalk-yellow" />
            <span>아날로그 교실 감성 수학 학습 공간</span>
          </div>

          {/* 메인 타이틀: 기존 2줄 형태 복원 */}
          <h1 className="font-pen text-4xl sm:text-6xl md:text-7xl font-bold text-chalk-white chalk-shadow tracking-wide leading-tight">
            지윤샘과 함께하는 <br />
            <span className="text-chalk-yellow chalk-yellow-shadow underline decoration-dashed decoration-chalk-pink underline-offset-8">
              즐거운 수학!
            </span>
          </h1>

          <p className="font-dodum text-base sm:text-xl text-teal-100/90 max-w-2xl leading-relaxed">
            아래 4가지 수학 학습 도구 중 원하는 <strong>앱 버튼</strong>을 선택해 보세요! <br className="hidden sm:inline" />
            선택한 앱 페이지로 바로 이동하여 몰입감 있게 학습할 수 있습니다.
          </p>

          {/* === 메인 칠판 수학 앱 4대 대형 버튼 카드 (앱 제목 한 줄 표기) === */}
          <div className="w-full pt-4 space-y-4">
            <div className="flex items-center justify-center gap-1.5 text-chalk-yellow font-pen text-2xl sm:text-3xl">
              <span>🚀 학습할 수학 앱을 선택하세요</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full text-left">
              
              {/* 버튼 1: AI 수학 튜터 */}
              <button
                onClick={() => onSelectApp("tutor")}
                className="group relative p-5 bg-teal-950/90 hover:bg-emerald-950/90 rounded-2xl border-2 border-dashed border-chalk-yellow hover:border-emerald-400 shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="p-2.5 bg-emerald-500/20 text-chalk-yellow rounded-xl border border-dashed border-emerald-400">
                      <Bot className="w-6 h-6 text-chalk-yellow" />
                    </span>
                    <span className="text-[11px] font-mono font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700">
                      OpenAI AI 튜터
                    </span>
                  </div>

                  {/* 앱 제목 한 줄로 깔끔 표기 */}
                  <h3 className="font-pen text-2xl sm:text-3xl text-chalk-yellow chalk-yellow-shadow whitespace-nowrap group-hover:scale-105 transition-transform origin-left">
                    🤖 AI 수학 튜터
                  </h3>
                  <p className="text-xs font-dodum text-teal-200/90 leading-relaxed">
                    수학 문제 풀이와 개념 질문에 지윤샘 AI 튜터가 24시간 친절히 실시간 답변해드립니다!
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-dashed border-teal-800 text-xs font-dodum text-chalk-yellow flex items-center justify-between font-bold">
                  <span>앱 실행하기</span>
                  <ArrowRightCircle className="w-4 h-4 text-chalk-yellow group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* 버튼 2: 일차방정식 스피드 랭킹전 */}
              <button
                onClick={() => onSelectApp("equation")}
                className="group relative p-5 bg-teal-950/90 hover:bg-amber-950/80 rounded-2xl border-2 border-dashed border-amber-400 hover:border-amber-300 shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="p-2.5 bg-amber-500/20 text-chalk-yellow rounded-xl border border-dashed border-amber-400">
                      <Zap className="w-6 h-6 fill-chalk-yellow text-chalk-yellow" />
                    </span>
                    <span className="text-[11px] font-mono font-bold text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-700">
                      60초 타임어택
                    </span>
                  </div>

                  {/* 앱 제목 한 줄로 깔끔 표기 */}
                  <h3 className="font-pen text-2xl sm:text-3xl text-chalk-yellow chalk-yellow-shadow whitespace-nowrap group-hover:scale-105 transition-transform origin-left">
                    ⚡ 방정식 랭킹
                  </h3>
                  <p className="text-xs font-dodum text-teal-200/90 leading-relaxed">
                    60초 동안 일차방정식을 풀고 Supabase 명예의 전당 랭킹 보드에 이름을 남기세요!
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-dashed border-teal-800 text-xs font-dodum text-chalk-yellow flex items-center justify-between font-bold">
                  <span>앱 실행하기</span>
                  <ArrowRightCircle className="w-4 h-4 text-chalk-yellow group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* 버튼 3: 정비례·반비례 그래프 탐구기 */}
              <button
                onClick={() => onSelectApp("proportion")}
                className="group relative p-5 bg-teal-950/90 hover:bg-teal-900/90 rounded-2xl border-2 border-dashed border-chalk-pink hover:border-pink-400 shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="p-2.5 bg-pink-500/20 text-chalk-pink rounded-xl border border-dashed border-pink-400">
                      <TrendingUp className="w-6 h-6" />
                    </span>
                    <span className="text-[11px] font-mono font-bold text-pink-300 bg-pink-950 px-2 py-0.5 rounded border border-pink-800">
                      유리수 a 지원
                    </span>
                  </div>

                  {/* 앱 제목 한 줄로 깔끔 표기 */}
                  <h3 className="font-pen text-2xl sm:text-3xl text-chalk-pink chalk-pink-shadow whitespace-nowrap group-hover:scale-105 transition-transform origin-left">
                    📈 비례 그래프
                  </h3>
                  <p className="text-xs font-dodum text-teal-200/90 leading-relaxed">
                    y=ax 직선과 y=a/x 쌍곡선을 유리수 범위까지 조절하며 실시간 좌표평면에서 탐구하세요!
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-dashed border-teal-800 text-xs font-dodum text-chalk-pink flex items-center justify-between font-bold">
                  <span>앱 실행하기</span>
                  <ArrowRightCircle className="w-4 h-4 text-chalk-pink group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* 버튼 4: (0,0) 중심 순서쌍 블라인드 오목 */}
              <button
                onClick={() => onSelectApp("omok")}
                className="group relative p-5 bg-teal-950/90 hover:bg-teal-900/90 rounded-2xl border-2 border-dashed border-chalk-white hover:border-teal-300 shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="p-2.5 bg-teal-500/20 text-chalk-white rounded-xl border border-dashed border-teal-300">
                      <Target className="w-6 h-6" />
                    </span>
                    <span className="text-[11px] font-mono font-bold text-teal-300 bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
                      (0,0) 원점 중심
                    </span>
                  </div>

                  {/* 앱 제목 한 줄로 깔끔 표기 */}
                  <h3 className="font-pen text-2xl sm:text-3xl text-chalk-white chalk-shadow whitespace-nowrap group-hover:scale-105 transition-transform origin-left">
                    🎯 순서쌍 오목
                  </h3>
                  <p className="text-xs font-dodum text-teal-200/90 leading-relaxed">
                    1~4사분면 순서쌍 (x,y)를 기억하며 두는 아날로그 칠판 블라인드 오목 게임입니다!
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-dashed border-teal-800 text-xs font-dodum text-chalk-white flex items-center justify-between font-bold">
                  <span>앱 실행하기</span>
                  <ArrowRightCircle className="w-4 h-4 text-chalk-white group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

            </div>
          </div>

        </div>

        {/* 칠판 하단 장식 */}
        <div className="mt-6 pt-4 border-t-2 border-dashed border-teal-700/50 flex justify-between items-center text-xs text-teal-300/70 font-pen text-lg">
          <span>✏️ 지윤샘의 즐거운 수학 교실</span>
          <span>🚀 앱 선택 시 개별 학습 화면으로 단독 이동합니다</span>
        </div>

      </div>
    </section>
  );
}
