import React, { useState } from 'react';
import { Star } from 'lucide-react';

export function StarRating({ recipeId, ratings, onRate, isDarkMode, size = 'sm', allowGuest = true }) {
  const [hovered, setHovered] = useState(0);
  const current = ratings[recipeId] ?? 0;
  const sz = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={(e) => { e.stopPropagation(); onRate(star); }}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110 active:scale-95"
        >
          <Star
            className={`${sz} transition-colors ${
              star <= (hovered || current)
                ? 'text-amber-400 fill-amber-400'
                : isDarkMode ? 'text-gray-600' : 'text-gray-300'
            }`}
          />
        </button>
      ))}
      {current > 0 && (
        <span className={`text-xs ml-1 font-semibold ${isDarkMode ? 'text-amber-400' : 'text-amber-500'}`}>
          {current}.0
        </span>
      )}
    </div>
  );
}

export function CheckCircle(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
