"use client";

import Link from "next/link";
import { useState } from "react";
import { createBookingInSupabase, isSupabaseConfigured, updateBookingInSupabase } from "../lib/supabaseClient";

const STORAGE_KEY = "jantongBookings";
const GOOGLE_MAPS_URL = "https://maps.app.goo.gl/8tovafGTeeYNSVyF9";
const GOOGLE_MAPS_EMBED_URL = "https://www.google.com/maps?q=%E0%B8%88%E0%B8%B1%E0%B8%99%E0%B8%97%E0%B8%A3%E0%B9%8C%E0%B8%97%E0%B8%AD%E0%B8%87%E0%B8%A3%E0%B8%B5%E0%B8%AA%E0%B8%AD%E0%B8%A3%E0%B9%8C%E0%B8%97&output=embed";

const roomOptions = [
  { stayType: "temporary", label: "เรือนแถว ห้อง 7", price: 250, rateLabel: "250 บาท / 3 ชม." },
  { stayType: "temporary", label: "เรือนแถว ห้อง 8", price: 250, rateLabel: "250 บาท / 3 ชม." },
  { stayType: "temporary", label: "เรือนแถว ห้อง 9", price: 250, rateLabel: "250 บาท / 3 ชม." },
  { stayType: "temporary", label: "เรือนแถว ห้อง 10", price: 250, rateLabel: "250 บาท / 3 ชม." },
  { stayType: "overnight", label: "บ้านพักหลังที่ 1", price: 600, rateLabel: "600 บาท / คืน" },
  { stayType: "overnight", label: "บ้านพักหลังที่ 2", price: 600, rateLabel: "600 บาท / คืน" },
  { stayType: "overnight", label: "บ้านพักหลังที่ 3", price: 700, rateLabel: "700 บาท / คืน" },
  { stayType: "overnight", label: "บ้านพักหลังที่ 4", price: 700, rateLabel: "700 บาท / คืน" }
];

const addOnOptions = [
  "เตียงเสริม",
  "กาแฟ"
];

