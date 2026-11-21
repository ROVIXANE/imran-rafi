-- ============================================================
-- Imran Rafi Portfolio 2.0 — Supabase schema
-- Run once in Supabase SQL Editor (safe to re-run).
-- Security model:
--   * anon / public: SELECT only on published (visible) content
--   * authenticated users listed in admin_allowlist: full CRUD
--   * service-role key is NEVER used in frontend code
-- ============================================================

-- ---------- 0. Admin allowlist + helper ----------
create table if not exists public.admin_allowlist (
  email text primary key,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_allowlist
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ADD YOUR ADMIN EMAIL HERE (the same email you use in Supabase Auth).
-- Example: insert into public.admin_allowlist (email) values ('you@example.com') on conflict do nothing;

-- ---------- 1. Tables ----------
create table if not exists public.profiles (
  id text primary key,
  name text,
  photo_url text,
  headline_bn text,
  headline_en text,
  intro_bn text,
  intro_en text,
  about_bn text,
  about_en text,
  location_bn text,
  location_en text,
  learning_goal_bn text,
  learning_goal_en text,
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id text primary key,
  site_name text,
  title_bn text,
  title_en text,
  description_bn text,
  description_en text,
  og_image_url text,
  footer_bn text,
  footer_en text,
  copyright text,
  accent_color text default '#3b82f6',
  default_language text default 'bn',
  nav_visibility jsonb default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title_bn text,
  title_en text,
  description_bn text,
  description_en text,
  image_url text,
  category text default 'other',
  section text default 'showcase',
  technologies text[] default '{}',
  project_url text,
  github_url text,
  featured boolean not null default false,
  visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  image_url text,
  caption_bn text,
  caption_en text,
  category text,
  visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name_bn text,
  name_en text,
  category text default 'other',
  level integer,
  visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.education (
  id uuid primary key default gen_random_uuid(),
  institution_bn text,
  institution_en text,
  level_bn text,
  level_en text,
  department_bn text,
  department_en text,
  start_year text,
  end_year text,
  description_bn text,
  description_en text,
  visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.interests (
  id uuid primary key default gen_random_uuid(),
  title_bn text,
  title_en text,
  description_bn text,
  description_en text,
  icon text,
  category text default 'technology',
  visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  platform text,
  url text,
  icon text,
  visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- 2. Updated-at trigger ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_projects_updated on public.projects;
create trigger trg_projects_updated before update on public.projects for each row execute function public.set_updated_at();
drop trigger if exists trg_gallery_updated on public.gallery;
create trigger trg_gallery_updated before update on public.gallery for each row execute function public.set_updated_at();
drop trigger if exists trg_skills_updated on public.skills;
create trigger trg_skills_updated before update on public.skills for each row execute function public.set_updated_at();
drop trigger if exists trg_education_updated on public.education;
create trigger trg_education_updated before update on public.education for each row execute function public.set_updated_at();
drop trigger if exists trg_interests_updated on public.interests;
create trigger trg_interests_updated before update on public.interests for each row execute function public.set_updated_at();
drop trigger if exists trg_social_updated on public.social_links;
create trigger trg_social_updated before update on public.social_links for each row execute function public.set_updated_at();
drop trigger if exists trg_profile_updated on public.profiles;
create trigger trg_profile_updated before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists trg_settings_updated on public.site_settings;
create trigger trg_settings_updated before update on public.site_settings for each row execute function public.set_updated_at();

-- ---------- 3. Indexes ----------
create index if not exists idx_projects_visible_order on public.projects (visible, sort_order);
create index if not exists idx_projects_category on public.projects (category);
create index if not exists idx_projects_section on public.projects (section);
create index if not exists idx_gallery_visible_order on public.gallery (visible, sort_order);
create index if not exists idx_skills_visible_order on public.skills (visible, sort_order);
create index if not exists idx_education_visible_order on public.education (visible, sort_order);
create index if not exists idx_interests_visible_order on public.interests (visible, sort_order);
create index if not exists idx_social_visible_order on public.social_links (visible, sort_order);

-- ---------- 4. Row Level Security ----------
alter table public.admin_allowlist enable row level security;
alter table public.profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.projects enable row level security;
alter table public.gallery enable row level security;
alter table public.skills enable row level security;
alter table public.education enable row level security;
alter table public.interests enable row level security;
alter table public.social_links enable row level security;

-- Public read: single-row tables (no sensitive personal data)
drop policy if exists "public read profiles" on public.profiles;
create policy "public read profiles" on public.profiles for select to anon, authenticated using (true);

drop policy if exists "public read site settings" on public.site_settings;
create policy "public read site settings" on public.site_settings for select to anon, authenticated using (true);

-- Public read: only visible rows; admins may also read drafts for preview
drop policy if exists "public read visible projects" on public.projects;
create policy "public read visible projects" on public.projects for select to anon, authenticated using (visible or public.is_admin());
drop policy if exists "public read visible gallery" on public.gallery;
create policy "public read visible gallery" on public.gallery for select to anon, authenticated using (visible or public.is_admin());
drop policy if exists "public read visible skills" on public.skills;
create policy "public read visible skills" on public.skills for select to anon, authenticated using (visible or public.is_admin());
drop policy if exists "public read visible education" on public.education;
create policy "public read visible education" on public.education for select to anon, authenticated using (visible or public.is_admin());
drop policy if exists "public read visible interests" on public.interests;
create policy "public read visible interests" on public.interests for select to anon, authenticated using (visible or public.is_admin());
drop policy if exists "public read visible social links" on public.social_links;
create policy "public read visible social links" on public.social_links for select to anon, authenticated using (visible or public.is_admin());

-- Admin-only writes on every content table
do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'profiles','site_settings','projects','gallery',
    'skills','education','interests','social_links'
  ] loop
    execute format('drop policy if exists "admin insert %1$s" on public.%1$s', tbl);
    execute format('create policy "admin insert %1$s" on public.%1$s for insert to authenticated with check (public.is_admin())', tbl);
    execute format('drop policy if exists "admin update %1$s" on public.%1$s', tbl);
    execute format('create policy "admin update %1$s" on public.%1$s for update to authenticated using (public.is_admin()) with check (public.is_admin())', tbl);
    execute format('drop policy if exists "admin delete %1$s" on public.%1$s', tbl);
    execute format('create policy "admin delete %1$s" on public.%1$s for delete to authenticated using (public.is_admin())', tbl);
  end loop;
end $$;

-- Only admins may read the allowlist (the helper bypasses RLS securely)
drop policy if exists "admin read allowlist" on public.admin_allowlist;
create policy "admin read allowlist" on public.admin_allowlist for select to authenticated using (public.is_admin());

-- ---------- 5. Storage ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-media', 'portfolio-media', true, 5242880,
  array['image/jpeg','image/png','image/webp','image/gif','image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public read portfolio media" on storage.objects;
create policy "public read portfolio media" on storage.objects
  for select to public using (bucket_id = 'portfolio-media');

drop policy if exists "admin upload portfolio media" on storage.objects;
create policy "admin upload portfolio media" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'portfolio-media' and public.is_admin());

drop policy if exists "admin update portfolio media" on storage.objects;
create policy "admin update portfolio media" on storage.objects
  for update to authenticated
  using (bucket_id = 'portfolio-media' and public.is_admin())
  with check (bucket_id = 'portfolio-media' and public.is_admin());

drop policy if exists "admin delete portfolio media" on storage.objects;
create policy "admin delete portfolio media" on storage.objects
  for delete to authenticated
  using (bucket_id = 'portfolio-media' and public.is_admin());

-- ---------- 6. Seed content ----------
insert into public.profiles (id, name, photo_url, headline_bn, headline_en, intro_bn, intro_en, about_bn, about_en, location_bn, location_en, learning_goal_bn, learning_goal_en)
values (
  'profile-main', 'Imran Rafi', 'assets/profile.svg',
  'প্রযুক্তি উৎসাহী · জীবনভর শিক্ষার্থী · নির্মাতা',
  'Technology Enthusiast · Lifelong Learner · Maker',
  'আমি ইলেকট্রনিক্স, মাইক্রোকন্ট্রোলার, এআই, ওয়েব ডেভেলপমেন্ট ও অটোমেশন নিয়ে exploration করি — দৈনন্দিন কৌতূহলকে বাস্তব প্রকল্পে রূপ দিই।',
  'I explore electronics, microcontrollers, AI, web development and automation — turning everyday curiosity into hands-on projects.',
  'আমি একজন প্রযুক্তি উৎসাহী ও শিক্ষার্থী, যিনি জিনিসগুলো কীভাবে কাজ করে তা বোঝাতে ভালোবাসি।',
  'I am a technology enthusiast and learner with a genuine love for understanding how things work.',
  'বাংলাদেশ', 'Bangladesh',
  'ক্রমাগত শিখছি: ইলেকট্রনিক্স, প্রোগ্রামিং, ওয়েব ও এআই।',
  'Continuously learning: electronics, programming, web and AI.'
) on conflict (id) do nothing;

insert into public.site_settings (id, site_name, title_bn, title_en, description_bn, description_en, og_image_url, footer_bn, footer_en, copyright, accent_color, default_language)
values (
  'settings-main', 'Imran Rafi',
  'ইমরান রাফি — প্রযুক্তি উৎসাহী, শিক্ষার্থী ও নির্মাতা',
  'Imran Rafi — Technology Enthusiast, Learner & Maker',
  'ইমরান রাফির ব্যক্তিগত পোর্টফলিও — ইলেকট্রনিক্স, এআই ও ওয়েব ডেভেলপমেন্ট নিয়ে বাস্তব প্রকল্প।',
  'Personal portfolio of Imran Rafi — hands-on projects in electronics, AI and web development.',
  'assets/og-image.png',
  'HTML, CSS ও JavaScript দিয়ে তৈরি · GitHub Pages-এ deployed',
  'Built with HTML, CSS & JavaScript · Deployed on GitHub Pages',
  'Imran Rafi', '#3b82f6', 'bn'
) on conflict (id) do nothing;

insert into public.social_links (id, platform, url, icon, visible, sort_order) values
  ('00000000-0000-4000-8000-000000000001', 'GitHub', 'https://github.com/rmd734412-web', 'github', true, 1),
  ('00000000-0000-4000-8000-000000000002', 'LinkedIn', '', 'linkedin', false, 2),
  ('00000000-0000-4000-8000-000000000003', 'YouTube', '', 'youtube', false, 3),
  ('00000000-0000-4000-8000-000000000004', 'Instagram', '', 'instagram', false, 4),
  ('00000000-0000-4000-8000-000000000005', 'Facebook', '', 'facebook', false, 5),
  ('00000000-0000-4000-8000-000000000006', 'Email', '', 'email', false, 6)
on conflict (id) do nothing;

insert into public.interests (id, title_bn, title_en, description_bn, description_en, icon, category, visible, sort_order) values
  ('10000000-0000-4000-8000-000000000001', 'আরডুইনো', 'Arduino', 'আরডুইনো দিয়ে ইন্টারঅ্যাকটিভ প্রকল্প তৈরি।', 'Building interactive projects with Arduino.', '🔌', 'microcontrollers', true, 1),
  ('10000000-0000-4000-8000-000000000002', 'ESP8266', 'ESP8266', 'ওয়াই-ফাই যোগ করে IoT নিয়ে পরীক্ষা।', 'Adding Wi-Fi to everyday IoT projects.', '📡', 'microcontrollers', true, 2),
  ('10000000-0000-4000-8000-000000000003', 'ESP32', 'ESP32', 'সেন্সিং ও অটোমেশনের শক্তিশালী বোর্ড।', 'Powerful board for sensing and automation.', '🧩', 'microcontrollers', true, 3),
  ('10000000-0000-4000-8000-000000000004', 'ইলেকট্রনিক্স মেরামত', 'Electronics Repair', 'সার্কিটের সমস্যা খুঁজে হার্ডওয়্যার পুনরুদ্ধার।', 'Troubleshooting circuits and reviving hardware.', '🛠️', 'electronics', true, 4),
  ('10000000-0000-4000-8000-000000000005', 'এআই টুল', 'AI Tools', 'শিখতে ও তৈরি করতে ব্যবহারিক এআই টুল।', 'Practical AI tools for learning and creating.', '🤖', 'ai', true, 5),
  ('10000000-0000-4000-8000-000000000006', 'ওয়েব ডেভেলপমেন্ট', 'Web Development', 'দ্রুত ও অ্যাক্সেসিবল ওয়েবসাইট তৈরি।', 'Crafting fast and accessible websites.', '🌐', 'web', true, 6),
  ('10000000-0000-4000-8000-000000000007', 'প্রোগ্রামিং', 'Programming', 'C/C++, Python ও JavaScript অনুশীলন।', 'Practising C/C++, Python and JavaScript.', '💻', 'programming', true, 7),
  ('10000000-0000-4000-8000-000000000008', 'ভিডিও ক্রিয়েশন', 'Video Creation', 'ধারণাকে দেখার মতো গল্পে রূপ দেওয়া।', 'Turning ideas into stories worth watching.', '🎬', 'creative projects', true, 8),
  ('10000000-0000-4000-8000-000000000009', 'DIY প্রকল্প', 'DIY Projects', 'নিজের হাতে বাস্তব কিছু তৈরি।', 'Making something real with my own hands.', '🧰', 'electronics', true, 9)
on conflict (id) do nothing;

insert into public.skills (id, name_bn, name_en, category, level, visible, sort_order) values
  ('20000000-0000-4000-8000-000000000001', 'আরডুইনো', 'Arduino', 'electronics', 80, true, 1),
  ('20000000-0000-4000-8000-000000000002', 'ESP32 / ESP8266', 'ESP32 / ESP8266', 'electronics', 70, true, 2),
  ('20000000-0000-4000-8000-000000000003', 'সার্কিট ও মেরামত', 'Circuit basics & repair', 'electronics', 60, true, 3),
  ('20000000-0000-4000-8000-000000000004', 'C / C++', 'C / C++', 'programming', 70, true, 4),
  ('20000000-0000-4000-8000-000000000005', 'পাইথন', 'Python', 'programming', 65, true, 5),
  ('20000000-0000-4000-8000-000000000006', 'জাভাস্ক্রিপ্ট', 'JavaScript', 'programming', 60, true, 6),
  ('20000000-0000-4000-8000-000000000007', 'এআই টুল', 'AI tools & assistants', 'ai', 75, true, 7),
  ('20000000-0000-4000-8000-000000000008', 'প্রম্পটিং ও ওয়ার্কফ্লো', 'Prompting & workflows', 'ai', 70, true, 8),
  ('20000000-0000-4000-8000-000000000009', 'হোম অটোমেশন', 'Home automation', 'ai', 60, true, 9),
  ('20000000-0000-4000-8000-000000000010', 'HTML ও CSS', 'HTML & CSS', 'web', 80, true, 10),
  ('20000000-0000-4000-8000-000000000011', 'রেসপন্সিভ ডিজাইন', 'Responsive design', 'web', 75, true, 11),
  ('20000000-0000-4000-8000-000000000012', 'জাভাস্ক্রিপ্ট ফান্ডামেন্টাল', 'JavaScript fundamentals', 'web', 65, true, 12)
on conflict (id) do nothing;

insert into public.projects (id, title_bn, title_en, description_bn, description_en, image_url, category, section, technologies, featured, visible, sort_order) values
  ('30000000-0000-4000-8000-000000000001', 'ESP32 আবহাওয়া স্টেশন', 'ESP32 Weather Station', 'তাপমাত্রা ও আর্দ্রতার তথ্য ড্যাশবোর্ডে প্রদর্শন।', 'Live environmental sensing with a compact web dashboard.', 'assets/project-1.svg', 'electronics', 'embedded', array['ESP32','Sensors','IoT'], true, true, 1),
  ('30000000-0000-4000-8000-000000000002', 'আরডুইনো স্মার্ট হোম', 'Arduino Smart Home', 'রিলে দিয়ে আলো ও যন্ত্রপাতি নিয়ন্ত্রণ।', 'Relay-based control of lights and appliances.', '', 'electronics', 'embedded', array['Arduino','Relays'], false, true, 2),
  ('30000000-0000-4000-8000-000000000005', 'স্মার্ট অটোমেশন ল্যাব', 'Smart Automation Lab', 'এআই-সহায়ক রুটিন যা অ্যাপ ও ডিভাইসকে যুক্ত করে।', 'AI-assisted routines that connect apps and devices.', 'assets/project-2.svg', 'ai', 'ai', array['AI','Workflows','IoT'], true, true, 5),
  ('30000000-0000-4000-8000-000000000009', 'রেসপন্সিভ ইন্টারফেস', 'Responsive Interfaces', 'প্রতিটি স্ক্রিনে মানানসই মোবাইল-ফার্স্ট লেআউট।', 'Mobile-first layouts for every screen size.', '', 'web', 'web', array['HTML','CSS'], false, true, 9),
  ('30000000-0000-4000-8000-000000000011', 'ব্যক্তিগত পোর্টফলিও', 'Personal Portfolio', 'GitHub Pages-এ ডেপ্লয় করা এই পোর্টফলিও।', 'This responsive portfolio deployed on GitHub Pages.', 'assets/project-3.svg', 'web', 'web', array['HTML','CSS','JavaScript'], true, true, 11)
on conflict (id) do nothing;

insert into public.gallery (id, image_url, caption_bn, caption_en, category, visible, sort_order) values
  ('40000000-0000-4000-8000-000000000001', 'assets/gallery-1.svg', 'আমার ওয়ার্কবেঞ্চ', 'My workbench', 'Electronics', true, 1),
  ('40000000-0000-4000-8000-000000000002', 'assets/gallery-2.svg', 'ইলেকট্রনিক্স প্রকল্প', 'Electronics projects', 'Electronics', true, 2),
  ('40000000-0000-4000-8000-000000000003', 'assets/gallery-3.svg', 'মাইক্রোকন্ট্রোলার', 'Microcontrollers', 'Hardware', true, 3),
  ('40000000-0000-4000-8000-000000000004', 'assets/gallery-4.svg', 'তৈরি ও পরীক্ষা', 'Building & testing', 'Hardware', true, 4),
  ('40000000-0000-4000-8000-000000000005', 'assets/gallery-5.svg', 'সৃজনশীল সেটআপ', 'Creative setup', 'Creative', true, 5),
  ('40000000-0000-4000-8000-000000000006', 'assets/gallery-6.svg', 'একটি মুহূর্ত', 'A moment', 'Creative', true, 6)
on conflict (id) do nothing;

insert into public.education (id, institution_bn, institution_en, level_bn, level_en, department_bn, department_en, description_bn, description_en, visible, sort_order) values
  ('50000000-0000-4000-8000-000000000001', 'ক্রমাগত স্ব-শিক্ষা', 'Continuous Self-Learning', 'চলমান', 'Ongoing', 'ইলেকট্রনিক্স · প্রোগ্রামিং · ওয়েব · এআই', 'Electronics · Programming · Web · AI', 'অনলাইন রিসোর্স ও ছোট প্রকল্পের মাধ্যমে হাতে-কলমে শেখা।', 'Learning by doing with online resources and small projects.', true, 1)
on conflict (id) do nothing;

-- ============================================================
-- Done. Next: create an Auth user, add their email to
-- public.admin_allowlist, then configure GitHub Secrets.
-- ============================================================
