import React from "react";
import { Heart } from "lucide-react";

/**
 * [하단 푸터 컴포넌트]
 * 카피라이트 공간과 초보 선생님들을 위한 친절한 설명 주석이 포함되어 있습니다.
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full mt-auto border-t-2 border-dashed border-teal-600/60 bg-teal-950/60 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        
        {/* 카피라이트 문구 */}
        <div>
          <p className="font-pen text-2xl text-chalk-yellow chalk-yellow-shadow">
            수학은 이지윤 ✏️
          </p>
          <p className="text-xs text-teal-300/80 font-dodum mt-1">
            © {currentYear} 수학은 이지윤. All rights reserved.
          </p>
        </div>

        {/* 선생님을 위한 응원 메시지 및 안내 */}
        <div className="flex items-center gap-2 text-sm text-teal-200/90 font-dodum bg-teal-900/60 px-4 py-2 rounded-lg border border-dashed border-teal-500/40">
          <span>선생님의 즐거운 수학 수업을 응원합니다</span>
          <Heart className="w-4 h-4 text-pink-400 fill-pink-400 animate-pulse" />
        </div>

      </div>
    </footer>
  );
}
