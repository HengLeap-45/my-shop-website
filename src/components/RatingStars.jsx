import { Star } from 'lucide-react';

export default function RatingStars({
  rating = 0,
  count,
  size = 'sm',
  interactive = false,
  onChange,
}) {
  const numericRating = Math.min(5, Math.max(0, Number(rating) || 0));
  const iconSize = size === 'lg' ? 'h-5 w-5' : size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5';

  if (interactive) {
    return (
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((star) => {
          const active = star <= numericRating;
          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={star === numericRating}
              aria-label={`${star} ${star === 1 ? 'star' : 'stars'}`}
              onClick={() => onChange?.(star)}
              className="rounded p-1 transition-transform hover:scale-110"
            >
              <Star
                className={`${iconSize} ${
                  active ? 'fill-amber-500 text-amber-500' : 'text-slate-300'
                }`}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className="inline-flex items-center gap-1.5"
      aria-label={`Rated ${numericRating.toFixed(1)} out of 5${
        typeof count === 'number' ? ` from ${count} reviews` : ''
      }`}
    >
      <div className="flex items-center gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = numericRating >= star - 0.25;
          return (
            <Star
              key={star}
              className={`${iconSize} ${
                filled ? 'fill-amber-500 text-amber-500' : 'fill-slate-100 text-slate-300'
              }`}
            />
          );
        })}
      </div>
      <span className="text-xs font-semibold text-slate-700">{numericRating.toFixed(1)}</span>
      {typeof count === 'number' && (
        <span className="text-xs text-slate-500">({count})</span>
      )}
    </div>
  );
}
