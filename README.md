# Jantong Resort Website

เว็บรีสอร์ทเวอร์ชัน Next.js สำหรับหน้าโปรโมตรีสอร์ท, ฟอร์มจอง, SEO พื้นฐาน และหลังบ้านเจ้าของ

## เปิดใช้งาน

ติดตั้ง dependencies:

```powershell
npm install
```

รันเว็บ:

```powershell
npm run dev
```

เปิดเว็บที่ `http://localhost:3001`

โปรเจกต์นี้ใช้ `next dev --turbopack` และ `next build --turbopack` เพราะ path ของโฟลเดอร์มีเครื่องหมาย `!` ซึ่ง Webpack ของ Next บางรุ่นไม่รองรับใน path บน Windows

## รันด้วย Docker

Build และรันด้วย Docker Compose:

```powershell
docker compose up --build
```

เปิดเว็บที่ `http://localhost:3000`

หยุด container:

```powershell
docker compose down
```

หรือใช้ Docker command ตรง ๆ:

```powershell
docker build -t jantong-resort .
docker run --rm -p 3001:3000 jantong-resort
```

## หลังบ้าน

เปิด `http://localhost:3000/admin`

- Username: `admin`
- Password: `jantong2026`

ข้อมูลจองจะถูกเก็บใน `localStorage` ของ browser สำหรับเวอร์ชันทดลองนี้

## สิ่งที่มีแล้ว

- หน้าแรกพร้อม hero image
- รายการห้องพัก
- ฟอร์มจองห้องพัก
- หน้า login เจ้าของ
- dashboard รายการจอง
- เปลี่ยนสถานะมัดจำและสถานะจอง
- export CSV
- meta description, robots.txt, sitemap.xml และ schema.org
- โครง Next.js App Router

## ขั้นต่อไปสำหรับระบบจริง

- เปลี่ยนไปใช้ฐานข้อมูล เช่น Supabase, Firebase หรือ PostgreSQL
- ทำระบบ login จริงแบบเข้ารหัส
- อัปโหลดสลิปโอนเงิน
- แจ้งเตือน LINE หรืออีเมลเมื่อมีรายการจอง
- ต่อโดเมนจริงและส่ง sitemap เข้า Google Search Console
