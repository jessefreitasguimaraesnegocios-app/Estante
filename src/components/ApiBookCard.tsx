import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { ApiBook } from '@/services/bookApi';

const sourceLabels = { openlibrary: 'Open Library', google: 'Google Books', gutendex: 'Gutenberg' };
const sourceColors = { openlibrary: 'bg-blue-500/10 text-blue-700', google: 'bg-red-500/10 text-red-700', gutendex: 'bg-emerald-500/10 text-emerald-700' };

interface ApiBookCardProps {
  book: ApiBook;
  index?: number;
  /** Show synopsis/description below author (e.g. for Top 100 lists) */
  showSynopsis?: boolean;
}

export default function ApiBookCard({ book, index = 0, showSynopsis = false }: ApiBookCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="group cursor-pointer"
      onClick={() => navigate(`/api-reader/${encodeURIComponent(book.id)}`, { state: { book } })}
    >
      <div className="relative glass-card overflow-hidden transition-all duration-300 hover:gold-glow">
        {/* Cover */}
        <div className="aspect-[3/4] bg-muted relative overflow-hidden">
          {book.cover ? (
            <img
              src={book.cover}
              alt={book.title}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
              <span className="text-3xl">📕</span>
            </div>
          )}

          {/* Source badge */}
          <span className={`absolute top-1.5 left-1.5 text-[8px] font-body font-semibold px-1.5 py-0.5 rounded-sm ${sourceColors[book.source]}`}>
            {sourceLabels[book.source]}
          </span>

          {/* Language badge */}
          <span className="absolute bottom-1.5 left-1.5 text-[8px] font-body font-medium bg-background/70 backdrop-blur-sm px-1.5 py-0.5 rounded-sm text-foreground border-ultra-thin border-border">
            {book.language}
          </span>
        </div>

        {/* Info */}
        <div className="p-2.5">
          <h3 className="font-display text-[11px] font-semibold leading-tight line-clamp-2 text-foreground">
            {book.title}
          </h3>
          <p className="text-[9px] text-muted-foreground font-body mt-0.5 truncate">
            {book.author}
          </p>
          {book.publishYear && (
            <p className="text-[8px] text-muted-foreground font-body mt-0.5">{book.publishYear}</p>
          )}
          {showSynopsis && book.description && (
            <p className="font-body text-[10px] text-muted-foreground mt-1.5 line-clamp-3 leading-snug">
              {book.description}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
