-- Smart Car Hub core marketplace schema
-- Run in Supabase SQL Editor. Never expose service_role credentials in the app.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  avatar_url text,
  preferred_language text not null default 'en' check (preferred_language in ('en','ms')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, full_name, phone)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), new.raw_user_meta_data->>'phone')
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  make text not null check (length(trim(make)) between 1 and 80),
  model text not null check (length(trim(model)) between 1 and 100),
  variant text,
  year int not null check (year between 1950 and 2100),
  price numeric(12,2) not null check (price > 0),
  mileage_km int check (mileage_km is null or mileage_km >= 0),
  transmission text,
  fuel_type text,
  body_type text,
  location text,
  description text,
  condition text,
  image_urls text[] not null default '{}',
  status text not null default 'pending_review' check (status in ('draft','pending_review','published','paused','sold','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists vehicles_public_search_idx on public.vehicles(status, created_at desc);
create index if not exists vehicles_price_idx on public.vehicles(price);
create index if not exists vehicles_make_model_idx on public.vehicles(make, model);
create index if not exists vehicles_seller_idx on public.vehicles(seller_id);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, vehicle_id)
);

create table if not exists public.recently_viewed (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  unique(user_id, vehicle_id)
);

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  message text not null check (length(trim(message)) between 1 and 3000),
  status text not null default 'sent' check (status in ('sent','responded','closed')),
  created_at timestamptz not null default now()
);
create index if not exists enquiries_buyer_idx on public.enquiries(buyer_id, created_at desc);
create index if not exists enquiries_vehicle_idx on public.enquiries(vehicle_id, created_at desc);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  booking_type text not null check (booking_type in ('test_drive','inspection')),
  preferred_date date not null,
  preferred_time text not null,
  location text not null,
  message text,
  status text not null default 'requested' check (status in ('requested','confirmed','rejected','cancelled','completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists bookings_buyer_idx on public.bookings(buyer_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.favorites enable row level security;
alter table public.recently_viewed enable row level security;
alter table public.enquiries enable row level security;
alter table public.bookings enable row level security;

drop policy if exists "Profiles readable by owner" on public.profiles;
create policy "Profiles readable by owner" on public.profiles for select to authenticated using (auth.uid() = id);
drop policy if exists "Profiles update by owner" on public.profiles;
create policy "Profiles update by owner" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "Profiles insert by owner" on public.profiles;
create policy "Profiles insert by owner" on public.profiles for insert to authenticated with check (auth.uid() = id);

drop policy if exists "Published vehicles visible to everyone" on public.vehicles;
create policy "Published vehicles visible to everyone" on public.vehicles for select to anon, authenticated using (status = 'published' or seller_id = auth.uid());
drop policy if exists "Seller can create own listings" on public.vehicles;
create policy "Seller can create own listings" on public.vehicles for insert to authenticated with check (seller_id = auth.uid() and status in ('draft','pending_review'));
drop policy if exists "Seller can update own listings" on public.vehicles;
create policy "Seller can update own listings" on public.vehicles for update to authenticated using (seller_id = auth.uid()) with check (seller_id = auth.uid() and status in ('draft','pending_review','paused','sold'));
drop policy if exists "Seller can delete own unpublished listings" on public.vehicles;
create policy "Seller can delete own unpublished listings" on public.vehicles for delete to authenticated using (seller_id = auth.uid() and status in ('draft','pending_review','rejected'));

drop policy if exists "Favorites owned by user" on public.favorites;
create policy "Favorites owned by user" on public.favorites for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "Recently viewed owned by user" on public.recently_viewed;
create policy "Recently viewed owned by user" on public.recently_viewed for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "Buyer can read own enquiries or seller can read received" on public.enquiries;
create policy "Buyer can read own enquiries or seller can read received" on public.enquiries for select to authenticated
using (buyer_id = auth.uid() or exists (select 1 from public.vehicles v where v.id = vehicle_id and v.seller_id = auth.uid()));
drop policy if exists "Buyer can create enquiry" on public.enquiries;
create policy "Buyer can create enquiry" on public.enquiries for insert to authenticated
with check (buyer_id = auth.uid() and exists (select 1 from public.vehicles v where v.id = vehicle_id and v.status = 'published' and v.seller_id <> auth.uid()));

drop policy if exists "Booking parties can read" on public.bookings;
create policy "Booking parties can read" on public.bookings for select to authenticated
using (buyer_id = auth.uid() or exists (select 1 from public.vehicles v where v.id = vehicle_id and v.seller_id = auth.uid()));
drop policy if exists "Buyer can request booking" on public.bookings;
create policy "Buyer can request booking" on public.bookings for insert to authenticated
with check (buyer_id = auth.uid() and exists (select 1 from public.vehicles v where v.id = vehicle_id and v.status = 'published' and v.seller_id <> auth.uid()));
drop policy if exists "Buyer can cancel requested booking" on public.bookings;
create policy "Buyer can cancel requested booking" on public.bookings for update to authenticated
using (buyer_id = auth.uid() and status = 'requested')
with check (buyer_id = auth.uid() and status = 'cancelled');

-- Storage: create a public bucket named vehicle-images in Supabase Storage.
-- These policies allow authenticated users to upload under their own user-id folder.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('vehicle-images','vehicle-images',true, 8388608, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

drop policy if exists "Users upload vehicle photos to own folder" on storage.objects;
create policy "Users upload vehicle photos to own folder" on storage.objects for insert to authenticated
with check (bucket_id = 'vehicle-images' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Public can view vehicle photos" on storage.objects;
create policy "Public can view vehicle photos" on storage.objects for select to anon, authenticated
using (bucket_id = 'vehicle-images');
drop policy if exists "Users delete own vehicle photos" on storage.objects;
create policy "Users delete own vehicle photos" on storage.objects for delete to authenticated
using (bucket_id = 'vehicle-images' and (storage.foldername(name))[1] = auth.uid()::text);

-- Admin moderation must be implemented with a trusted server-side role assignment.
-- Do not let users set their own admin role in profiles or client-side metadata.
