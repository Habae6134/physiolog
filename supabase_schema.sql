-- 1. 환자 기본 정보 창고 (Patients)
create table public.patients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null, -- 이 환자를 등록한 담당자(치료사)
  name text not null,
  birth_date date,
  gender text,
  phone text,
  address text,
  referral_route text,
  medical_history jsonb,
  other_medical_history text,
  diagnosis text,
  surgery_history text,
  onset_date date,
  insurance text,
  notes text,
  treatment_start_date date,
  therapist text,
  status text not null default 'new',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. 치료 기록 창고 (Treatments)
create table public.treatments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  patient_id uuid references public.patients on delete cascade not null,
  date date not null,
  body_parts jsonb,
  methods jsonb,
  other_treatment_method text,
  exercise_concept text,
  exercises jsonb,
  homework text,
  comment text,
  flags jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. 평가 기록 창고 (Evaluations)
create table public.evaluations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  patient_id uuid references public.patients on delete cascade not null,
  date date not null,
  vas numeric,
  rom jsonb,
  mmt jsonb,
  body_measurement jsonb,
  pain_mapping jsonb,
  custom jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS 보안 설정 켜기 (내 환자와 기록은 나만 볼 수 있게)
alter table public.patients enable row level security;
alter table public.treatments enable row level security;
alter table public.evaluations enable row level security;

-- 본인이 생성한 정보만 추가/수정/삭제 가능하도록 규칙 설정
create policy "Users can manage own patients." on public.patients for all using (auth.uid() = user_id);
create policy "Users can manage own treatments." on public.treatments for all using (auth.uid() = user_id);
create policy "Users can manage own evaluations." on public.evaluations for all using (auth.uid() = user_id);
