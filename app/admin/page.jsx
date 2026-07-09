"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "jantongBookings";
const SESSION_KEY = "jantongAdminSession";

const sampleBookings = [
  { id: "sample-1", guestName: "คุณมะลิ", phone: "081-234-5678", checkIn: "2026-07-18", checkOut: "2026-07-20", roomType: "Garden Deluxe", guests: 2, addOns: ["กาแฟ"], note: "ขอห้องวิวสวน", depositAmount: 500, depositStatus: "verified", bookingStatus: "confirmed", createdAt: "2026-07-06T09:30:00.000Z" },
  { id: "sample-2", guestName: "คุณอาทิตย์", phone: "089-222-1111", checkIn: "2026-07-22", checkOut: "2026-07-23", roomType: "Family Bungalow", guests: 4, addOns: ["เตียงเสริม"], note: "จะโอนมัดจำช่วงเย็น", depositAmount: 1000, depositStatus: "pending", bookingStatus: "new", createdAt: "2026-07-07T12:15:00.000Z" },
  { id: "sample-3", guestName: "คุณกานต์", phone: "086-555-5555", checkIn: "2026-07-25", checkOut: "2026-07-27", roomType: "Standard Twin", guests: 2, addOns: ["กาแฟ"], note: "ส่งสลิปทาง LINE แล้ว", depositAmount: 500, depositStatus: "paid", bookingStatus: "awaiting_review", createdAt: "2026-07-08T08:45:00.000Z" }
];

const labels = {
  pending: "รอโอน",
  paid: "โอนแล้ว",
  verified: "ยืนยันแล้ว",
  new: "คำขอใหม่",
  confirmed: "ยืนยันจอง",
  awaiting_review: "รอตรวจสอบ",
  checked_in: "เช็กอินแล้ว",
  cancelled: "ยกเลิก"
};

function readBookings() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleBookings));
  return sampleBookings;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("th-TH", { year: "numeric", month: "short", day: "numeric" }).format(new Date(date));
}

function currency(value) {
  return new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(value);
}

