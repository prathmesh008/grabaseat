'use client'
import React from 'react';
import { motion } from 'framer-motion';

const AnalyticsCard = ({ title, value, unit = '', icon: Icon, trend, color, delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: delay }}
            className={`
                relative overflow-hidden
                p-6 rounded-3xl border border-white/5 
                bg-zinc-900/50 backdrop-blur-xl
                hover:border-white/10 hover:shadow-2xl hover:bg-zinc-900/80 hover:-translate-y-1
                transition-all duration-300 group
            `}
        >
            {/* Background Gradient Blob */}
            <div className={`absolute -right-6 -top-6 w-32 h-32 bg-${color}-500/10 rounded-full blur-3xl group-hover:bg-${color}-500/20 transition-all duration-500`} />

            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl bg-${color}-500/10 text-${color}-500 border border-${color}-500/20`}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${trend > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </div>
                )}
            </div>

            <div className="space-y-1 relative z-10">
                <h3 className="text-zinc-500 text-sm font-medium tracking-wide uppercase">{title}</h3>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
                    <span className="text-zinc-500 text-sm font-medium">{unit}</span>
                </div>
            </div>
        </motion.div>
    );
};

export default AnalyticsCard;
