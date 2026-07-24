import type { Metadata } from "next";
import { Gowun_Dodum, Gaegu } from "next/font/google";
import "./globals.css";

// 1. 구글 폰트 설정 (아날로그 칠판 감성을 위한 고운돋움 & 개구 손글씨 폰트)
const gowunDodum = Gowun_Dodum({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-gowun-dodum",
  display: "swap",
});

const gaegu = Gaegu({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-nanum-pen",
  display: "swap",
});

// 2. 검색엔진 최적화(SEO) 및 브라우저 탭 기본 메타데이터 설정
export const metadata: Metadata = {
  title: "수학은 이지윤 | 지윤샘과 함께하는 즐거운 수학",
  description: "선생님과 학생들이 함께 이용하는 아날로그 교실 칠판 감성의 수학 교육 서비스입니다.",
  keywords: ["수학은 이지윤", "이지윤", "수학 교육", "초등 수학", "중등 수학", "교육용 웹앱"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${gowunDodum.variable} ${gaegu.variable}`}>
      <body className="font-dodum chalkboard-bg text-chalk-white min-h-screen flex flex-col antialiased selection:bg-yellow-400 selection:text-teal-950">
        {/* 전체 앱 화면 컴포넌트 출력 */}
        {children}
      </body>
    </html>
  );
}
