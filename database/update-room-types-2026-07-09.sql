insert into public.rooms (name, price_per_night, deposit_amount, capacity, stock, description, is_active)
values
  ('เรือนแถว ห้อง 7', 250, 250, 2, 1, 'ห้องพักชั่วคราว ราคา 250 บาท / 3 ชั่วโมง', true),
  ('เรือนแถว ห้อง 8', 250, 250, 2, 1, 'ห้องพักชั่วคราว ราคา 250 บาท / 3 ชั่วโมง', true),
  ('เรือนแถว ห้อง 9', 250, 250, 2, 1, 'ห้องพักชั่วคราว ราคา 250 บาท / 3 ชั่วโมง', true),
  ('เรือนแถว ห้อง 10', 250, 250, 2, 1, 'ห้องพักชั่วคราว ราคา 250 บาท / 3 ชั่วโมง', true),
  ('บ้านพักหลังที่ 1', 600, 600, 2, 1, 'บ้านพักค้างคืน ราคา 600 บาท / คืน', true),
  ('บ้านพักหลังที่ 2', 600, 600, 2, 1, 'บ้านพักค้างคืน ราคา 600 บาท / คืน', true),
  ('บ้านพักหลังที่ 3', 700, 700, 2, 1, 'บ้านพักค้างคืน ราคา 700 บาท / คืน', true),
  ('บ้านพักหลังที่ 4', 700, 700, 2, 1, 'บ้านพักค้างคืน ราคา 700 บาท / คืน', true)
on conflict (name) do update set
  price_per_night = excluded.price_per_night,
  deposit_amount = excluded.deposit_amount,
  capacity = excluded.capacity,
  stock = excluded.stock,
  description = excluded.description,
  is_active = true;

update public.rooms
set is_active = false
where name in ('Garden Deluxe', 'Family Bungalow', 'Standard Twin');
