import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { X, Lock, Mail, User, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export function AuthModal() {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    login,
    register,
    setIsProModalOpen,
    pendingProUpgrade,
    setPendingProUpgrade,
  } = useApp();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const isRegister = authModalMode === 'register';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Please enter your full name');
        if (!email.includes('@')) throw new Error('Please enter a valid email address');
        if (password.length < 6) throw new Error('Password must be at least 6 characters');
        await register(name.trim(), email.trim(), password);
        showToast('✓ Account created successfully!', 'success');
      } else {
        if (!email || !password) throw new Error('Please enter your email and password');
        await login(email.trim(), password);
        showToast('✓ Logged in successfully!', 'success');
      }

      setIsAuthModalOpen(false);

      // If user was in the middle of upgrading to Pro, open the Pro checkout modal
      if (pendingProUpgrade) {
        setPendingProUpgrade(false);
        setIsProModalOpen(true);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={() => setIsAuthModalOpen(false)}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#151A22] rounded-2xl shadow-2xl border border-[#E6DFD7] dark:border-[#2E3A4B] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#F1ECE6] dark:border-[#242D3B] flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-lg text-[#1C1F23] dark:text-[#F5F7FA] flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#FF5500] fill-[#FF5500]" />
              {isRegister ? 'Create Pro Account' : 'Sign In to FormFit AI'}
            </h3>
            <p className="text-xs text-[#5F6670] dark:text-[#9BA4B2] mt-0.5">
              {isRegister
                ? 'Register to unlock Pro batch processing and cloud presets.'
                : 'Sign in to access your verified Pro subscription.'}
            </p>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-[#F1ECE6] dark:border-[#242D3B] text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setAuthModalMode('register');
              setErrorMsg('');
            }}
            className={`flex-1 py-3 text-center transition-colors ${
              isRegister
                ? 'text-[#FF5500] border-b-2 border-[#FF5500] bg-[#FFF1EB]/30 dark:bg-[#FF5500]/10'
                : 'text-[#5F6670] dark:text-[#9BA4B2] hover:text-[#1C1F23]'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthModalMode('login');
              setErrorMsg('');
            }}
            className={`flex-1 py-3 text-center transition-colors ${
              !isRegister
                ? 'text-[#FF5500] border-b-2 border-[#FF5500] bg-[#FFF1EB]/30 dark:bg-[#FF5500]/10'
                : 'text-[#5F6670] dark:text-[#9BA4B2] hover:text-[#1C1F23]'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-[#5F6670] dark:text-[#9BA4B2] mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8E96A2] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  required={isRegister}
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-[#E6DFD7] dark:border-[#2E3A4B] bg-white dark:bg-[#1D2430] text-xs font-medium text-[#1C1F23] dark:text-[#F5F7FA] outline-none focus:border-[#FF5500]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#5F6670] dark:text-[#9BA4B2] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8E96A2] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="applicant@example.com"
                required
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-[#E6DFD7] dark:border-[#2E3A4B] bg-white dark:bg-[#1D2430] text-xs font-medium text-[#1C1F23] dark:text-[#F5F7FA] outline-none focus:border-[#FF5500]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5F6670] dark:text-[#9BA4B2] mb-1">
              Password {isRegister && <span className="text-gray-400 font-normal">(min 6 characters)</span>}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8E96A2] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-[#E6DFD7] dark:border-[#2E3A4B] bg-white dark:bg-[#1D2430] text-xs font-medium text-[#1C1F23] dark:text-[#F5F7FA] outline-none focus:border-[#FF5500]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-xl bg-[#FF5500] hover:bg-[#E84D00] disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all mt-2"
          >
            {isSubmitting ? (
              'Processing...'
            ) : isRegister ? (
              <>
                Create Account & Continue <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                Sign In to Account <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-[#5F6670] dark:text-[#9BA4B2]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#12B76A]" />
            <span>Secure authentication • MongoDB Atlas verified session</span>
          </div>
        </form>
      </div>
    </div>
  );
}
