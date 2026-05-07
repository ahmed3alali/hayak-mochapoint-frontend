'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Coffee, Eye, EyeOff, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import { authApi } from '@/lib/api';

type Step = 'credentials' | 'otp';

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [rememberMe, setRememberMe] = useState(false);
  const otpRefs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));

  useEffect(() => {
    const tokenMatch = document.cookie.match(new RegExp('(^| )admin_access_token=([^;]+)'));
    if (tokenMatch && tokenMatch[2]) {
      router.replace('/admin/dashboard');
    }
  }, [router]);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  /* ── Step 1: Email + Password ─────────────────────────────────────────── */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.login(email, password);
      setStep('otp');
      setCountdown(60);
      setTimeout(() => otpRefs[0].current?.focus(), 100);
    } catch (err: any) {
      setError(err.message);
      setCountdown(0);
    } finally {
      setLoading(false);
    }
  };

  /* ── OTP input logic ──────────────────────────────────────────────────── */
  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) otpRefs[i + 1].current?.focus();
  };

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      otpRefs[i - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      setOtp(text.split(''));
      otpRefs[5].current?.focus();
    }
  };

  /* ── Step 2: Verify OTP ───────────────────────────────────────────────── */
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) { setError('أدخل الرمز المكوّن من 6 أرقام'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await authApi.verifyOtp(email, code);
      const token = (res as any).accessToken;
      const mail = (res as any).email;
      if (rememberMe) {
        const maxAge = 30 * 24 * 60 * 60; // 30 days
        document.cookie = `admin_access_token=${token}; path=/; max-age=${maxAge}; samesite=lax`;
        document.cookie = `admin_email=${encodeURIComponent(mail)}; path=/; max-age=${maxAge}; samesite=lax`;
      } else {
        document.cookie = `admin_access_token=${token}; path=/; samesite=lax`;
        document.cookie = `admin_email=${encodeURIComponent(mail)}; path=/; samesite=lax`;
      }
      router.replace('/admin/dashboard');
    } catch (err: any) {
      setError(err.message);
      setOtp(['', '', '', '', '', '']);
      otpRefs[0].current?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-4" dir="rtl">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#3d2817]/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#3d2817] to-[#6b4423] rounded-2xl shadow-2xl mb-4">
            <Coffee className="w-8 h-8 text-[#D5C69E]" />
          </div>
          <h1 className="text-2xl font-bold text-white">Mocha Point</h1>
          <p className="text-white/40 text-sm mt-1">لوحة الإدارة — تسجيل الدخول</p>
        </div>

        {/* Card */}
        <div className="bg-[#141414] border border-white/5 rounded-2xl p-8 shadow-2xl">
          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-6">
            {['البيانات', 'رمز التحقق'].map((label, i) => {
              const active = (step === 'credentials' && i === 0) || (step === 'otp' && i === 1);
              const done = step === 'otp' && i === 0;
              return (
                <div key={i} className={`flex items-center gap-2 text-xs ${active ? 'text-[#D5C69E]' : done ? 'text-green-400' : 'text-white/20'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border
                    ${active ? 'bg-[#3d2817] border-[#D5C69E]/50' : done ? 'bg-green-500/20 border-green-500/50' : 'border-white/10'}`}>
                    {done ? '✓' : i + 1}
                  </div>
                  {label}
                  {i === 0 && <div className={`h-px flex-1 w-8 ${step === 'otp' ? 'bg-[#D5C69E]/30' : 'bg-white/10'}`} />}
                </div>
              );
            })}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-right">
              {error}
            </div>
          )}

          {/* ── STEP 1: Credentials ─────────────────────────────────────── */}
          {step === 'credentials' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs text-white/50 mb-2">البريد الإلكتروني</label>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#D5C69E]/40 transition-colors"
                  placeholder="admin@cafe.com"
                />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-2">كلمة المرور</label>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#D5C69E]/40 transition-colors pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <label className="flex items-center gap-3 cursor-pointer select-none group">
                <div
                  onClick={() => setRememberMe(r => !r)}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${rememberMe
                      ? 'bg-[#3d2817] border-[#D5C69E]/60'
                      : 'border-white/20 group-hover:border-white/40'
                    }`}
                >
                  {rememberMe && <span className="text-[#D5C69E] text-xs font-bold">✓</span>}
                </div>
                <span className="text-white/50 text-sm group-hover:text-white/70 transition-colors">تذكر هذا الجهاز</span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-l from-[#3d2817] to-[#5a3a22] hover:from-[#4d3020] hover:to-[#6b4423] text-[#D5C69E] py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>إرسال رمز التحقق</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}

          {/* ── STEP 2: OTP ─────────────────────────────────────────────── */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="text-center">
                <ShieldCheck className="w-10 h-10 text-[#D5C69E] mx-auto mb-2" />
                <p className="text-white/60 text-sm">
                  تم إرسال رمز التحقق إلى<br />
                  <span className="text-white font-medium">{email}</span>
                </p>
              </div>

              {/* OTP boxes */}
              <div className="flex gap-2 justify-center" dir="ltr" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={otpRefs[i]}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className="w-12 h-14 text-center text-xl font-bold bg-[#1e1e1e] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#D5C69E]/60 focus:ring-1 focus:ring-[#D5C69E]/30 transition-all"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                className="w-full bg-gradient-to-l from-[#3d2817] to-[#5a3a22] hover:from-[#4d3020] hover:to-[#6b4423] text-[#D5C69E] py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'تحقق وادخل'}
              </button>

              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-white/30 text-xs">إعادة الإرسال خلال {countdown}s</p>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setStep('credentials'); setOtp(['', '', '', '', '', '']); setError(''); }}
                    className="text-[#D5C69E]/60 hover:text-[#D5C69E] text-xs transition-colors"
                  >
                    العودة وإعادة المحاولة
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          محمي بالتحقق الثنائي · Mocha Point © 2024
        </p>
      </div>
    </div>
  );
}
