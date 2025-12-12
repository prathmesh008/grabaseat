'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CalendarIcon, ClockIcon, SewingPinIcon } from '@radix-ui/react-icons'
import config from '@/app/config'

const Event = ({ searchQuery = '' }) => {

  const [eventData, setEventData] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    setLoading(true)
    const fetchEvents = async () => {
      try {
        console.log("Fetching events from:", `${config.API_URL}/events`);
        const response = await axios.get(`${config.API_URL}/events`)
        console.log("Events fetched:", response.data?.length);
        setEventData(response.data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching events:", error)
        if (error.response) console.error("Response data:", error.response.data);
        setMessage(error.response?.data?.message || 'Failed to load events')
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const bufferToBase64 = (buffer) => {
    if (!buffer) return '';
    try {
      // Handle MongoDB Buffer object format { type: 'Buffer', data: [...] }
      if (buffer.type === 'Buffer' && Array.isArray(buffer.data)) {
        buffer = buffer.data;
      }

      // Handle raw array
      if (Array.isArray(buffer)) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
      }
    } catch (e) {
      console.error("Error converting buffer to base64:", e);
      return '';
    }
    return '';
  };

  const filteredEvents = eventData.filter(data =>
    !searchQuery ||
    (data.title && data.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (data.category && data.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <section className='py-12 px-4 md:px-8 max-w-[1600px] mx-auto min-h-[50vh]'>
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
        <div className="text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-500">
            Upcoming Experience
          </h2>
          <p className="text-zinc-400 mt-2 text-sm md:text-base max-w-lg">
            Explore and book the best events happening around your campus.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-zinc-900/50 rounded-3xl h-[420px] animate-pulse border border-zinc-800 space-y-4 p-4">
              <div className="w-full h-48 bg-zinc-800 rounded-2xl" />
              <div className="space-y-2">
                <div className="h-4 w-3/4 bg-zinc-800 rounded" />
                <div className="h-4 w-1/2 bg-zinc-800 rounded" />
              </div>
              <div className="h-8 w-full bg-zinc-800 rounded-xl mt-auto" />
            </div>
          ))}
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'>
          {filteredEvents.map((data) => {
            const eventDate = new Date(data.date);
            const day = eventDate.getDate();
            const month = eventDate.toLocaleString('default', { month: 'short' });

            const imageSrc = data.poster && data.poster.data
              ? `data:${data.poster.contentType || 'image/jpeg'};base64,${typeof window !== 'undefined' ? bufferToBase64(data.poster.data) : ''}`
              : null;

            return (
              <motion.div
                key={data._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className='group relative flex flex-col bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden hover:border-white/20 hover:shadow-2xl hover:shadow-rose-500/10 hover:-translate-y-1 transition-all duration-500 ease-out'
              >
                {/* Image Container with Overlay */}
                <div className='relative h-56 w-full overflow-hidden bg-zinc-800'>
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={data.title}
                      className='h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-700'
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex'; // show fallback
                      }}
                    />
                  ) : null}

                  {/* Fallback if image fails or is missing */}
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-zinc-800"
                    style={{ display: imageSrc ? 'none' : 'flex' }}
                  >
                    <span className="text-zinc-600 text-sm font-medium">No Poster Available</span>
                  </div>

                  {/* Dark Gradient Overlay */}
                  <div className='absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-90' />

                  {/* Date Badge */}
                  <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2.5 flex flex-col items-center min-w-[60px] shadow-lg z-10">
                    <span className="text-white font-bold text-xl leading-none">{day}</span>
                    <span className="text-zinc-300 text-[10px] uppercase font-bold tracking-widest">{month}</span>
                  </div>

                  {/* Category Tag */}
                  <div className="absolute top-4 right-4 z-10">
                    <span className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-[10px] uppercase tracking-wider font-bold text-white border border-white/10 shadow-lg">
                      {data.category || 'Event'}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className='flex flex-col flex-grow p-6 pt-2 space-y-4'>

                  <div className='space-y-1'>
                    <h3 className="text-xl font-bold text-white line-clamp-1 group-hover:text-rose-500 transition-colors">
                      {data.title}
                    </h3>
                    <div className="flex items-center gap-4 text-zinc-400 text-xs font-medium">
                      <div className="flex items-center gap-1.5">
                        <ClockIcon className="w-3.5 h-3.5 text-rose-500" />
                        <span>{data.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <SewingPinIcon className="w-3.5 h-3.5 text-rose-500" />
                        <span className="truncate max-w-[150px]">{data.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between gap-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Starting from</span>
                      <span className="text-lg font-bold text-white">
                        ₹{data.sections && data.sections.length > 0 ? Math.min(...data.sections.map(s => s.price)) : 0}
                      </span>
                    </div>

                    <Link
                      href={`/user/event/${data._id}`}
                      className='flex-1 max-w-[140px] px-4 py-2.5 rounded-full bg-white text-zinc-950 text-sm font-bold text-center hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5'
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className='w-full min-h-[400px] flex flex-col items-center justify-center text-zinc-500 gap-4 bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-800'>
          <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
            <CalendarIcon className="w-8 h-8 opacity-40" />
          </div>
          <h1 className='text-xl font-medium text-zinc-300'>No Events Found</h1>
          <p className="text-sm">We couldn&apos;t find any events matching your search.</p>
          <button
            onClick={() => window.location.reload()}
            className="text-rose-500 text-xs hover:underline"
          >
            Reload Page
          </button>
        </div>
      )}
    </section>
  );
};

export default Event;