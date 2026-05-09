-- 1. profiles(사용자 정보) 테이블 생성
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  name text,
  role text,
  workplace text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. 보안 설정 (RLS) 켜기 - 내 정보는 나만 볼 수 있게
alter table public.profiles enable row level security;

-- 3. 본인 데이터만 보고 수정할 수 있도록 규칙(Policy) 추가
create policy "Users can view own profile." on profiles for select using (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- 4. 회원가입 시 자동으로 프로필 데이터를 만들어주는 자동화 기능(Trigger)
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
