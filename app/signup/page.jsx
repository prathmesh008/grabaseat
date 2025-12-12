'use client'
import React, { useMemo, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    EnvelopeClosedIcon,
    LockClosedIcon,
    PersonIcon,
    MobileIcon,
    IdCardIcon,
    ReloadIcon,
    EyeOpenIcon,
    EyeNoneIcon
} from '@radix-ui/react-icons';
import { toast } from 'sonner';
import AuthService from "@/services/authService";

const SignupContent = () => {
    const router = useRouter();
    const authService = useMemo(() => new AuthService(), []);

    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        password: "",
        roles: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGoogleSignup = () => {
        setIsGoogleLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsGoogleLoading(false);
            toast.info("Google Signup is currently in demo mode.", {
                description: "Please use the form to create an account for now."
            });
        }, 1500);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Basic client-side validation
            if (!formData.name || !formData.email || !formData.password || !formData.phoneNumber) {
                throw new Error("Please fill in all required fields.");
            }

            const data = await authService.signup(formData);
            const { message, statusCode } = data;

            if (statusCode === 200) {
                toast.success("Account Created!", { description: "You have successfully signed up." });
                setTimeout(() => router.push('/'), 1000); // Redirect to login
            } else {
                toast.error("Signup Failed", { description: message || "An error occurred." });
                setIsLoading(false);
            }
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || error.message || "Signup Failed";
            toast.error("Signup Failed", { description: msg });
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-zinc-950 flex items-center justify-center relative overflow-hidden selection:bg-indigo-500/30 py-10">
            {/* Background Ambience */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-[130px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[130px] animate-pulse" style={{ animationDelay: '3s' }} />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 w-full max-w-lg p-6"
            >
                <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/50">

                    {/* Header */}
                    <div className="text-center mb-8 space-y-2">
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-3xl font-bold tracking-tight text-white"
                        >
                            Create Account
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-zinc-400 text-sm"
                        >
                            Join GrabASeat and start exploring events.
                        </motion.p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Name Input */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-300 ml-1">Full Name</label>
                            <div className="relative group">
                                <input
                                    name="name"
                                    type="text"
                                    placeholder="John Doe"
                                    onChange={handleChange}
                                    className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-10 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 group-hover:border-white/20"
                                />
                                <PersonIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-hover:text-zinc-400 transition-colors" />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-300 ml-1">Email Address</label>
                            <div className="relative group">
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    onChange={handleChange}
                                    className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-10 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 group-hover:border-white/20"
                                />
                                <EnvelopeClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-hover:text-zinc-400 transition-colors" />
                            </div>
                        </div>

                        {/* Phone Input */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-300 ml-1">Phone Number</label>
                            <div className="relative group">
                                <input
                                    name="phoneNumber"
                                    type="number"
                                    placeholder="9876543210"
                                    onChange={handleChange}
                                    className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-10 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 group-hover:border-white/20 appearance-none"
                                />
                                <MobileIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-hover:text-zinc-400 transition-colors" />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-300 ml-1">Password</label>
                            <div className="relative group">
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    onChange={handleChange}
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
                        </div>

                        {/* Roles Input (Optional/Advanced) */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-300 ml-1">Role (Optional)</label>
                            <div className="relative group">
                                <input
                                    name="roles"
                                    type="text"
                                    placeholder="Leave empty for User"
                                    onChange={handleChange}
                                    className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-10 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 group-hover:border-white/20"
                                />
                                <IdCardIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-hover:text-zinc-400 transition-colors" />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-xl text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all duration-300 flex items-center justify-center gap-2 mt-6"
                        >
                            {isLoading ? (
                                <>
                                    <ReloadIcon className="w-4 h-4 animate-spin" />
                                    <span>Creating Account...</span>
                                </>
                            ) : (
                                "Create Account"
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
                            onClick={handleGoogleSignup}
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
                            Already have an account?{' '}
                            <Link href="/" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const Signup = () => {
    return (
        <Suspense fallback={<div></div>}>
            <SignupContent />
        </Suspense>
    );
};

export default Signup;