// todo: display user and username accordingly
'use client'
import { usePathname, useRouter } from "next/navigation";
import React, { useMemo } from 'react';
import { Work_Sans } from "next/font/google"; // Use Work Sans for modern look
import AuthService from "@/services/authService"
import Link from "next/link"; // Use next/link for better Navigation

const font = Work_Sans({ subsets: ['latin'] })

const Header = ({ NavigationItems, searchQuery, setSearchQuery }) => {
    const authService = useMemo(() => new AuthService(), [])
    const currentUser = authService.getCurrentUser()
    const router = useRouter()
    const pathname = usePathname()

    const logout = () => {
        authService.logout()
        router.push('/')
    }

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/5 bg-zinc-950/70 backdrop-blur-xl transition-all duration-300 ${font.className}`}>
            <div className="container mx-auto px-6 h-full flex items-center justify-between">

                {/* Logo */}
                <Link href="/user" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-600 to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-rose-500/20 transition-all">
                        G
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-rose-500 group-hover:to-orange-500 transition-all">
                        GrabaSeat
                    </span>
                </Link>

                {/* Navigation - Hidden on mobile, visible on md+ */}
                <nav className="hidden md:flex items-center gap-8">
                    {NavigationItems.map((item, index) => {
                        const isActive = pathname === item.url;
                        return (
                            <Link
                                key={index}
                                href={item.url}
                                className={`text-sm font-medium transition-colors relative py-1 hover:text-white
                                    ${isActive ? 'text-white' : 'text-zinc-400'}
                                `}
                            >
                                {item.label}
                                {isActive && (
                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-rose-500 to-orange-500 rounded-full"></span>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Right Side: Search + Profile */}
                <div className="flex items-center gap-4">
                    {/* Search Bar */}
                    <div className="relative hidden lg:block group">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-zinc-500 group-focus-within:text-rose-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search events..."
                            className="bg-zinc-900/50 border border-zinc-800 text-sm rounded-full pl-10 pr-4 py-2 w-64 text-zinc-200 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all placeholder:text-zinc-600"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="w-px h-6 bg-zinc-800 hidden md:block"></div>

                    {/* Profile Dropdown Trigger */}
                    <div className="flex items-center gap-3 pl-2">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-medium text-zinc-400">Welcome back,</p>
                            <p className="text-sm font-semibold text-white leading-tight truncate max-w-[100px]">{currentUser?.name?.split(' ')[0]}</p>
                        </div>

                        <div className="relative group cursor-pointer">
                            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden hover:border-rose-500 transition-colors">
                                {/* Letter Avatar or User Image */}
                                <span className="font-bold text-zinc-300 group-hover:text-rose-500 transition-colors">
                                    {currentUser?.name?.charAt(0).toUpperCase()}
                                </span>
                            </div>

                            {/* Simple Hover Dropdown */}
                            <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50">
                                <div className="w-48 bg-zinc-950/90 backdrop-blur-xl border border-zinc-800 rounded-xl shadow-2xl overflow-hidden p-1">
                                    <div className="px-3 py-2 border-b border-white/5 mb-1">
                                        <p className="text-xs text-zinc-500">Signed in as</p>
                                        <p className="text-sm font-medium text-white truncate">{currentUser?.email}</p>
                                    </div>
                                    <Link href="/user/profile" className="block px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                        My Profile
                                    </Link>
                                    <Link href="/user/bookings" className="block px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                        My Bookings
                                    </Link>
                                    <div className="h-px bg-white/5 my-1"></div>
                                    <button
                                        onClick={logout}
                                        className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <span>Log out</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;