
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  ShieldCheck,
  LockKeyhole,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Scale,
  Landmark,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSubmitting(true);

    try {
      await login(email, password, rememberMe);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Login failed. Please check your credentials.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA] flex">

      {/* LEFT BRANDING SECTION */}

      <div className="hidden lg:flex lg:w-[52%] bg-[#101D35] relative overflow-hidden flex-col justify-between p-12 text-white">

        <div className="absolute w-[500px] h-[500px] rounded-full border border-white/10 -top-40 -left-40" />

        <div className="absolute w-[400px] h-[400px] rounded-full border border-white/10 bottom-[-150px] right-[-100px]" />

        <div className="relative z-10 flex items-center gap-3">

          <div className="bg-[#C5A46D] p-3 rounded-xl">
            <Landmark size={28} className="text-[#101D35]" />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-wide">
              CFMS
            </h1>

            <p className="text-xs text-slate-400 tracking-widest">
              JUDICIAL MANAGEMENT
            </p>
          </div>

        </div>

        <div className="relative z-10 max-w-xl">

          <div className="w-16 h-1 bg-[#C5A46D] mb-8" />

          <p className="text-[#C5A46D] uppercase tracking-[0.3em] text-xs font-semibold mb-5">
            Sindh High Court
          </p>

          <h2 className="text-5xl font-semibold leading-tight">
            Modernizing
            <br />

            <span className="text-[#C5A46D]">
              Justice.
            </span>

            <br />

            Empowering
            <br />
            Efficiency.
          </h2>

          <p className="text-slate-400 mt-7 leading-8 max-w-md">
            A centralized digital platform for managing
            judicial cases, court proceedings, hearings
            and institutional records.
          </p>

          <div className="flex items-center gap-4 mt-10">

            <div className="w-12 h-12 rounded-full border border-[#C5A46D]/40 flex items-center justify-center">
              <Scale className="text-[#C5A46D]" size={23} />
            </div>

            <div>
              <p className="text-sm font-medium">
                Justice Through Technology
              </p>

              <p className="text-xs text-slate-500 mt-1">
                Secure • Organized • Transparent
              </p>
            </div>

          </div>

        </div>

        <p className="relative z-10 text-xs text-slate-500">
          © 2026 CFMS | Judicial Case Flow Management System
        </p>

      </div>

      {/* RIGHT LOGIN SECTION */}

      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">

        <div className="w-full max-w-md">

          <div className="lg:hidden flex items-center gap-3 mb-12">

            <div className="bg-[#101D35] p-3 rounded-xl">
              <Landmark className="text-[#C5A46D]" size={25} />
            </div>

            <div>
              <h1 className="font-bold text-xl text-[#101D35]">
                CFMS
              </h1>

              <p className="text-xs text-slate-500">
                JUDICIAL MANAGEMENT
              </p>
            </div>

          </div>

          <div className="mb-9">

            <div className="w-14 h-14 bg-[#E9EEF7] rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck size={29} className="text-[#203D68]" />
            </div>

            <p className="text-sm text-[#B18B50] font-semibold uppercase tracking-widest mb-3">
              Secure Portal
            </p>

            <h2 className="text-3xl font-bold text-[#17243B]">
              Welcome Back
            </h2>

            <p className="text-slate-500 mt-3 text-sm leading-6">
              Sign in to access the Judicial Case Flow
              Management System.
            </p>

          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* EMAIL */}

            <div>

              <label className="block text-sm font-semibold text-[#27364D] mb-2">
                Email Address
              </label>

              <div className="relative">

                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#B18B50] focus:ring-4 focus:ring-[#B18B50]/10 transition"
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div>

              <label className="block text-sm font-semibold text-[#27364D] mb-2">
                Password
              </label>

              <div className="relative">

                <LockKeyhole
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#B18B50] focus:ring-4 focus:ring-[#B18B50]/10 transition"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

            </div>

            {/* REMEMBER ME AND FORGOT PASSWORD */}

            <div className="flex items-center justify-between gap-3 text-sm">

              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 accent-[#172B4D]"
                />

                Remember me

              </label>

              <Link
                to="/forgot-password"
                className="font-semibold text-[#B18B50] hover:text-[#172B4D]"
              >
                Forgot Password?
              </Link>

            </div>

            {/* ERROR */}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">
                {error}
              </div>
            )}

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#172B4D] hover:bg-[#223D67] disabled:opacity-60 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all shadow-lg shadow-[#172B4D]/15"
            >
              {submitting ? 'Signing in...' : 'Sign In'}

              {!submitting && <ArrowRight size={18} />}

            </button>

          </form>

          {/* SECURITY FOOTER */}

          <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-center gap-2 text-xs text-slate-400">

            <LockKeyhole size={13} />

            Secure Authentication Portal

          </div>

          <p className="text-center text-xs text-slate-400 mt-5">
            © 2026 CFMS. All rights reserved.
          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;
