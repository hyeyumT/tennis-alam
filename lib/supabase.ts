import { createClient } from "@supabase/supabase-js";

// Vercel / Supabase 환경 변수 로드
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/**
 * Supabase 설정 여부 확인 함수
 * (환경 변수가 Vercel 대시보드에 아직 세팅되지 않은 경우에도 안전하게 안내 메시지를 보여줍니다)
 */
export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl !== "" && supabaseAnonKey !== "");
};

// Supabase 클라이언트 객체 생성 (더미 경로 방어 코드 적용)
export const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl : "https://placeholder-project.supabase.co",
  isSupabaseConfigured() ? supabaseAnonKey : "placeholder-anon-key"
);

// 데이터베이스 테이블 데이터 인터페이스 정의
export interface GraphExplorationRecord {
  id?: string;
  created_at?: string;
  student_name: string;
  graph_type: "direct" | "inverse"; // direct: 정비례 (y=ax), inverse: 반비례 (y=a/x)
  constant_a: number;
  equation: string;
  memo?: string;
}
