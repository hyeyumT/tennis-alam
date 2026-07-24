import React from "react";
import { BookOpen, Sparkles, GraduationCap, Target, TrendingUp, Zap } from "lucide-react";

/**
 * [상단 헤더 컴포넌트]
 * 서비스 로고("수학은 이지윤")와 네비게이션 바 공간을 포함합니다.
 * 교실 칠판 상단 느낌을 주기 위해 분필 점선(border-dashed) 디자인을 적용했습니다.
 */
export default function Header() {
  return (
    <header className="w-full border-b-2 border-dashed border-teal-600/60 bg-teal-950/40 backdrop-blur-sm sticky top-0 z-50 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* 1. 서비스 로고 영역 */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="p-2.5 bg-teal-900 rounded-lg border-2 border-dashed border-chalk-yellow shadow-md group-hover:scale-105 transition-transform">
            <GraduationCap className="w-7 h-7 text-chalk-yellow" />
          </div>
          <div>
            <span className="font-pen text-3xl sm:text-4xl text-chalk-yellow chalk-yellow-shadow tracking-wider block leading-none">
              수학은 이지윤
            </span>
            <span className="text-xs text-teal-300/80 font-dodum tracking-widest uppercase">
              Classroom Math Space
            </span>
          </div>
        </div>

        {/* 2. 네비게이션 메뉴 공간 */}
        <nav className="hidden md:flex items-center gap-2">
          <a
            href="#hero"
            className="px-3 py-2 text-chalk-white font-pen text-2xl hover:text-chalk-yellow transition-colors border-b-2 border-transparent hover:border-dashed hover:border-chalk-yellow flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4 text-teal-300" />
            수업 홈
          </a>
          <a
            href="#equation-game"
            className="px-3 py-2 text-chalk-white font-pen text-2xl hover:text-chalk-yellow transition-colors border-b-2 border-transparent hover:border-dashed hover:border-chalk-yellow flex items-center gap-1.5"
          >
            <Zap className="w-4 h-4 text-chalk-yellow" />
            방정식 랭킹
          </a>
          <a
            href="#blind-omok"
            className="px-3 py-2 text-chalk-white font-pen text-2xl hover:text-chalk-yellow transition-colors border-b-2 border-transparent hover:border-dashed hover:border-chalk-yellow flex items-center gap-1.5"
          >
            <Target className="w-4 h-4 text-chalk-yellow" />
            순서쌍 오목
          </a>
          <a
            href="#proportion-graph"
            className="px-3 py-2 text-chalk-white font-pen text-2xl hover:text-chalk-yellow transition-colors border-b-2 border-transparent hover:border-dashed hover:border-chalk-yellow flex items-center gap-1.5"
          >
            <TrendingUp className="w-4 h-4 text-chalk-pink" />
            비례 그래프
          </a>
          <a
            href="#features"
            className="px-4 py-2 text-chalk-white font-pen text-2xl hover:text-chalk-yellow transition-colors border-b-2 border-transparent hover:border-dashed hover:border-chalk-yellow flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-chalk-pink" />
            즐거운 수학
          </a>
        </nav>

        {/* 3. 우측 서브 안내 태그 */}
        <div className="flex items-center">
          <span className="px-3 py-1 text-xs font-medium text-chalk-yellow bg-teal-900/80 border border-dashed border-chalk-yellow/50 rounded-full">
            🏫 지윤샘의 수학 교실
          </span>
        </div>
      </div>
    </header>
  );
}
