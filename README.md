# Jantong Resort Website

เว็บรีสอร์ทเวอร์ชัน Next.js สำหรับหน้าโปรโมตรีสอร์ท, ฟอร์มจอง, SEO พื้นฐาน, ระบบสมาชิก, QR มัดจำ และหลังบ้านเจ้าของ

## เปิดใช้งาน

ติดตั้ง dependencies:

```powershell
npm install
```

รันเว็บ:

```powershell
npm run dev
```

เปิดเว็บที่ `http://localhost:3000`

โปรเจกต์นี้ใช้ `next dev --turbopack` และ `next build --turbopack` เพราะ path ของโฟลเดอร์มีเครื่องหมาย `!` ซึ่ง Webpack ของ Next บางรุ่นไม่รองรับใน path บน Windows

## รันด้วย Docker

Build และรันด้วย Docker Compose:

```powershell
docker compose up -d --build
```

เปิดเว็บที่ `http://localhost:3001`

ถ้าต้องการเปลี่ยน PromptPay สำหรับ QR มัดจำ ให้ตั้งค่า environment variable ก่อนรัน Docker:

```powershell
$env:PROMPTPAY_ID="เบอร์พร้อมเพย์หรือเลขนิติบุคคล"
docker compose up -d --build
```

หยุด container:

```powershell
docker compose down
```

## Supabase Database ฟรี

โปรเจกต์นี้เตรียม Supabase ไว้แล้ว โดยใช้ Project URL:

```text
https://wmkbeitnxziduhtnhdfq.supabase.co
```

ขั้นตอนเปิดใช้ Database จริง:

1. เข้า Supabase Dashboard
2. เปิดเมนู SQL Editor
3. เอาไฟล์ `database/supabase-schema.sql` ไปรัน 1 ครั้ง เพื่อสร้างตาราง
4. เปิดเมนู Project Settings > API
5. คัดลอก `anon public key`
6. ใส่ในไฟล์ `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://wmkbeitnxziduhtnhdfq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ใส่-anon-public-key-ตรงนี้
```

ถ้าใช้ Docker ให้ตั้ง env ก่อน build:

```powershell
$env:NEXT_PUBLIC_SUPABASE_URL="https://wmkbeitnxziduhtnhdfq.supabase.co"
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY="ใส่-anon-public-key-ตรงนี้"
docker compose up -d --build
```

หลังใส่ key แล้ว:

- ฟอร์มจองจะบันทึกลงตาราง `bookings`
- หลังบ้านจะอ่านรายการจองจาก Supabase
- Login/สมัครสมาชิกจะใช้ Supabase Auth
- Google/Facebook Login จะใช้ได้หลังจากเปิด Provider ใน Supabase Auth

ถ้ายังไม่ตั้งค่า Supabase เว็บจะ fallback ไปใช้ `localStorage` เพื่อให้ทดสอบต่อได้

## Deploy ฟรีขึ้นเว็บจริงด้วย Vercel

ทางฟรีที่แนะนำคือใช้ Vercel Hobby Plan แล้วเชื่อมกับ GitHub repository

ขั้นตอน:

1. Push โปรเจกต์นี้ขึ้น GitHub
2. เข้า `https://vercel.com`
3. Sign up / Login ด้วย GitHub
4. กด Add New > Project
5. เลือก repo `Jantong-Resort`
6. ตั้งค่า Environment Variables ใน Vercel:

```env
PROMPTPAY_ID=0927670303
NEXT_PUBLIC_SITE_URL=https://ชื่อเว็บของคุณ.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://wmkbeitnxziduhtnhdfq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ใส่-anon-public-key-ตรงนี้
```

7. กด Deploy
8. หลัง deploy เสร็จ ให้นำ URL จริงมาเปลี่ยนค่า `NEXT_PUBLIC_SITE_URL` ใน Vercel แล้ว Redeploy อีกครั้ง

หลัง deploy แล้ว URL สำคัญคือ:

- หน้าเว็บ: `https://ชื่อเว็บของคุณ.vercel.app`
- Sitemap: `https://ชื่อเว็บของคุณ.vercel.app/sitemap.xml`
- Robots: `https://ชื่อเว็บของคุณ.vercel.app/robots.txt`

## ส่งเว็บเข้า Google Search Console ฟรี

1. เข้า `https://search.google.com/search-console`
2. กด Add property
3. ถ้าใช้ URL ฟรีของ Vercel ให้เลือก URL prefix
4. ใส่ URL เว็บ เช่น `https://ชื่อเว็บของคุณ.vercel.app`
5. เลือกวิธียืนยันแบบ HTML tag
6. เอา meta verification code มาใส่ในโปรเจกต์ หรือใช้วิธีอัปโหลดไฟล์ HTML หากสะดวกกว่า
7. หลังยืนยันสำเร็จ เปิดเมนู Sitemaps
8. ส่ง sitemap: `sitemap.xml`

Google อาจใช้เวลาหลายวันถึงหลายสัปดาห์ในการเริ่มแสดงผลการค้นหา ขึ้นอยู่กับการ crawl และคุณภาพเนื้อหา

## หลังบ้าน

เปิด `http://localhost:3000/admin` เมื่อรันด้วย `npm run dev`

เปิด `http://localhost:3001/admin` เมื่อรันด้วย Docker

- Username: `admin`
- Password: `jantong2026`

## สิ่งที่มีแล้ว

- หน้าแรกพร้อม hero image
- รายการห้องพัก
- ฟอร์มจองห้องพัก
- หน้า login และสมัครสมาชิกของลูกค้า
- หน้า login เจ้าของ
- dashboard รายการจอง
- เปลี่ยนสถานะมัดจำและสถานะจอง
- สร้าง PromptPay QR สำหรับชำระค่ามัดจำ
- อัปโหลดสลิปโอนเงินเพื่อให้เจ้าของตรวจสอบ
- โครงเชื่อม Supabase Database และ Supabase Auth
- export CSV
- meta description, robots.txt, sitemap.xml และ schema.org
- ตั้งค่า SEO URL ผ่าน `NEXT_PUBLIC_SITE_URL`
- โครง Next.js App Router

## ขั้นต่อไปสำหรับระบบจริง

- เปิด Google/Facebook Provider ใน Supabase Auth
- ย้ายไฟล์สลิปไปเก็บใน Supabase Storage
- แจ้งเตือน LINE หรืออีเมลเมื่อมีรายการจอง
- Deploy ฟรีบน Vercel และส่ง sitemap เข้า Google Search Console
