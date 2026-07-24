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

-- 2. 일차방정식 스피드 랭킹 게임 저장 테이블 생성
create table if not exists public.equation_game_rankings (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  student_name text not null,
  score integer not null,
  correct_count integer not null,
  max_combo integer not null default 1
);

-- 3. Row Level Security (RLS) 보안 정책 활성화
alter table public.graph_explorations enable row level security;
alter table public.equation_game_rankings enable row level security;

-- 4. 기존 정책이 있을 경우 삭제 후 재설정 (중복 실행 안전성 확보)
drop policy if exists "Allow public read access to graph explorations" on public.graph_explorations;
drop policy if exists "Allow public insert access to graph explorations" on public.graph_explorations;
drop policy if exists "Allow public read access to equation rankings" on public.equation_game_rankings;
drop policy if exists "Allow public insert access to equation rankings" on public.equation_game_rankings;

-- 5. 읽기/쓰기 RLS 정책 설정
create policy "Allow public read access to graph explorations"
  on public.graph_explorations for select using (true);

create policy "Allow public insert access to graph explorations"
  on public.graph_explorations for insert with check (true);

create policy "Allow public read access to equation rankings"
  on public.equation_game_rankings for select using (true);

create policy "Allow public insert access to equation rankings"
  on public.equation_game_rankings for insert with check (true);

-- 6. 확인용 샘플 데이터 삽입
insert into public.graph_explorations (student_name, graph_type, constant_a, equation, memo)
values 
  ('이지윤 선생님', 'direct', 2, 'y = 2x', '원점을 지나는 직선 형태의 정비례 그래프 탐구'),
  ('지윤샘 학생', 'inverse', 6, 'y = 6/x', '제1, 제3사분면에 위치하는 반비례 쌍곡선 탐구');

insert into public.equation_game_rankings (student_name, score, correct_count, max_combo)
values
  ('이지윤 선생님', 1500, 12, 5),
  ('수학왕 지윤이', 1200, 10, 4),
  ('방정식 마스터', 900, 8, 3);
