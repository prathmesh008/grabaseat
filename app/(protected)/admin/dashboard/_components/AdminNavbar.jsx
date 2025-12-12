'use client'
import React, { useMemo, useState, useEffect } from 'react';
import { Work_Sans } from "next/font/google";
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MagnifyingGlassIcon, BellIcon, GearIcon, PersonIcon, ExitIcon } from '@radix-ui/react-icons';
import AuthService from "@/services/authService";
import { useRouter, usePathname } from 'next/navigation';

const font = Work_Sans({ subsets: ['latin'] })

const AdminNavbar = () => {
    const authService = useMemo(() => new AuthService(), [])
    const router = useRouter()
    const pathname = usePathname()
    // Initialize with null to match server render
    const [currentUser, setCurrentUser] = useState(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const user = authService.getCurrentUser()
        setCurrentUser(user)
    }, [authService])

    const logout = () => {
        authService.logout()
        router.push('/')
    }

    const navLinks = [
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Manage Events', href: '/admin/events' },
        { label: 'Users', href: '/admin/users' },
        { label: 'Reports', href: '/admin/reports' },
    ];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl transition-all ${font.className}`}>
            <div className="container mx-auto px-6 h-full flex items-center justify-between">

                {/* Logo & Brand */}
                <div className="flex items-center gap-8">
                    <Link href="/admin/dashboard" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-indigo-500/20 transition-all">
                            G
                        </div>
                        <span className="text-lg font-bold tracking-tight text-white">
                            GrabASeat <span className="text-zinc-500 text-xs font-medium ml-1 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">ADMIN</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${isActive
                                        ? 'bg-white/10 text-white'
                                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            )
                        })}
                    </div>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-4">
                    {/* Global Search */}
                    <div className="relative hidden lg:block group">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search anything..."
                            className="bg-zinc-900 border border-zinc-800 rounded-full pl-9 pr-4 py-1.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 w-64 transition-all"
                        />
                    </div>

                    <div className="h-6 w-px bg-zinc-800 hidden md:block" />

                    {/* Notifications */}
                    <button className="relative p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full transition-colors">
                        <BellIcon className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-zinc-950"></span>
                    </button>

                    {/* Profile Dropdown */}
                    <div className="relative group">
                        <button className="flex items-center gap-3 pl-2 outline-none">
                            <div className="text-right hidden sm:block leading-tight">
                                <p className="text-xs font-medium text-zinc-400">Admin</p>
                                <p className="text-sm font-semibold text-white truncate max-w-[100px]">
                                    {mounted ? (currentUser?.name || "User") : "User"}
                                </p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-[1px]">
                                <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center">
                                    <span className="font-bold text-xs text-indigo-400">
                                        {mounted ? (currentUser?.name?.[0] || "A") : "A"}
                                    </span>
                                </div>
                            </div>
                        </button>

                        {/* Dropdown Menu */}
                        <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50">
                            <div className="p-1">
                                <Link href="/admin/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg">
                                    <GearIcon className="w-4 h-4" /> Settings
                                </Link>
                                <Link href="/admin/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg">
                                    <PersonIcon className="w-4 h-4" /> Profile
                                </Link>
                                <div className="h-px bg-zinc-800 my-1" />
                                <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg">
                                    <ExitIcon className="w-4 h-4" /> Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default AdminNavbar;
