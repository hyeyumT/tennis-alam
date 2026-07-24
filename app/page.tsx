import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";

/**
 * [메인 페이지 컴포넌트 (app/page.tsx)]
 * 
 * 💡 코딩 초보자 선생님을 위한 가이드:
 * - 이 파일은 웹 사이트 접속 시 가장 먼저 보여지는 메인 화면입니다.
 * - Header (상단 헤더), Hero (메인 칠판 화면), Footer (하단 푸터) 컴포넌트로 나뉘어져 있습니다.
 * - 새로운 기능이나 메뉴(예: 수학 퀴즈, 문제 은행, 게시판 등)를 추가하고 싶으시다면
 *   `components/` 폴더 안에 새로운 컴포넌트 파일(예: Quiz.tsx)을 만드신 후
 *   이곳 `<main>` 태그 안쪽에 불러와 배치하시면 됩니다!
 */
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-yellow-300 selection:text-teal-950">
      {/* 1. 상단 네비게이션 헤더 */}
      <Header />

      {/* 2. 메인 아날로그 칠판 화면 (Hero Section) */}
      <main className="flex-1 flex flex-col justify-center items-center">
        <Hero />
      </main>

      {/* 3. 하단 푸터 */}
      <Footer />
    </div>
  );
}
