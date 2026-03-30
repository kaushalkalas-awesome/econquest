/** Small UI helpers */
import React from 'react';

export function xpNeededForLevel(level) {
  return Math.max(1, level) * 100;
}

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

export function timeUntilMidnight() {
  const now = new Date();
  const end = new Date(now);
  end.setHours(24, 0, 0, 0);
  const ms = end - now;
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}

export function relativeTime(iso) {
  if (!iso) return '';
  const t = new Date(iso).getTime();
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} hours ago`;
  return `${Math.floor(s / 86400)} days ago`;
}

/** Very simple markdown-ish: **bold** and newlines to paragraphs */
export function renderLessonContent(text) {
  if (!text) return null;
  const parts = String(text).split(/\n\n+/);
  return parts.map((para, i) => {
    const chunks = para.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={i} className="mb-4 text-slate-200 leading-relaxed">
        {chunks.map((c, j) => {
          if (c.startsWith('**') && c.endsWith('**')) {
            return (
              <strong key={j} className="text-blue-300">
                {c.slice(2, -2)}
              </strong>
            );
          }
          return <span key={j}>{c}</span>;
        })}
      </p>
    );
  });
}
