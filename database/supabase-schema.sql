create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer',
  created_at timestamptz not null default now()
);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  price_per_night numeric(10, 2) not null default 1,
  deposit_amount numeric(10, 2) not null default 1,
  capacity integer not null default 2,
  stock integer not null default 1,
  description text,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  guest_name text not null,
  phone text not null,
  check_in date not null,
  check_out date not null,
  room_type text not null,
  guests integer not null default 1,
  add_ons text[] not null default '{}',
  note text,
  deposit_amount numeric(10, 2) not null default 1,
  deposit_status text not null default 'pending' check (deposit_status in ('pending', 'paid', 'verified')),
  booking_status text not null default 'new' check (booking_status in ('new', 'awaiting_review', 'confirmed', 'checked_in', 'cancelled')),
  slip_name text,
  slip_data_url text,
  slip_uploaded_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  amount numeric(10, 2) not null default 1,
  promptpay_id text not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'verified', 'rejected')),
  slip_name text,
  slip_data_url text,
  paid_at timestamptz,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.resort_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

insert into public.rooms (name, price_per_night, deposit_amount, capacity, stock, description)
values
  ('เรือนแถว ห้อง 7', 250, 250, 2, 1, 'ห้องพักชั่วคราว ราคา 250 บาท / 3 ชั่วโมง'),
  ('เรือนแถว ห้อง 8', 250, 250, 2, 1, 'ห้องพักชั่วคราว ราคา 250 บาท / 3 ชั่วโมง'),
  ('เรือนแถว ห้อง 9', 250, 250, 2, 1, 'ห้องพักชั่วคราว ราคา 250 บาท / 3 ชั่วโมง'),
  ('เรือนแถว ห้อง 10', 250, 250, 2, 1, 'ห้องพักชั่วคราว ราคา 250 บาท / 3 ชั่วโมง'),
  ('บ้านพักหลังที่ 1', 600, 600, 2, 1, 'บ้านพักค้างคืน ราคา 600 บาท / คืน'),
  ('บ้านพักหลังที่ 2', 600, 600, 2, 1, 'บ้านพักค้างคืน ราคา 600 บาท / คืน'),
  ('บ้านพักหลังที่ 3', 700, 700, 2, 1, 'บ้านพักค้างคืน ราคา 700 บาท / คืน'),
  ('บ้านพักหลังที่ 4', 700, 700, 2, 1, 'บ้านพักค้างคืน ราคา 700 บาท / คืน')
on conflict (name) do update set
  price_per_night = excluded.price_per_night,
  deposit_amount = excluded.deposit_amount,
  capacity = excluded.capacity,
  stock = excluded.stock,
  description = excluded.description;

update public.rooms
set is_active = false
where name in ('Garden Deluxe', 'Family Bungalow', 'Standard Twin');

insert into public.resort_settings (key, value)
values
  ('promptpay_id', '0927670303'),
  ('resort_name', 'Jantong Resort')
on conflict (key) do update set
  value = excluded.value,
  updated_at = now();

alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.bookings enable row level security;
alter table public.payments enable row level security;
alter table public.resort_settings enable row level security;

drop policy if exists "rooms are public readable" on public.rooms;
create policy "rooms are public readable"
on public.rooms for select
using (is_active = true);

drop policy if exists "settings are public readable" on public.resort_settings;
create policy "settings are public readable"
on public.resort_settings for select
using (true);

drop policy if exists "anyone can create booking" on public.bookings;
create policy "anyone can create booking"
on public.bookings for insert
with check (true);

drop policy if exists "anyone can read booking demo data" on public.bookings;
create policy "anyone can read booking demo data"
on public.bookings for select
using (true);

drop policy if exists "anyone can update booking demo data" on public.bookings;
create policy "anyone can update booking demo data"
on public.bookings for update
using (true)
with check (true);

drop policy if exists "anyone can create payment" on public.payments;
create policy "anyone can create payment"
on public.payments for insert
with check (true);

drop policy if exists "anyone can read payment demo data" on public.payments;
create policy "anyone can read payment demo data"
on public.payments for select
using (true);
