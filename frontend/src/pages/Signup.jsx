import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App.jsx';
import { User, Mail, Lock, Feather, AlertCircle, RefreshCw, UserCircle2 } from 'lucide-react';

export default function Signup() {
  const { signup, loginAsGuest, loading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    const res = await signup(name, email, password);
    if (!res.success) {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0f19] px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-950/20 via-slate-900/10 to-[#0b0f19] pointer-events-none"></div>

      <div className="relative w-full max-w-md bg-[#131b2e] border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl mb-4 text-[#059669]">
            <Feather size={28} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create your account</h1>
          <p className="text-slate-400 text-sm mt-2">Start drafting human-aligned content with EmpathWrite AI</p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 bg-red-950/30 border border-red-500/30 text-red-300 p-3 rounded-lg text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5" htmlFor="name">
              Full Name
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="name"
                type="text"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-[#0b0f19] border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="email"
                type="email"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-[#0b0f19] border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="password"
                type="password"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-[#0b0f19] border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#059669] hover:bg-[#047857] text-white font-medium rounded-xl flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-55"
          >
            {loading ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Registering...
              </>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-xs text-slate-600 shrink-0">or</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        <button
          id="guest-login-btn"
          type="button"
          onClick={loginAsGuest}
          className="mt-4 w-full py-2.5 bg-transparent border border-slate-700 hover:border-slate-500 hover:bg-slate-800/40 text-slate-400 hover:text-slate-200 font-medium rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <UserCircle2 size={18} />
          Continue as Guest
        </button>

        <div className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-[#059669] hover:text-[#047857] font-medium underline underline-offset-4">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
