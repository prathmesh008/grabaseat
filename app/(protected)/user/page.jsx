'use client'
import React from 'react';
import Header from '@/app/(protected)/_components/header'
import Event from '@/app/(protected)/_components/events'

const HomePage = () => {

  const NavItems = [
    { label: 'Home', url: '/user' },
    { label: 'Club', url: '/user/club' },
    { label: 'Events', url: '/user/events' },
    { label: 'About Us', url: '/user/about' },
    { label: 'My Bookings', url: '/user/bookings' }
  ]

  const [searchQuery, setSearchQuery] = React.useState('');

  return (
    <div className='min-h-screen bg-zinc-950 text-white selection:bg-rose-500/30'>
      <Header NavigationItems={NavItems} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="pt-16">
        {/* Cinematic Hero Section */}
        <section className="relative h-[60vh] min-h-[500px] w-full flex items-center justify-center overflow-hidden">
          {/* Background with Gradient Overlay */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black z-10"></div>
            {/* Animated Gradient Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            {/* Pattern Grid */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-10 mix-blend-overlay"></div>
          </div>

          <div className="relative z-20 text-center px-4 max-w-4xl mx-auto space-y-6">
            <div className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-xs font-medium tracking-wider text-rose-400 mb-4 animate-fade-in">
              OFFICIAL BOOKING PARTNER
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 pb-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Live the Moment.
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto font-light animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Discover and book tickets for the biggest concerts, workshops, and college events happening near you.
            </p>

            {/* Hero Search */}
            <div className="mt-8 relative max-w-lg mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <input
                type="text"
                placeholder="Search for events, artists, or venues..."
                className="w-full h-14 pl-12 pr-4 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all shadow-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-zinc-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
          </div>
        </section>

        {/* Categories/Events Section */}
        <Event searchQuery={searchQuery} />
      </main>
    </div>
  );
};

export default HomePage;