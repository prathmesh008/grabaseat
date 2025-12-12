'use client'
import React, { useEffect, useMemo, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { EnvelopeClosedIcon, LockClosedIcon, EyeOpenIcon, EyeNoneIcon, ReloadIcon, ArrowLeftIcon } from '@radix-ui/react-icons';
import { toast } from 'sonner';
import AuthService from "@/services/authService";
import useAuthCheck from '@/components/Auth/authCheck';

const LandingPageContent = () => {
  const router = useRouter();
  const authService = useMemo(() => new AuthService(), []);
  const { isAdmin, isUser } = useAuthCheck();

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [view, setView] = useState("login"); // 'login' or 'forgot-password'

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [resetEmail, setResetEmail] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (isAdmin()) router.push('/admin/dashboard');
    if (isUser()) router.push('/user');
  }, [isAdmin, isUser, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.email || !formData.password) {
        throw new Error("Please fill in all fields");
      }

      const response = await authService.login(formData);

      if (response) {
        toast.success("Welcome back!", { description: "Login successful." });
        const currentUser = authService.getCurrentUser().roles[0];

        // Small delay for animation
        setTimeout(() => {
          if (currentUser.includes('ROLE_USER')) {
            router.push("/user");
          } else if (currentUser.includes('ROLE_ADMIN')) {
            router.push('/admin/dashboard');
          }
        }, 500);
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Login Failed";
      toast.error("Login Failed", { description: msg });
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsGoogleLoading(false);
      toast.info("Google Login is currently in demo mode.", {
        description: "Please use the email/password login for now."
      });
    }, 1500);
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    // Simulate Password Reset API
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Reset Link Sent", {
        description: `We've sent a password reset link to ${resetEmail}`
      });
      setView("login");
      setResetEmail("");
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 flex items-center justify-center relative overflow-hidden selection:bg-indigo-500/30">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-rose-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light transition-opacity duration-1000" />
      </div>

      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-6"
      >
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/50">

          <AnimatePresence mode="wait">
            {view === "login" ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Header */}
                <div className="text-center mb-8 space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight text-white">
                    Grab<span className="text-indigo-500">A</span>Seat
                  </h1>
                  <p className="text-zinc-400 text-sm">
                    Welcome back! Please enter your details.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">

                  {/* Email Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300 ml-1">Email</label>
                    <div className="relative group">
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        placeholder="name@example.com"
                        onChange={handleInputChange}
                        className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-10 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 group-hover:border-white/20"
                      />
                      <EnvelopeClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-hover:text-zinc-400 transition-colors" />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300 ml-1">Password</label>
                    <div className="relative group">
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        placeholder="••••••••"
                        onChange={handleInputChange}
                        className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-10 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 group-hover:border-white/20"
                      />
                      <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-hover:text-zinc-400 transition-colors" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        {showPassword ? <EyeOpenIcon className="w-4 h-4" /> : <EyeNoneIcon className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setView("forgot-password")}
                        className="text-[10px] text-zinc-500 hover:text-indigo-400 transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium rounded-xl text-sm shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300 flex items-center justify-center gap-2 mt-4"
                  >
                    {isLoading ? (
                      <>
                        <ReloadIcon className="w-4 h-4 animate-spin" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </motion.button>

                  {/* Divider */}
                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-white/10"></div>
                    <span className="flex-shrink-0 mx-4 text-[10px] uppercase text-zinc-600 tracking-wider font-semibold">Or continue with</span>
                    <div className="flex-grow border-t border-white/10"></div>
                  </div>

                  {/* Google Button */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isGoogleLoading}
                    className="w-full h-11 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all duration-300 group"
                  >
                    {isGoogleLoading ? (
                      <ReloadIcon className="w-4 h-4 animate-spin text-zinc-400" />
                    ) : (
                      <svg className="w-4 h-4 grayscale group-hover:grayscale-0 transition-all duration-300" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                    )}
                    <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">Google</span>
                  </button>

                </form>

                {/* Footer */}
                <div className="mt-8 text-center">
                  <p className="text-xs text-zinc-500">
                    Don't have an account?{' '}
                    <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                      Sign up
                    </Link>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="forgot-password"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Header */}
                <div className="text-center mb-8 space-y-2">
                  <div className="flex justify-start mb-4">
                    <button
                      onClick={() => setView("login")}
                      className="p-2 rounded-full hover:bg-white/5 transition-colors group"
                    >
                      <ArrowLeftIcon className="w-5 h-5 text-zinc-400 group-hover:text-white" />
                    </button>
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-white">
                    Reset Password
                  </h1>
                  <p className="text-zinc-400 text-sm">
                    Enter your email to receive a reset link.
                  </p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300 ml-1">Email</label>
                    <div className="relative group">
                      <input
                        name="email"
                        type="email"
                        value={resetEmail}
                        placeholder="name@example.com"
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-10 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 group-hover:border-white/20"
                      />
                      <EnvelopeClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-hover:text-zinc-400 transition-colors" />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium rounded-xl text-sm shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300 flex items-center justify-center gap-2 mt-4"
                  >
                    {isLoading ? (
                      <>
                        <ReloadIcon className="w-4 h-4 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.div>
    </div>
  );
};

const LandingPage = () => {
  return (
    <Suspense fallback={<div></div>}>
      <LandingPageContent />
    </Suspense>
  )
}

export default LandingPage;