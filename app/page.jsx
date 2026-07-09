"use client";

import Link from "next/link";
import { useState } from "react";

const STORAGE_KEY = "jantongBookings";
const GOOGLE_MAPS_URL = "https://maps.app.goo.gl/8tovafGTeeYNSVyF9";
const GOOGLE_MAPS_EMBED_URL = "https://www.google.com/maps?q=%E0%B8%88%E0%B8%B1%E0%B8%99%E0%B8%97%E0%B8%A3%E0%B9%8C%E0%B8%97%E0%B8%AD%E0%B8%87%E0%B8%A3%E0%B8%B5%E0%B8%AA%E0%B8%AD%E0%B8%A3%E0%B9%8C%E0%B8%97&output=embed";

const roomDeposits = {
  "Garden Deluxe": 500,
  "Family Bungalow": 1000,
  "Standard Twin": 500
};

const addOnOptions = [
  "เตียงเสริม",
  "กาแฟในตอนเช้า"
];

const initialForm = {
  guestName: "",
  phone: "",
  checkIn: "",
  checkOut: "",
  roomType: "",
  guests: 2,
  addOns: [],
  note: ""
};

function getBookings() {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
}

function saveBookings(bookings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

function formatDate(date) {
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(date));
}

export default function HomePage() {
  const [navOpen, setNavOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("");
  const [statusTone, setStatusTone] = useState("success");

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function toggleAddOn(event) {
    const { value, checked } = event.target;
    setForm((current) => {
      const addOns = checked
        ? [...current.addOns, value]
        : current.addOns.filter((addOn) => addOn !== value);
      return { ...current, addOns };
    });
  }

  function submitBooking(event) {
    event.preventDefault();

    if (new Date(form.checkOut) <= new Date(form.checkIn)) {
      setStatus("กรุณาเลือกวันออกหลังวันเข้าพัก");
      setStatusTone("warning");
      return;
    }

    const booking = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      guestName: form.guestName.trim(),
      phone: form.phone.trim(),
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      roomType: form.roomType,
      guests: Number(form.guests),
      addOns: form.addOns,
      note: form.note.trim(),
      depositAmount: roomDeposits[form.roomType] || 500,
      depositStatus: "pending",
      bookingStatus: "new",
      createdAt: new Date().toISOString()
    };

    saveBookings([booking, ...getBookings()]);
    setForm(initialForm);
    setStatus(`ส่งคำขอจอง ${booking.roomType} วันที่ ${formatDate(booking.checkIn)} เรียบร้อยแล้ว`);
    setStatusTone("success");
  }

  return (
    <>
      <header className="site-header">
        <a className="brand" href="#home" aria-label="Jantong Resort">
          <span className="brand-mark">JR</span>
          <span>Jantong Resort</span>
        </a>
        <button
          className="nav-toggle"
          aria-label="เปิดเมนู"
          aria-expanded={navOpen}
          onClick={() => setNavOpen((open) => !open)}
          type="button"
        >
          ☰
        </button>
        <nav className={`site-nav ${navOpen ? "open" : ""}`} aria-label="เมนูหลัก">
          <a href="#rooms">ห้องพัก</a>
          <a href="#services">บริการเสริม</a>
          <a href="#booking">จองห้อง</a>
          <a href="#gallery">แกลเลอรี</a>
          <a href="#contact">ติดต่อ</a>
          <Link className="nav-admin" href="/admin">
            Admin
          </Link>
        </nav>
      </header>

      <main id="home">
        <section className="hero" aria-label="Jantong Resort">
          <img src="/assets/images/hero-resort.png" alt="บรรยากาศ Jantong Resort ท่ามกลางสวนธรรมชาติ" className="hero-image" />
          <div className="hero-shade" />
          <div className="hero-content">
            <p className="eyebrow">รีสอร์ทธรรมชาติสำหรับวันพักผ่อน</p>
            <h1>Jantong Resort</h1>
            <p className="hero-copy">ห้องพักสะอาด เงียบสงบ ใกล้ธรรมชาติ พร้อมระบบจองออนไลน์และแจ้งมัดจำให้เจ้าของตรวจสอบได้ง่าย</p>
            <div className="hero-actions">
              <a className="button primary" href="#booking">จองห้องพัก</a>
              <a className="button ghost" href="#rooms">ดูห้องพัก</a>
            </div>
          </div>
        </section>

        <section className="trust-band" aria-label="ข้อมูลเด่น">
          <div><strong>24 ชม.</strong><span>รับคำขอจองออนไลน์</span></div>
          <div><strong>3 แบบ</strong><span>ห้องพักให้เลือก</span></div>
          <div><strong>LINE</strong><span>ยืนยันการโอนรวดเร็ว</span></div>
        </section>

        <section className="section intro-section">
          <div className="section-heading">
            <p className="eyebrow">พักง่าย ดูแลง่าย</p>
            <h2>เว็บรีสอร์ทที่พร้อมรับลูกค้าและช่วยเจ้าของจัดการหลังบ้าน</h2>
          </div>
          <div className="feature-grid">
            <article><span className="feature-icon">✓</span><h3>จองออนไลน์</h3><p>ลูกค้าส่งข้อมูลวันเข้าพัก จำนวนคน และช่องทางติดต่อได้ทันที</p></article>
            <article><span className="feature-icon">฿</span><h3>ติดตามมัดจำ</h3><p>หลังบ้านแสดงสถานะรอโอน โอนแล้ว และยืนยันแล้วอย่างชัดเจน</p></article>
            <article><span className="feature-icon">↗</span><h3>พร้อมทำ SEO</h3><p>มีโครง meta, schema, sitemap และเนื้อหาที่ Google อ่านได้</p></article>
          </div>
        </section>

        <section className="section" id="rooms">
          <div className="section-heading">
            <p className="eyebrow">ห้องพัก</p>
            <h2>เลือกห้องที่เหมาะกับทริปของคุณ</h2>
          </div>
          <div className="room-grid">
            <RoomCard image="/assets/images/garden-room.png" alt="ห้อง Garden Deluxe พร้อมวิวสวน" title="Garden Deluxe" price="฿1,490" details={["พักได้ 2 ท่าน", "Wi-Fi, แอร์, ทีวี, น้ำอุ่น", "มัดจำเริ่มต้น ฿500"]}>
              เตียงใหญ่ วิวสวน เงียบสงบ เหมาะกับคู่รักหรือพักผ่อนส่วนตัว
            </RoomCard>
            <RoomCard image="/assets/images/family-bungalow.png" alt="บ้านพัก Family Bungalow ท่ามกลางสวน" title="Family Bungalow" price="฿2,490" details={["พักได้ 4 ท่าน", "ระเบียงส่วนตัวและที่จอดรถ", "มัดจำเริ่มต้น ฿1,000"]}>
              บ้านพักส่วนตัวพร้อมระเบียง เหมาะกับครอบครัวและกลุ่มเพื่อน
            </RoomCard>
            <article className="room-card text-room">
              <div className="room-body">
                <div className="room-title-row"><h3>Standard Twin</h3><span>฿1,190</span></div>
                <p>ห้องเตียงคู่ขนาดกะทัดรัด ใช้งานง่าย เหมาะกับทริปทำงานหรือแวะพักระยะสั้น</p>
                <ul><li>พักได้ 2 ท่าน</li><li>เช็กอิน 14:00 / เช็กเอาต์ 12:00</li><li>สั่งกาแฟตอนเช้าได้</li></ul>
              </div>
            </article>
          </div>
        </section>

        <section className="section services-section" id="services">
          <div className="section-heading">
            <p className="eyebrow">บริการเสริม</p>
            <h2>เพิ่มรายได้ด้วยบริการที่ลูกค้าจองพร้อมห้องพักได้</h2>
          </div>
          <div className="service-grid">
            <ServiceCard title="เตียงเสริม" price="฿400 / คืน" detail="รองรับครอบครัวหรือกลุ่มเพื่อนที่ต้องการพักห้องเดียวกัน" />
            <ServiceCard title="กาแฟในตอนเช้า" price="สอบถามราคา" detail="กาแฟร้อนหรือเย็นสำหรับลูกค้าที่ต้องการเริ่มเช้าวันพักผ่อนแบบสบาย ๆ" />
          </div>
        </section>

        <section className="booking-section" id="booking">
          <div className="booking-copy">
            <p className="eyebrow">จองห้องพัก</p>
            <h2>ส่งคำขอจองให้รีสอร์ทตรวจสอบ</h2>
            <p>เมื่อส่งคำขอแล้ว ข้อมูลจะเข้าไปที่หลังบ้าน เจ้าของสามารถดูสถานะและอัปเดตการมัดจำได้ทันทีในหน้า admin</p>
            <div className="policy-list"><span>มัดจำเพื่อยืนยันห้อง</span><span>รองรับอัปโหลดสลิปในเวอร์ชันถัดไป</span><span>เชื่อม LINE แจ้งเตือนได้ภายหลัง</span></div>
          </div>
          <form className="booking-form" onSubmit={submitBooking}>
            <label>ชื่อผู้จอง<input type="text" name="guestName" value={form.guestName} onChange={updateForm} required placeholder="เช่น คุณต้น" /></label>
            <label>เบอร์โทร / LINE<input type="tel" name="phone" value={form.phone} onChange={updateForm} required placeholder="08x-xxx-xxxx" /></label>
            <div className="form-row">
              <label>วันเข้าพัก<input type="date" name="checkIn" value={form.checkIn} onChange={updateForm} required /></label>
              <label>วันออก<input type="date" name="checkOut" value={form.checkOut} onChange={updateForm} required /></label>
            </div>
            <div className="form-row">
              <label>ห้องพัก<select name="roomType" value={form.roomType} onChange={updateForm} required><option value="">เลือกห้อง</option><option>Garden Deluxe</option><option>Family Bungalow</option><option>Standard Twin</option></select></label>
              <label>จำนวนผู้เข้าพัก<input type="number" name="guests" min="1" max="12" value={form.guests} onChange={updateForm} required /></label>
            </div>
            <fieldset className="addon-fieldset">
              <legend>บริการเสริมที่สนใจ</legend>
              <div className="addon-grid">
                {addOnOptions.map((addOn) => (
                  <label className="addon-option" key={addOn}>
                    <input type="checkbox" value={addOn} checked={form.addOns.includes(addOn)} onChange={toggleAddOn} />
                    <span>{addOn}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label>หมายเหตุ<textarea name="note" rows="4" value={form.note} onChange={updateForm} placeholder="เช่น ขอห้องติดกัน / มีเด็กเล็ก / เข้าพักดึก" /></label>
            <button className="button primary full" type="submit">ส่งคำขอจอง</button>
            <p className={`form-status ${statusTone === "warning" ? "warning-text" : "success-text"}`} role="status">{status}</p>
          </form>
        </section>

        <section className="section muted" id="gallery">
          <div className="section-heading"><p className="eyebrow">บรรยากาศ</p><h2>พื้นที่พักผ่อนที่ถ่ายรูปได้ทุกมุม</h2></div>
          <div className="gallery-grid">
            <img src="/assets/images/hero-resort.png" alt="วิวรีสอร์ทและสวน" />
            <img src="/assets/images/garden-room.png" alt="ห้องพักรีสอร์ท" />
            <img src="/assets/images/family-bungalow.png" alt="บ้านพักในสวน" />
          </div>
        </section>

        <section className="section contact-section" id="contact">
          <div>
            <p className="eyebrow">ติดต่อเรา</p>
            <h2>สอบถามห้องว่างหรือขอใบเสนอราคา</h2>
            <p>โทร: 086-080-1979</p>
            <p>LINE: @jantongresort</p>
            <p>Facebook: Jantong Resort</p>
            <a className="button primary map-link" href={GOOGLE_MAPS_URL} target="_blank" rel="noreferrer">
              เปิดใน Google Maps
            </a>
          </div>
          <div className="map-card" aria-label="ตำแหน่ง Jantong Resort">
            <iframe
              title="แผนที่ Jantong Resort"
              src={GOOGLE_MAPS_EMBED_URL}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>© 2026 Jantong Resort. All rights reserved.</p>
        <Link href="/admin">Owner Login</Link>
      </footer>
    </>
  );
}

function RoomCard({ image, alt, title, price, details, children }) {
  return (
    <article className="room-card">
      <img src={image} alt={alt} />
      <div className="room-body">
        <div className="room-title-row"><h3>{title}</h3><span>{price}</span></div>
        <p>{children}</p>
        <ul>{details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
      </div>
    </article>
  );
}

function ServiceCard({ title, price, detail }) {
  return (
    <article className="service-card">
      <div className="service-card-top">
        <h3>{title}</h3>
        <span>{price}</span>
      </div>
      <p>{detail}</p>
    </article>
  );
}
