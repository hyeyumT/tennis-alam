import React from "react";
import { GraduationCap } from "lucide-react";

interface HeaderProps {
  onGoHome?: () => void;
}

/**
 * [상단 헤더 컴포넌트]
 * 서비스 로고("수학은 이지윤")를 클릭하면 언제든 메인 대시보드로 돌아갈 수 있도록 지원합니다.
 */
export default function Header({ onGoHome }: HeaderProps) {
  return (
    <header className="w-full border-b-2 border-dashed border-teal-600/60 bg-teal-950/40 backdrop-blur-sm sticky top-0 z-50 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* 서비스 로고 (클릭 시 메인 칠판 대시보드로 이동) */}
        <button onClick={onGoHome} className="flex items-center gap-3 group text-left cursor-pointer">
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
        </button>

        {/* 우측 서브 안내 태그 */}
        <div className="flex items-center">
          <button
            onClick={onGoHome}
            className="px-3.5 py-1.5 text-xs font-medium text-chalk-yellow bg-teal-900/80 hover:bg-teal-800 border border-dashed border-chalk-yellow/60 rounded-full shadow-sm cursor-pointer transition-colors"
          >
            🏫 지윤샘의 수학 교실
          </button>
        </div>

      </div>
    </header>
  );
}
