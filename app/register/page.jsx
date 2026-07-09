"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "../../lib/supabaseClient";

const USERS_KEY = "jantongCustomers";
const SESSION_KEY = "jantongCustomerSession";
const AUTH_REDIRECT_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL;

function readUsers() {
  const saved = localStorage.getItem(USERS_KEY);
  return saved ? JSON.parse(saved) : [];
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function saveSession(user) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({
    name: user.name,
    email: user.email,
    provider: user.provider || "email",
    loggedInAt: new Date().toISOString()
  }));
}

export default function RegisterPage() {
  const router = useRouter();
  const [status, setStatus] = useState("");

  async function submitRegister(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const email = String(data.get("email") || "").trim().toLowerCase();
    const password = String(data.get("password") || "");
    const confirmPassword = String(data.get("confirmPassword") || "");

    if (password.length < 6) {
      setStatus("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseBrowserClient();
      const redirectOrigin = AUTH_REDIRECT_ORIGIN || window.location.origin;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name, phone },
          emailRedirectTo: `${redirectOrigin}/login`
        }
      });

      if (error) {
        setStatus(error.message);
        return;
      }

      setStatus("สมัครสมาชิกเรียบร้อยแล้ว กรุณาตรวจอีเมลเพื่อยืนยันบัญชี");
      return;
    }

    const users = readUsers();
    if (users.some((user) => user.email === email)) {
      setStatus("อีเมลนี้ถูกสมัครไว้แล้ว กรุณาเข้าสู่ระบบ");
      return;
    }

    const user = { id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), name, phone, email, password, provider: "email", createdAt: new Date().toISOString() };
    writeUsers([user, ...users]);
    saveSession(user);
    router.push("/#booking");
  }

  async function socialRegister(provider) {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseBrowserClient();
      const redirectOrigin = AUTH_REDIRECT_ORIGIN || window.location.origin;
      await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${redirectOrigin}/#booking` }
      });
      return;
    }

    const providerName = provider === "google" ? "Google" : "Facebook";
    const email = `${provider}@jantong.local`;
    const users = readUsers();
    const existing = users.find((user) => user.email === email);
    const user = existing || {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      name: `ลูกค้า ${providerName}`,
      phone: "",
      email,
      password: "",
      provider,
      createdAt: new Date().toISOString()
    };

    if (!existing) writeUsers([user, ...users]);
    saveSession(user);
    router.push("/#booking");
  }

  return (
    <main className="auth-page">
      <Link className="brand auth-brand" href="/">
        <span className="brand-mark">JR</span>
        <span>Jantong Resort</span>
      </Link>

      <section className="auth-shell">
        <div className="auth-copy">
          <p className="eyebrow">Create Account</p>
          <h1>สมัครสมาชิกเพื่อจัดการการจองของคุณ</h1>
          <p>เก็บข้อมูลผู้จองไว้ใช้ครั้งถัดไป และรองรับการต่อยอดเป็นระบบสมาชิกจริงด้วย Google/Facebook OAuth ภายหลัง</p>
        </div>

        <div className="login-box auth-box">
          <p className="eyebrow">สมัครสมาชิก</p>
          <h2>สร้างบัญชีลูกค้า</h2>
          <div className="social-actions">
            <button className="button social-button google" type="button" onClick={() => socialRegister("google")}>
              <span>G</span>
              สมัครด้วย Google
            </button>
            <button className="button social-button facebook" type="button" onClick={() => socialRegister("facebook")}>
              <span>f</span>
              สมัครด้วย Facebook
            </button>
          </div>

          <div className="auth-divider"><span>หรือสมัครด้วยอีเมล</span></div>

          <form className="login-form" onSubmit={submitRegister}>
            <label>ชื่อ-นามสกุล<input type="text" name="name" required autoComplete="name" placeholder="ชื่อผู้เข้าพัก" /></label>
            <label>เบอร์โทร / LINE<input type="tel" name="phone" required autoComplete="tel" placeholder="08x-xxx-xxxx" /></label>
            <label>อีเมล<input type="email" name="email" required autoComplete="email" placeholder="you@example.com" /></label>
            <div className="form-row">
              <label>รหัสผ่าน<input type="password" name="password" required autoComplete="new-password" placeholder="อย่างน้อย 6 ตัวอักษร" /></label>
              <label>ยืนยันรหัสผ่าน<input type="password" name="confirmPassword" required autoComplete="new-password" placeholder="กรอกอีกครั้ง" /></label>
            </div>
            <button className="button primary full" type="submit">สมัครสมาชิก</button>
            <p className="form-status warning-text" role="status">{status}</p>
          </form>

          <p className="auth-switch">มีบัญชีแล้ว? <Link href="/login">เข้าสู่ระบบ</Link></p>
        </div>
      </section>
    </main>
  );
}