const initialForm = {
  guestName: "",
  phone: "",
  stayType: "overnight",
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

function updateLocalBooking(id, changes) {
  const nextBookings = getBookings().map((booking) => (booking.id === id ? { ...booking, ...changes } : booking));
  saveBookings(nextBookings);
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
  const [payment, setPayment] = useState(null);
  const [slipStatus, setSlipStatus] = useState("");
  const availableRooms = roomOptions.filter((room) => room.stayType === form.stayType);
  const selectedRoom = roomOptions.find((room) => room.label === form.roomType);

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
      roomType: name === "stayType" ? "" : name === "roomType" ? value : current.roomType,
      checkOut: name === "stayType" && value === "temporary" ? "" : current.checkOut
    }));
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

  async function submitBooking(event) {
    event.preventDefault();

    if (form.stayType === "overnight" && new Date(form.checkOut) <= new Date(form.checkIn)) {
      setStatus("กรุณาเลือกวันออกหลังวันเข้าพัก");
      setStatusTone("warning");
      return;
    }

    const booking = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      guestName: form.guestName.trim(),
      phone: form.phone.trim(),
      checkIn: form.checkIn,
      checkOut: form.stayType === "temporary" ? form.checkIn : form.checkOut,
      roomType: form.roomType,
      guests: Number(form.guests),
      addOns: form.addOns,
      note: form.note.trim(),
      depositAmount: selectedRoom?.price || 250,
      depositStatus: "pending",
      bookingStatus: "new",
      createdAt: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      const { error } = await createBookingInSupabase(booking);
      if (error) saveBookings([booking, ...getBookings()]);
    } else {
      saveBookings([booking, ...getBookings()]);
    }

    setForm(initialForm);
    setSlipStatus("");

    try {
      const response = await fetch("/api/deposit-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id, amount: booking.depositAmount })
      });

      if (!response.ok) throw new Error("Unable to create deposit QR");

      const qr = await response.json();
      setPayment({ ...qr, roomType: booking.roomType, checkIn: booking.checkIn });
      setStatus(`ส่งคำขอจอง ${booking.roomType} วันที่ ${formatDate(booking.checkIn)} เรียบร้อยแล้ว กรุณาสแกน QR เพื่อชำระมัดจำ`);
      setStatusTone("success");
    } catch {
      setPayment(null);
      setStatus("ส่งคำขอจองเรียบร้อยแล้ว แต่ยังสร้าง QR มัดจำไม่ได้ กรุณาติดต่อรีสอร์ทเพื่อขอช่องทางโอนเงิน");
      setStatusTone("warning");
    }
  }

  function uploadSlip(event) {
    const file = event.target.files?.[0];
    if (!file || !payment) return;

    if (!file.type.startsWith("image/")) {
      setSlipStatus("กรุณาอัปโหลดไฟล์รูปภาพสลิปเท่านั้น");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const changes = {
        depositStatus: "paid",
        bookingStatus: "awaiting_review",
        slipName: file.name,
        slipDataUrl: reader.result,
        slipUploadedAt: new Date().toISOString()
      };

      if (isSupabaseConfigured()) {
        const { error } = await updateBookingInSupabase(payment.bookingId, changes);
        if (error) updateLocalBooking(payment.bookingId, changes);
      } else {
        updateLocalBooking(payment.bookingId, changes);
      }

      setSlipStatus("อัปโหลดสลิปเรียบร้อยแล้ว เจ้าของจะตรวจสอบและยืนยันการจอง");
    };
    reader.readAsDataURL(file);
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
          <Link href="/login">เข้าสู่ระบบ</Link>
          <Link className="nav-admin" href="/admin">
            Admin
          </Link>
        </nav>
      </header>

      <main id="home">
        <section className="hero" aria-label="Jantong Resort">
          <img src="/assets/images/resort-lawn-hero.jpg" alt="บรรยากาศสนามหญ้าและบ้านพักของ Jantong Resort" className="hero-image" />
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
          <div><strong>250</strong><span>ชั่วคราว 3 ชั่วโมง</span></div>
          <div><strong>4 หลัง</strong><span>บ้านพักค้างคืน</span></div>
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
            <RoomCard image="/assets/images/garden-room.png" alt="ห้องเรือนแถวสำหรับพักชั่วคราว" title="เรือนแถว ห้อง 7-10" price="฿250 / 3 ชม." details={["มี 4 ห้อง: 7, 8, 9, 10", "เหมาะกับพักชั่วคราว", "ชำระผ่าน QR ได้"]}>
              ห้องพักแบบเรือนแถวสำหรับลูกค้าที่ต้องการพักชั่วคราว ใช้งานง่าย จองเป็นรายห้องได้
            </RoomCard>
            <RoomCard image="/assets/images/jantong-bungalows.jpg" alt="บ้านพักค้างคืนของจันทร์ทองรีสอร์ท" title="บ้านพักหลังที่ 1-2" price="฿600 / คืน" details={["บ้านเป็นหลัง", "ระเบียงส่วนตัว", "เหมาะกับพักค้างคืน"]}>
              บ้านพักเป็นหลังแบบในรูป บรรยากาศสวน เงียบสงบ เหมาะสำหรับลูกค้าค้างคืน
            </RoomCard>
            <article className="room-card text-room">
              <div className="room-body">
                <div className="room-title-row"><h3>บ้านพักหลังที่ 3-4</h3><span>฿700 / คืน</span></div>
                <p>บ้านพักค้างคืนราคามาตรฐาน สำหรับลูกค้าที่ต้องการพักผ่อนในรีสอร์ทแบบเป็นส่วนตัว</p>
                <ul><li>บ้านเป็นหลัง 2 หลัง</li><li>ราคา 700 บาทต่อคืน</li><li>สั่งกาแฟตอนเช้าได้</li></ul>
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
            <ServiceCard title="เตียงเสริม" price="฿200 / ชุด" detail="เหมาะสำหรับลูกค้าที่ต้องการเพิ่มที่นอนในห้องเดียวกัน" />
            <ServiceCard title="กาแฟ" price="ฟรี" detail="บริการกาแฟในตอนเช้าสำหรับลูกค้าที่เข้าพัก" />
          </div>
        </section>

        <section className="booking-section" id="booking">
          <div className="booking-copy">
            <p className="eyebrow">จองห้องพัก</p>
            <h2>ส่งคำขอจองให้รีสอร์ทตรวจสอบ</h2>
            <p>เลือกได้ทั้งพักชั่วคราว 3 ชั่วโมง และพักค้างคืน ข้อมูลจะเข้าไปที่หลังบ้านให้เจ้าของตรวจสอบทันที</p>
            <div className="policy-list"><span>ชั่วคราว 250 บาท / 3 ชม.</span><span>ค้างคืน 600-700 บาท / คืน</span><span>เชื่อม LINE แจ้งเตือนได้ภายหลัง</span></div>
          </div>
          <form className="booking-form" onSubmit={submitBooking}>
            <label>ชื่อผู้จอง<input type="text" name="guestName" value={form.guestName} onChange={updateForm} required placeholder="เช่น คุณต้น" /></label>
            <label>เบอร์โทร / LINE<input type="tel" name="phone" value={form.phone} onChange={updateForm} required placeholder="08x-xxx-xxxx" /></label>
            <label>รูปแบบการพัก<select name="stayType" value={form.stayType} onChange={updateForm} required><option value="overnight">ค้างคืน</option><option value="temporary">ชั่วคราว 3 ชั่วโมง</option></select></label>
            <div className="form-row">
              <label>{form.stayType === "temporary" ? "วันที่ใช้ห้อง" : "วันเข้าพัก"}<input type="date" name="checkIn" value={form.checkIn} onChange={updateForm} required /></label>
              {form.stayType === "overnight" ? (
                <label>วันออก<input type="date" name="checkOut" value={form.checkOut} onChange={updateForm} required /></label>
              ) : (
                <label>ระยะเวลา<input type="text" value="3 ชั่วโมง" readOnly /></label>
              )}
            </div>
            <div className="form-row">
              <label>ห้องพัก<select name="roomType" value={form.roomType} onChange={updateForm} required><option value="">เลือกห้อง</option>{availableRooms.map((room) => <option value={room.label} key={room.label}>{room.label} - {room.rateLabel}</option>)}</select></label>
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
            {payment ? (
              <section className="deposit-panel" aria-label="ชำระค่ามัดจำ">
                <div>
                  <p className="eyebrow">ชำระค่ามัดจำ</p>
                  <h3>สแกน QR เพื่อโอนมัดจำ {payment.amount.toLocaleString("th-TH")} บาท</h3>
                  <p>หลังโอนแล้ว กรุณาอัปโหลดสลิป เพื่อให้เจ้าของตรวจสอบในหลังบ้าน</p>
                </div>
                <img src={payment.qrDataUrl} alt={`PromptPay QR มัดจำ ${payment.amount} บาท`} className="deposit-qr" />
                <label className="slip-upload">
                  อัปโหลดสลิปโอนเงิน
                  <input type="file" accept="image/*" onChange={uploadSlip} />
                </label>
                <p className="form-status success-text" role="status">{slipStatus}</p>
              </section>
            ) : null}
          </form>
        </section>

        <section className="section muted" id="gallery">
          <div className="section-heading"><p className="eyebrow">บรรยากาศ</p><h2>พื้นที่พักผ่อนที่ถ่ายรูปได้ทุกมุม</h2></div>
          <div className="gallery-grid">
            <img src="/assets/images/resort-lawn-hero.jpg" alt="วิวสนามหญ้าและบ้านพักในสวน" />
            <img src="/assets/images/jantong-bungalows.jpg" alt="บ้านพักค้างคืนในสวน" />
            <img src="/assets/images/garden-room.png" alt="ห้องพักรีสอร์ท" />
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
        <div className="footer-links">
          <Link href="/login">Customer Login</Link>
          <Link href="/admin">Owner Login</Link>
        </div>
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
