'use client';

// ═══════════════════════════════════════════════════════════════
//  NextEventPrediction — AI შემდეგი მოვლენის პროგნოზი
//  მაგ: "78% შანსი რომ ბარსელონა გაიტანს გოლს მომდევნო 15 წუთში"
//  მოიცავს 3D კარის ანიმაციას (SVG + Framer Motion)
// ═══════════════════════════════════════════════════════════════

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface NextEventPredictionProps {
  probability: number;
  teamName: string;
  timeframeMinutes?: number;
  eventType?: 'goal' | 'corner' | 'card';
}

function Goal3DAnimation({ probability }: { probability: number }) {
  const isHigh = probability >= 60;

  return (
    <div className="relative w-full h-full flex items-center justify-center perspective-[600px]">
      <svg
        viewBox="0 0 200 140"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="goalLine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D9F99D" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.9" />
          </linearGradient>
          <filter id="goalGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g filter="url(#goalGlow)" opacity="0.85">
          <path
            d="M 60 110 L 60 50 L 140 50 L 140 110"
            stroke="#14B8A6"
            strokeWidth="1.5"
            fill="none"
            opacity="0.4"
          />
          <path
            d="M 50 120 L 50 40 L 150 40 L 150 120"
            stroke="url(#goalLine)"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />

          {[...Array(7)].map((_, i) => (
            <line
              key={`v-${i}`}
              x1={50 + i * 16.6}
              y1="40"
              x2={50 + i * 16.6}
              y2="120"
              stroke="#14B8A6"
              strokeWidth="0.5"
              opacity="0.25"
            />
          ))}

          {[...Array(6)].map((_, i) => (
            <line
              key={`h-${i}`}
              x1="50"
              y1={40 + i * 16}
              x2="150"
              y2={40 + i * 16}
              stroke="#14B8A6"
              strokeWidth="0.5"
              opacity="0.25"
            />
          ))}

          {[...Array(4)].map((_, i) => (
            <line
              key={`d-${i}`}
              x1={50 + i * 5}
              y1="40"
              x2={70 + i * 5}
              y2="110"
              stroke="#14B8A6"
              strokeWidth="0.3"
              opacity="0.15"
            />
          ))}
        </g>
      </svg>

      <motion.div
        className="absolute"
        style={{
          width: 32,
          height: 32,
          filter: 'drop-shadow(0 0 12px rgba(217, 249, 157, 0.8))',
        }}
        initial={{ x: -80, y: 30, scale: 1, rotate: 0, opacity: 0 }}
        animate={
          isHigh
            ? {
                x: [-80, -20, 20, 0],
                y: [30, -10, 20, 40],
                scale: [1, 0.85, 0.7, 0.5],
                rotate: [0, 180, 360, 540],
                opacity: [0, 1, 1, 0.9],
              }
            : {
                x: [-80, -30, 20, 80],
                y: [30, -10, -30, -50],
                scale: [1, 0.85, 0.7, 0.6],
                rotate: [0, 180, 360, 540],
                opacity: [0, 1, 1, 0],
              }
        }
        transition={{
          duration: 2.8,
          ease: 'easeOut',
          repeat: Infinity,
          repeatDelay: 1.5,
        }}
      >
        <svg viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="14" fill="#F8FAFC" />
          <circle cx="16" cy="16" r="14" stroke="#0A0F1C" strokeWidth="1.5" />
          <polygon
            points="16,4 22,10 20,18 12,18 10,10"
            fill="#0A0F1C"
            opacity="0.9"
          />
          <polygon points="16,4 12,8 16,10 20,8" fill="#D9F99D" opacity="0.3" />
        </svg>
      </motion.div>

      {isHigh && (
        <motion.div
          className="absolute"
          style={{ left: '50%', top: '50%' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 1, 0] }}
          transition={{
            duration: 2.8,
            times: [0, 0.7, 0.75, 1],
            repeat: Infinity,
            repeatDelay: 1.5,
          }}
        >
          {[...Array(8)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-lime"
              initial={{ x: 0, y: 0, opacity: 0 }}
              animate={{
                x: Math.cos((i * 45 * Math.PI) / 180) * 40,
                y: Math.sin((i * 45 * Math.PI) / 180) * 40,
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 0.8,
                delay: 2.0,
                repeat: Infinity,
                repeatDelay: 3.5,
              }}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}

export function NextEventPrediction({
  probability,
  teamName,
  timeframeMinutes = 15,
  eventType = 'goal',
}: NextEventPredictionProps) {
  const eventLabel = {
    goal: 'გოლი',
    corner: 'კუთხური',
    card: 'ბარათი',
  }[eventType];

  return (
    <div className="w-full bg-surface/60 backdrop-blur-xl border border-edge rounded-2xl p-5 lg:p-6 overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={16} className="text-teal" />
        <span className="text-[10px] lg:text-xs font-semibold text-muted uppercase tracking-widest">
          AI Next Event Prediction
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-mono text-4xl lg:text-5xl font-bold text-lime leading-none"
          >
            {probability}%
          </motion.div>

          <div className="space-y-1">
            <span className="text-xs lg:text-sm text-muted uppercase tracking-wider">
              Chance of
            </span>
            <h3 className="font-heading text-lg lg:text-xl font-bold text-text leading-tight">
              {teamName} {eventLabel}
            </h3>
            <p className="text-xs lg:text-sm text-muted">
              in next {timeframeMinutes} minutes
            </p>
          </div>

          <div className="pt-2">
            <div className="h-1 bg-edge rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-lime to-teal rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${probability}%` }}
                transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

        <div className="relative h-32 lg:h-40">
          <Goal3DAnimation probability={probability} />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-edge/50 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
        <span className="text-[10px] text-muted">Updated in real-time</span>
      </div>
    </div>
  );
}

export default NextEventPrediction;
