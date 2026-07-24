-- ========================================================
-- [수학은 이지윤] Supabase SQL Editor 실행용 DDL & RLS 쿼리문
-- 사용법: Supabase 대시보드 -> SQL Editor -> New Query 에 아래 내용을 붙여넣고 Run 버튼을 클릭하세요.
-- ========================================================

-- 1. 정비례 및 반비례 그래프 탐구 결과 저장 테이블 생성
create table if not exists public.graph_explorations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  student_name text not null,
  graph_type text not null check (graph_type in ('direct', 'inverse')),
  constant_a numeric not null,
  equation text not null,
  memo text
);

-- 2. Row Level Security (RLS) 보안 정책 활성화
alter table public.graph_explorations enable row level security;

-- 3. 기존 정책이 있을 경우 삭제 후 재설정 (중복 실행 안전성 확보)
drop policy if exists "Allow public read access to graph explorations" on public.graph_explorations;
drop policy if exists "Allow public insert access to graph explorations" on public.graph_explorations;

-- 4. 학생 및 선생님 누구나 탐구 기록을 읽을 수 있도록 읽기 권한 설정
create policy "Allow public read access to graph explorations"
  on public.graph_explorations
  for select
  using (true);

-- 5. 학생 누구나 자신의 탐구 결과를 저장할 수 있도록 쓰기 권한 설정
create policy "Allow public insert access to graph explorations"
  on public.graph_explorations
  for insert
  with check (true);

-- 확인용 샘플 안내 데이터 삽입 (선택 사항)
insert into public.graph_explorations (student_name, graph_type, constant_a, equation, memo)
values 
  ('이지윤 선생님', 'direct', 2, 'y = 2x', '원점을 지나는 직상 형태의 정비례 그래프 탐구'),
  ('지윤샘 학생', 'inverse', 6, 'y = 6/x', '제1, 제3사분면에 위치하는 반비례 쌍곡선 탐구');