export default function AdminPage() {
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginStatus, setLoginStatus] = useState("");
  const [bookings, setBookings] = useState([]);
  const [query, setQuery] = useState("");
  const [depositFilter, setDepositFilter] = useState("all");

  useEffect(() => {
    setBookings(readBookings());
    setIsLoggedIn(sessionStorage.getItem(SESSION_KEY) === "active");
    setIsReady(true);
  }, []);

  const filteredBookings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return bookings.filter((booking) => {
      const haystack = `${booking.guestName} ${booking.phone} ${booking.roomType}`.toLowerCase();
      const queryMatch = !normalizedQuery || haystack.includes(normalizedQuery);
      const statusMatch = depositFilter === "all" || booking.depositStatus === depositFilter;
      return queryMatch && statusMatch;
    });
  }, [bookings, query, depositFilter]);

  const metrics = useMemo(() => {
    const pending = bookings.filter((booking) => booking.depositStatus === "pending").length;
    const paid = bookings.filter((booking) => booking.depositStatus === "paid").length;
    const verifiedValue = bookings
      .filter((booking) => booking.depositStatus === "verified")
      .reduce((sum, booking) => sum + Number(booking.depositAmount || 0), 0);
    return [
      ["รายการจอง", bookings.length],
      ["รอโอน", pending],
      ["โอนแล้วรอตรวจ", paid],
      ["มัดจำยืนยัน", currency(verifiedValue)]
    ];
  }, [bookings]);

  function submitLogin(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (data.get("username") === "admin" && data.get("password") === "jantong2026") {
      sessionStorage.setItem(SESSION_KEY, "active");
      setIsLoggedIn(true);
      setLoginStatus("");
      return;
    }
    setLoginStatus("Username หรือ Password ไม่ถูกต้อง");
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    setIsLoggedIn(false);
  }

  function updateBooking(id, field, value) {
    setBookings((current) => {
      const nextBookings = current.map((booking) => (booking.id === id ? { ...booking, [field]: value } : booking));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextBookings));
      return nextBookings;
    });
  }

  function exportCsv() {
    const header = ["guestName", "phone", "checkIn", "checkOut", "roomType", "guests", "addOns", "depositAmount", "depositStatus", "bookingStatus", "note"];
    const csv = [
      header.join(","),
      ...filteredBookings.map((booking) =>
        header
          .map((key) => {
            const value = Array.isArray(booking[key]) ? booking[key].join(" | ") : booking[key];
            return `"${String(value ?? "").replaceAll('"', '""')}"`;
          })
          .join(",")
      )
    ].join("\n");
    const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "jantong-bookings.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  if (!isReady) return null;

  return (
    <main className="admin-shell">
      {!isLoggedIn ? (
        <section className="login-panel">
          <Link className="brand admin-brand" href="/">
            <span className="brand-mark">JR</span>
            <span>Jantong Resort</span>
          </Link>
          <div className="login-box">
            <p className="eyebrow">Owner Login</p>
            <h1>เข้าสู่ระบบหลังบ้าน</h1>
            <form className="login-form" onSubmit={submitLogin}>
              <label>Username<input type="text" name="username" required autoComplete="username" /></label>
              <label>Password<input type="password" name="password" required autoComplete="current-password" /></label>
              <button className="button primary full" type="submit">เข้าสู่ระบบ</button>
              <p className="form-status warning-text" role="status">{loginStatus}</p>
            </form>
          </div>
        </section>
      ) : (
        <section className="dashboard">
          <aside className="admin-sidebar">
            <Link className="brand" href="/">
              <span className="brand-mark">JR</span>
              <span>Jantong Resort</span>
            </Link>
            <nav><a href="#overview" className="active">ภาพรวม</a><a href="#bookings">รายการจอง</a><a href="#rooms">ห้องพัก</a><a href="#settings">ตั้งค่า</a></nav>
            <button className="button ghost full" onClick={logout} type="button">ออกจากระบบ</button>
          </aside>

          <section className="admin-main">
            <div className="admin-topbar">
              <div><p className="eyebrow">Dashboard</p><h1>จัดการรายการจอง</h1></div>
              <Link className="button ghost" href="/">ดูหน้าเว็บ</Link>
            </div>

            <div className="metric-grid">
              {metrics.map(([label, value]) => <article className="metric-card" key={label}><span>{label}</span><strong>{value}</strong></article>)}
            </div>

            <div className="admin-tools">
              <label>ค้นหา<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ชื่อ เบอร์ หรือห้องพัก" /></label>
              <label>สถานะมัดจำ<select value={depositFilter} onChange={(event) => setDepositFilter(event.target.value)}><option value="all">ทั้งหมด</option><option value="pending">รอโอน</option><option value="paid">โอนแล้ว</option><option value="verified">ยืนยันแล้ว</option></select></label>
              <button className="button secondary" onClick={exportCsv} type="button">Export CSV</button>
            </div>

            <div className="table-wrap" id="bookings">
              <table className="booking-table">
                <thead><tr><th>ผู้จอง</th><th>วันที่เข้าพัก</th><th>ห้อง</th><th>บริการเสริม</th><th>มัดจำ</th><th>สถานะจอง</th><th>หมายเหตุ</th></tr></thead>
                <tbody>
                  {filteredBookings.length ? filteredBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="guest-cell"><strong>{booking.guestName}</strong><span>{booking.phone}</span><span>{booking.guests} ท่าน</span></td>
                      <td><strong>{formatDate(booking.checkIn)}</strong><div className="muted-text">ถึง {formatDate(booking.checkOut)}</div></td>
                      <td>{booking.roomType}</td>
                      <td>{booking.addOns?.length ? booking.addOns.join(", ") : "-"}</td>
                      <td><span className={`status-pill status-${booking.depositStatus}`}>{labels[booking.depositStatus]}</span><div className="muted-text">{currency(booking.depositAmount)}</div><StatusSelect options={["pending", "paid", "verified"]} value={booking.depositStatus} onChange={(value) => updateBooking(booking.id, "depositStatus", value)} /></td>
                      <td><span className={`status-pill ${booking.bookingStatus === "cancelled" ? "status-cancelled" : "status-verified"}`}>{labels[booking.bookingStatus]}</span><StatusSelect options={["new", "awaiting_review", "confirmed", "checked_in", "cancelled"]} value={booking.bookingStatus} onChange={(value) => updateBooking(booking.id, "bookingStatus", value)} /></td>
                      <td>{booking.note || "-"}</td>
                    </tr>
                  )) : <tr><td colSpan="7" className="muted-text">ยังไม่มีรายการตามเงื่อนไขที่เลือก</td></tr>}
                </tbody>
              </table>
            </div>

            <section className="room-admin" id="rooms">
              <div className="section-heading compact"><p className="eyebrow">Rooms</p><h2>ข้อมูลห้องพักเบื้องต้น</h2></div>
              <div className="room-stock-grid">
                <article><strong>Garden Deluxe</strong><span>4 ห้อง</span><small>฿1,490 / คืน</small></article>
                <article><strong>Family Bungalow</strong><span>2 หลัง</span><small>฿2,490 / คืน</small></article>
                <article><strong>Standard Twin</strong><span>6 ห้อง</span><small>฿1,190 / คืน</small></article>
              </div>
            </section>
          </section>
        </section>
      )}
    </main>
  );
}

function StatusSelect({ options, value, onChange }) {
  return (
    <select className="inline-select" value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => <option value={option} key={option}>{labels[option]}</option>)}
    </select>
  );
}
