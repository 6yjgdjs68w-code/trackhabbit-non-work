import React, { useState } from 'react';
import { PetMood } from '../types';
import { triggerHaptic } from '../services/storage';
import { sound } from '../services/sound';

interface CatVisualProps {
  mood: PetMood;
  level: number;
  name: string;
  onPet?: () => void;
  interactive?: boolean;
}

interface FloatingHeart {
  id: number;
  x: number;
  y: number;
}

export const CatVisual: React.FC<CatVisualProps> = ({
  mood,
  level,
  name,
  onPet,
  interactive = true,
}) => {
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);
  const [isBouncing, setIsBouncing] = useState(false);

  const handleTap = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!interactive) return;

    triggerHaptic('medium');
    sound.playPurrSound();

    // Trigger bounce
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 600);

    // Spawn floating heart
    let clientX = 0;
    let clientY = 0;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const newHeart: FloatingHeart = {
      id: Date.now() + Math.random(),
      x: (clientX % 80) - 40,
      y: (clientY % 40) - 20,
    };

    setHearts((prev) => [...prev.slice(-6), newHeart]);

    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 1200);

    onPet?.();
  };

  // Determine stage title
  const getStageTitle = (lvl: number) => {
    if (lvl <= 2) return 'Маленький котёнок';
    if (lvl <= 4) return 'Любопытный котик';
    if (lvl <= 6) return 'Пушистая красавица';
    return 'Королевская мурлыка 👑';
  };

  return (
    <div
      onClick={handleTap}
      onTouchStart={handleTap}
      className={`relative flex flex-col items-center justify-center select-none ${
        interactive ? 'cursor-pointer active:scale-95 transition-transform' : ''
      }`}
    >
      {/* Floating Hearts Container */}
      <div className="absolute inset-0 pointer-events-none overflow-visible flex items-center justify-center z-30">
        {hearts.map((h) => (
          <div
            key={h.id}
            className="absolute text-2xl animate-float-heart"
            style={{
              transform: `translate(${h.x}px, ${h.y}px)`,
            }}
          >
            💖
          </div>
        ))}
      </div>

      {/* Cat SVG Illustration */}
      <div
        className={`relative w-48 h-48 sm:w-56 sm:h-56 transition-all duration-300 ${
          isBouncing
            ? 'scale-105'
            : mood === 'happy'
            ? 'animate-soft-bounce'
            : mood === 'sad'
            ? 'opacity-85 translate-y-1'
            : ''
        }`}
      >
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Ground soft shadow */}
          <ellipse
            cx="100"
            cy="185"
            rx="64"
            ry="11"
            fill="rgba(0, 0, 0, 0.24)"
          />

          {/* Animated Tail */}
          <path
            d={
              mood === 'happy'
                ? 'M145 155 C 175 145, 185 105, 168 85 C 160 75, 148 85, 153 98 C 158 115, 145 138, 130 150'
                : mood === 'sad'
                ? 'M145 160 C 160 165, 168 175, 145 178 C 130 180, 120 170, 130 162'
                : 'M145 155 C 170 150, 180 120, 165 105 C 158 98, 150 105, 154 116 C 158 130, 148 145, 135 152'
            }
            stroke="#F5EFE6"
            strokeWidth="14"
            strokeLinecap="round"
            className={mood === 'happy' ? 'transition-all duration-500' : ''}
          />
          {/* Tail tip patch */}
          <path
            d={
              mood === 'happy'
                ? 'M168 85 C 160 75, 148 85, 153 98'
                : 'M165 105 C 158 98, 150 105, 154 116'
            }
            stroke="#D4A373"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Body */}
          <ellipse
            cx="100"
            cy="142"
            rx="46"
            ry="40"
            fill="#FDFCFA"
          />
          {/* Soft tummy shadow/highlight */}
          <ellipse
            cx="100"
            cy="147"
            rx="32"
            ry="28"
            fill="#F4EADB"
          />

          {/* Paws */}
          <ellipse cx="80" cy="176" rx="13" ry="8" fill="#FDFCFA" />
          <ellipse cx="120" cy="176" rx="13" ry="8" fill="#FDFCFA" />
          {/* Tiny paw toe marks */}
          <circle cx="76" cy="177" r="1.5" fill="#D4A373" />
          <circle cx="80" cy="178" r="1.5" fill="#D4A373" />
          <circle cx="84" cy="177" r="1.5" fill="#D4A373" />
          <circle cx="116" cy="177" r="1.5" fill="#D4A373" />
          <circle cx="120" cy="178" r="1.5" fill="#D4A373" />
          <circle cx="124" cy="177" r="1.5" fill="#D4A373" />

          {/* Ears */}
          <g className={mood !== 'sad' ? 'animate-ear-twitch' : ''}>
            {/* Left Ear */}
            <path
              d={
                mood === 'sad'
                  ? 'M62 76 L 42 72 L 68 52 Z'
                  : 'M62 76 L 46 44 L 78 54 Z'
              }
              fill="#D4A373"
            />
            {/* Left Ear Inner */}
            <path
              d={
                mood === 'sad'
                  ? 'M60 73 L 47 70 L 66 57 Z'
                  : 'M63 71 L 52 50 L 73 57 Z'
              }
              fill="#FFCCD5"
            />

            {/* Right Ear */}
            <path
              d={
                mood === 'sad'
                  ? 'M138 76 L 158 72 L 132 52 Z'
                  : 'M138 76 L 154 44 L 122 54 Z'
              }
              fill="#D4A373"
            />
            {/* Right Ear Inner */}
            <path
              d={
                mood === 'sad'
                  ? 'M140 73 L 153 70 L 134 57 Z'
                  : 'M137 71 L 148 50 L 127 57 Z'
              }
              fill="#FFCCD5"
            />
          </g>

          {/* Head */}
          <ellipse
            cx="100"
            cy="92"
            rx="46"
            ry="40"
            fill="#FDFCFA"
          />

          {/* Fur pattern on forehead (Warm ginger spots) */}
          <path
            d="M92 56 C 96 66, 104 66, 108 56 C 103 54, 97 54, 92 56 Z"
            fill="#D4A373"
          />
          <path
            d="M72 65 C 75 75, 82 72, 80 62 Z"
            fill="#D4A373"
          />
          <path
            d="M128 65 C 125 75, 118 72, 120 62 Z"
            fill="#D4A373"
          />

          {/* Crown for Level >= 5 */}
          {level >= 5 && (
            <g transform="translate(100, 48) scale(0.9)">
              <path
                d="M -16 6 L -20 -10 L -9 -2 L 0 -14 L 9 -2 L 20 -10 L 16 6 Z"
                fill="#F4E4A6"
                stroke="#C59E3F"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <circle cx="-20" cy="-10" r="2.5" fill="#E76F51" />
              <circle cx="0" cy="-14" r="3" fill="#E76F51" />
              <circle cx="20" cy="-10" r="2.5" fill="#E76F51" />
            </g>
          )}

          {/* Collar & Bell */}
          <path
            d="M78 123 Q 100 134 122 123"
            stroke="#9E2A2B"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Bell */}
          <circle cx="100" cy="132" r="5" fill="#F4E4A6" stroke="#9E2A2B" strokeWidth="1" />
          <circle cx="100" cy="133.5" r="1.2" fill="#541B1C" />

          {/* Eyes */}
          {mood === 'happy' ? (
            // Joyful curved anime closed eyes
            <g stroke="#3E2C23" strokeWidth="3" strokeLinecap="round">
              <path d="M74 91 Q 84 82 90 91" />
              <path d="M110 91 Q 116 82 126 91" />
            </g>
          ) : mood === 'content' ? (
            // Peaceful curved eyes
            <g stroke="#3E2C23" strokeWidth="2.5" strokeLinecap="round">
              <path d="M75 92 Q 83 87 91 92" />
              <path d="M109 92 Q 117 87 125 92" />
            </g>
          ) : (
            // Sad, watery round eyes
            <g>
              <ellipse cx="82" cy="92" rx="7" ry="8" fill="#3E2C23" />
              <ellipse cx="118" cy="92" rx="7" ry="8" fill="#3E2C23" />
              {/* Highlights */}
              <circle cx="80" cy="89" r="2.8" fill="#FFFFFF" />
              <circle cx="84" cy="94" r="1.4" fill="#FFFFFF" />
              <circle cx="116" cy="89" r="2.8" fill="#FFFFFF" />
              <circle cx="120" cy="94" r="1.4" fill="#FFFFFF" />
              {/* Teardrop */}
              <path
                d="M125 99 C 127 101, 127 104, 125 106 C 123 107, 121 106, 121 104 C 121 102, 123 100, 125 99 Z"
                fill="#70C1B3"
              />
            </g>
          )}

          {/* Blushing cheeks for happy or content */}
          {mood !== 'sad' && (
            <g fill="#FFB4A2" opacity="0.6">
              <ellipse cx="71" cy="98" rx="6.5" ry="4" />
              <ellipse cx="129" cy="98" rx="6.5" ry="4" />
            </g>
          )}

          {/* Cute Nose */}
          <polygon
            points="97,98 103,98 100,102"
            fill="#E07A5F"
          />

          {/* Mouth */}
          {mood === 'happy' ? (
            // Happy open kitty smile :3
            <path
              d="M93 103 Q 97 107 100 104 Q 103 107 107 103"
              stroke="#3E2C23"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
          ) : mood === 'content' ? (
            <path
              d="M94 103 Q 97 106 100 103.5 Q 103 106 106 103"
              stroke="#3E2C23"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          ) : (
            // Sad downturned mouth
            <path
              d="M95 106 Q 100 102 105 106"
              stroke="#3E2C23"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          )}

          {/* Whiskers */}
          <g stroke="#C4B5A5" strokeWidth="1.8" strokeLinecap="round">
            {/* Left Whiskers */}
            <line x1="68" y1="99" x2="48" y2="96" />
            <line x1="67" y1="104" x2="46" y2="105" />
            <line x1="68" y1="108" x2="50" y2="114" />
            {/* Right Whiskers */}
            <line x1="132" y1="99" x2="152" y2="96" />
            <line x1="133" y1="104" x2="154" y2="105" />
            <line x1="132" y1="108" x2="150" y2="114" />
          </g>
        </svg>
      </div>

      {/* Cat Badge / Stage subtitle */}
      <div className="mt-2 flex flex-col items-center">
        <span className="text-base font-bold text-[#F4E4A6] tracking-wide flex items-center gap-1.5">
          {name}
        </span>
        <span className="text-xs text-[#E6D5C7]/80 font-medium">
          {getStageTitle(level)}
        </span>
      </div>
    </div>
  );
};
