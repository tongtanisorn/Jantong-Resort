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

function saveSession(user) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({
    name: user.name,
    email: user.email,
    provider: user.provider || "email",
    loggedInAt: new Date().toISOString()
  }));
}

export default function LoginPage() {
  const router = useRouter();
  const [status, setStatus] = useState("");

  async function submitLogin(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") || "").trim().toLowerCase();
    const password = String(data.get("password") || "");

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setStatus("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        return;
      }
      router.push("/#booking");
      return;
    }

    const user = readUsers().find((account) => account.email === email && account.password === password);

    if (!user) {
      setStatus("ไม่พบบัญชีนี้ หรือรหัสผ่านไม่ถูกต้อง");
      return;
    }

    saveSession(user);
    router.push("/#booking");
  }

  async function socialLogin(provider) {
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
    saveSession({
      name: `ลูกค้า ${providerName}`,
      email: `${provider}@jantong.local`,
      provider
    });
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
          <p className="eyebrow">Customer Login</p>
          <h1>เข้าสู่ระบบเพื่อจองห้องพักได้เร็วขึ้น</h1>
          <p>ลูกค้าสามารถกลับมาดูข้อมูลการจอง อัปโหลดสลิป และรับข่าวสารจากรีสอร์ทได้ในอนาคต</p>
        </div>

        <div className="login-box auth-box">
          <p className="eyebrow">เข้าสู่ระบบ</p>
          <h2>ยินดีต้อนรับกลับ</h2>
          <div className="social-actions">
            <button className="button social-button google" type="button" onClick={() => socialLogin("google")}>
              <span>G</span>
              เข้าสู่ระบบด้วย Google
            </button>
            <button className="button social-button facebook" type="button" onClick={() => socialLogin("facebook")}>
              <span>f</span>
              เข้าสู่ระบบด้วย Facebook
            </button>
          </div>

          <div className="auth-divider"><span>หรือใช้อีเมล</span></div>

          <form className="login-form" onSubmit={submitLogin}>
            <label>อีเมล<input type="email" name="email" required autoComplete="email" placeholder="you@example.com" /></label>
            <label>รหัสผ่าน<input type="password" name="password" required autoComplete="current-password" placeholder="กรอกรหัสผ่าน" /></label>
            <button className="button primary full" type="submit">เข้าสู่ระบบ</button>
            <p className="form-status warning-text" role="status">{status}</p>
          </form>

          <p className="auth-switch">ยังไม่มีบัญชี? <Link href="/register">สมัครสมาชิก</Link></p>
        </div>
      </section>
    </main>
  );
}
