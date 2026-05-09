-- 4. 종합 평가/ICF 기록 창고 (ICF Assessments)
create table public.icf_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  patient_id uuid references public.patients on delete cascade not null,
  date date not null,
  turns jsonb,
  final_domains jsonb,
  final_note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS 보안 설정 켜기 (내 기록은 나만 볼 수 있게)
alter table public.icf_assessments enable row level security;

-- 본인이 생성한 정보만 추가/수정/삭제 가능하도록 규칙 설정
create policy "Users can manage own icf assessments." on public.icf_assessments for all using (auth.uid() = user_id);
