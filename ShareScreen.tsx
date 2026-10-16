import React, { useState } from 'react';
import { Share2, Copy, Check, Sparkles, Send, Flame } from 'lucide-react';
import { PetState, PetMood } from '../types';
import { triggerHaptic } from '../services/storage';

interface ShareScreenProps {
  petState: PetState;
  petMood: PetMood;
}

export const ShareScreen: React.FC<ShareScreenProps> = ({
  petState,
  petMood,
}) => {
  const [copied, setCopied] = useState(false);

  // Exact prompt text required:
  // "Я на 5-м уровне, а моя кошечка Мурка счастлива! Попробуй и ты"
  const shareText = `Я на ${petState.level}-м уровне, а моя кошечка ${petState.name} счастлива! Попробуй и ты 🐾✨`;

  const handleShare = () => {
    triggerHaptic('success');

    // 1. If inside Telegram WebApp, try opening Telegram Share dialog
    const tg = window.Telegram?.WebApp;
    const shareUrl = window.location.href;
    const telegramShareLink = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;

    if (tg?.openTelegramLink) {
      try {
        tg.openTelegramLink(telegramShareLink);
        return;
      } catch (e) {
        console.warn('Failed openTelegramLink:', e);
      }
    }

    // 2. Try Web Share API (native mobile share sheet)
    if (navigator.share) {
      navigator
        .share({
          title: 'Мой прогресс в Мурке',
          text: shareText,
          url: shareUrl,
        })
        .catch(() => {
          // User cancelled or unsupported
        });
      return;
    }

    // 3. Fallback: Copy to clipboard
    handleCopy();
  };

  const handleCopy = () => {
    triggerHaptic('light');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Title */}
      <div className="px-1">
        <h1 className="text-lg font-bold text-[#FDFBF7]">Поделиться с друзьями</h1>
        <p className="text-xs text-[#C5B3A3]">
          Покажи свой уровень и вдохнови друзей на полезные привычки
        </p>
      </div>

      {/* Shareable Card Visual Preview */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#4A352A] to-[#2E1F18] border-2 border-[#F4E4A6]/60 p-6 text-center shadow-xl space-y-4">
        {/* Soft background sparkles */}
        <div className="absolute top-2 right-3 text-lg opacity-40">✨</div>
        <div className="absolute bottom-3 left-3 text-lg opacity-40">🐾</div>

        {/* Pet Avatar badge */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-[#3E2C23] border-2 border-[#F4E4A6] flex items-center justify-center text-4xl shadow-md">
          {petMood === 'happy' ? '😸' : '😺'}
        </div>

        <div>
          <span className="text-xs uppercase tracking-widest text-[#F4E4A6] font-bold block mb-1">
            Трекер привычек · Мурка
          </span>
          <p className="text-base font-extrabold text-[#FDFBF7] leading-snug px-2">
            «{shareText}»
          </p>
        </div>

        {/* Stats Strip */}
        <div className="flex items-center justify-center gap-3 pt-2 text-xs">
          <div className="bg-[#3E2C23]/90 px-3 py-1.5 rounded-full border border-[#5E4436] text-[#F4E4A6] font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Уровень {petState.level}</span>
          </div>

          <div className="bg-[#3E2C23]/90 px-3 py-1.5 rounded-full border border-[#5E4436] text-[#FDFBF7] font-bold flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-[#F4A261] fill-[#F4A261]" />
            <span>Стрик {petState.streak} дн</span>
          </div>
        </div>
      </div>

      {/* Primary Action Button (Prompt requirement) */}
      <div className="space-y-3 pt-2">
        <button
          onClick={handleShare}
          className="w-full py-4 px-6 rounded-2xl bg-[#F4E4A6] hover:bg-[#EBD998] text-[#3E2C23] font-extrabold text-sm shadow-lg flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] min-h-[48px]"
        >
          <Send className="w-4 h-4" />
          <span>Поделиться прогрессом</span>
        </button>

        <button
          onClick={handleCopy}
          className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-stone-50 text-[#3E2C23] font-semibold text-xs border border-[#EDE4D8] shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] min-h-[44px]"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
              <span className="text-emerald-700 font-bold">
                Текст скопирован в буфер!
              </span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-stone-500" />
              <span>Скопировать текст сообщения</span>
            </>
          )}
        </button>
      </div>

      {/* Helper text */}
      <div className="bg-[#4B362B]/80 border border-[#5F4537] rounded-3xl p-4 text-xs text-[#E6D5C7]/80 text-center">
        💬 Отправь сообщение в личные сообщения или в Telegram-канал, чтобы соревноваться по привычкам с друзьями!
      </div>
    </div>
  );
};
