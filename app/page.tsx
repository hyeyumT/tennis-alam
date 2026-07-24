import Header from "@/components/Header";
import Hero from "@/components/Hero";
import BlindOmok from "@/components/BlindOmok";
import ProportionGraph from "@/components/ProportionGraph";
import Footer from "@/components/Footer";

/**
 * [메인 페이지 컴포넌트 (app/page.tsx)]
 * 
 * 💡 구현된 컴포넌트 모듈:
 * 1. Header: 상단 칠판 브랜드 로고 & 네비게이션
 * 2. Hero: 지윤샘 수학 교실 메인 타이틀 & 칠판 환영 세션
 * 3. BlindOmok: (0,0) 중심 좌표평면 및 순서쌍(x, y) 학습용 블라인드 오목 게임
 * 4. ProportionGraph: 정비례(y=ax) & 반비례(y=a/x) 그래프 탐구 및 Supabase DB 연동
 * 5. Footer: 카피라이트 & 선생님 응원 코멘트
 */
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-yellow-300 selection:text-teal-950">
      {/* 1. 상단 네비게이션 헤더 */}
      <Header />

      {/* 2. 메인 컨텐츠 영역 */}
      <main className="flex-1 flex flex-col justify-center items-center space-y-12 py-8">
        {/* 메인 칠판 화면 (Hero Section) */}
        <Hero />

        {/* 정비례 & 반비례 그래프 탐구기 (Supabase DB 연동) */}
        <ProportionGraph />

        {/* 순서쌍 블라인드 오목 게임 (Blind Omok Section) */}
        <BlindOmok />
      </main>

      {/* 3. 하단 푸터 */}
      <Footer />
    </div>
  );
}
