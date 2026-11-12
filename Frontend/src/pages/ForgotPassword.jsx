
import { useState } from 'react';
import { Link } from 'react-router-dom';

import {
  Landmark,
  Mail,
  ArrowLeft,
  ShieldCheck,
  Info,
} from 'lucide-react';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA] flex items-center justify-center p-5">

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8 sm:p-10">

        <div className="flex items-center gap-3 mb-10">

          <div className="bg-[#101D35] p-3 rounded-xl">
            <Landmark className="text-[#C5A46D]" size={26} />
          </div>

          <div>
            <h1 className="font-bold text-xl text-[#101D35]">
              CFMS
            </h1>

            <p className="text-xs text-slate-500 tracking-widest">
              JUDICIAL MANAGEMENT
            </p>
          </div>

        </div>

        <div className="w-14 h-14 bg-[#E9EEF7] rounded-2xl flex items-center justify-center mb-6">
          <ShieldCheck size={29} className="text-[#203D68]" />
        </div>

        <p className="text-xs text-[#B18B50] font-bold tracking-widest uppercase mb-3">
          Account Assistance
        </p>

        <h2 className="text-3xl font-bold text-[#17243B]">
          Forgot Password?
        </h2>

        <p className="text-sm text-slate-500 mt-3 leading-6">
          Enter your registered email address to identify
          your CFMS account.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">

          <div>

            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Registered Email
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
                placeholder="Enter your registered email"
                className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:border-[#B18B50] focus:ring-4 focus:ring-[#B18B50]/10"
              />

            </div>

          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">

            <Info size={20} className="text-amber-600 shrink-0" />

            <p className="text-xs text-amber-800 leading-5">
              Automated password recovery is not configured
              on this server yet. Please contact your CFMS
              administrator for password assistance.
            </p>

          </div>

          {submitted && (
            <p className="text-sm text-[#203D68] bg-blue-50 p-3 rounded-xl">
              Please contact your CFMS administrator and
              provide your registered email address: {email}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-[#172B4D] hover:bg-[#223D67] text-white py-4 rounded-xl font-semibold transition"
          >
            Submit Email
          </button>

        </form>

        <Link
          to="/login"
          className="flex items-center justify-center gap-2 mt-7 text-sm font-semibold text-[#B18B50] hover:text-[#172B4D]"
        >
          <ArrowLeft size={17} />
          Back to Login
        </Link>

      </div>

    </div>
  );
}

export default ForgotPassword;
