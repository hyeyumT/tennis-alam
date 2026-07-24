import Header from "@/components/Header";
import Hero from "@/components/Hero";
import MathChatbot from "@/components/MathChatbot";
import EquationGame from "@/components/EquationGame";
import ProportionGraph from "@/components/ProportionGraph";
import BlindOmok from "@/components/BlindOmok";
import Footer from "@/components/Footer";

/**
 * [메인 페이지 컴포넌트 (app/page.tsx)]
 * 
 * 💡 구현된 수학 교육 모듈 리스트:
 * 1. Header: 브랜드 로고 및 교실 배지
 * 2. Hero: 아날로그 칠판 메인 세션 & 4대 앱 대형 버튼 카드
 * 3. MathChatbot: OpenAI API 연동 지윤샘 AI 수학 튜터 챗봇
 * 4. EquationGame: 60초 일차방정식 스피드 랭킹 게임 & Supabase 명예의 전당
 * 5. ProportionGraph: 정비례·반비례 그래프 탐구기 (유리수 범위) & Supabase 연동
 * 6. BlindOmok: (0,0) 중심 좌표평면 순서쌍 블라인드 오목 게임
 * 7. Footer: 카피라이트 & 선생님 응원 코멘트
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

        {/* OpenAI 연동 지윤샘 AI 수학 튜터 챗봇 (Math Chatbot Section) */}
        <MathChatbot />

        {/* 일차방정식 스피드 랭킹 게임 (Equation Game Section) */}
        <EquationGame />

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
