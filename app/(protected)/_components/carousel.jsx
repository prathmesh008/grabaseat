'use client'
import React, { useEffect, useState, useRef } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel"
import Link from 'next/link';
import Image from 'next/image';
import Autoplay from "embla-carousel-autoplay"
import { ArrowRightIcon, CalendarIcon, ClockIcon } from '@radix-ui/react-icons';
import axios from 'axios'
import config from '@/app/config'

const Banner = () => {
  const [banner, setBanner] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)
  const [api, setApi] = useState()
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    setLoading(true)
    const fetchBanner = async () => {
      try {
        await axios
          .get(`${config.API_URL}/events/banners`)
          .then((response) => {
            setBanner(response.data)
            setLoading(false)
          })
          .catch(error => {
            console.error(error)
            setMessage(error.response?.data?.message || "Failed to load banners")
            setLoading(false)
          })
      }
      catch (error) {
        console.error(error)
        setLoading(false)
      }
    }

    fetchBanner()
  }, [])

  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  )

  useEffect(() => {
    if (!api) return
    setCurrent(api.selectedScrollSnap())
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  if (loading) {
    return (
      <div className="hidden lg:flex w-full h-[500px] items-center justify-center bg-zinc-950/50 rounded-3xl border border-zinc-800 animate-pulse m-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-500 font-medium">Loading featured events...</p>
        </div>
      </div>
    )
  }

  if (!loading && (banner.length === 0 || message)) {
    return null; // Don't show empty banner section
  }

  return (
    <div className='hidden lg:block relative group p-4' >
      <Carousel
        setApi={setApi}
        plugins={[plugin.current]}
        opts={{ align: "start", loop: true }}
        className="w-full"
      >
        <CarouselContent>
          {banner.map((data, index) => (
            <CarouselItem key={index} className='relative'>
              <div className="w-full h-[500px] relative rounded-3xl overflow-hidden shadow-2xl shadow-rose-900/10">
                {/* Background Image */}
                {data.banner ? (
                  <Image
                    width={1200}
                    height={600}
                    src={`data:${data.banner.contentType};base64,${Buffer.from(data.banner.data).toString('base64')}`}
                    alt={data.title}
                    className='object-cover w-full h-full transform transition-transform duration-1000 hover:scale-105'
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-600">
                    No Banner Image
                  </div>
                )}

                {/* Gradient Overlay */}
                <div className='absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent' />
                <div className='absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-transparent to-transparent' />

                {/* Content */}
                <div className='absolute bottom-0 left-0 p-12 w-full max-w-3xl z-20'>
                  <div className='flex items-center gap-3 mb-4'>
                    <span className='px-3 py-1 bg-rose-500 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg shadow-rose-500/20'>
                      Featured
                    </span>
                    <span className='px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 text-white text-xs font-semibold rounded-full uppercase tracking-wider'>
                      {data.category}
                    </span>
                  </div>

                  <h1 className='text-5xl font-bold text-white mb-4 leading-tight drop-shadow-lg'>
                    {data.title}
                  </h1>

                  <div className='flex items-center gap-6 text-zinc-300 text-sm font-medium mb-8'>
                    <div className='flex items-center gap-2'>
                      <CalendarIcon className="w-4 h-4 text-rose-500" />
                      {new Date(data.date).toLocaleDateString()}
                    </div>
                    <div className='flex items-center gap-2'>
                      <ClockIcon className="w-4 h-4 text-rose-500" />
                      {data.time}
                    </div>
                  </div>

                  <Link
                    href={`/user/event/${data._id}`}
                    className='inline-flex items-center gap-2 px-6 py-3 bg-white text-zinc-950 rounded-full font-bold hover:bg-zinc-200 transition-all hover:gap-4 group/btn'
                  >
                    Book Now
                    <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* Navigation Buttons */}
        <CarouselPrevious className="left-8 bg-black/20 hover:bg-black/40 border-none text-white backdrop-blur-sm" />
        <CarouselNext className="right-8 bg-black/20 hover:bg-black/40 border-none text-white backdrop-blur-sm" />
      </Carousel>

      {/* Floating Metadata Pills (Optional - removed in favor of integrated content for cleaner look) */}
    </div>
  );
};

export default Banner;