import React from "react";
import { GraduationCap } from "lucide-react";

/**
 * [상단 헤더 컴포넌트]
 * 서비스 로고("수학은 이지윤")와 교실 배지만을 깔끔하게 유지합니다.
 * (메인 수학 모듈들은 메인 화면의 큰 버튼 카드 패널로 배치됩니다)
 */
export default function Header() {
  return (
    <header className="w-full border-b-2 border-dashed border-teal-600/60 bg-teal-950/40 backdrop-blur-sm sticky top-0 z-50 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* 서비스 로고 영역 */}
        <a href="#hero" className="flex items-center gap-3 group">
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
        </a>

        {/* 우측 서브 안내 태그 */}
        <div className="flex items-center">
          <span className="px-3.5 py-1.5 text-xs font-medium text-chalk-yellow bg-teal-900/80 border border-dashed border-chalk-yellow/60 rounded-full shadow-sm">
            🏫 지윤샘의 수학 교실
          </span>
        </div>

      </div>
    </header>
  );
}
