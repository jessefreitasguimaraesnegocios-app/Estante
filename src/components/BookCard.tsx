import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import type { Book } from '@/data/books';
import { useNavigate } from 'react-router-dom';

interface BookCardProps {
  book: Book;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  index?: number;
}

const genreColors: Record<string, string> = {
  terror: 'from-red-900/20 to-red-950/30',
  suspense: 'from-amber-900/20 to-amber-950/30',
  romance: 'from-pink-900/20 to-pink-950/30',
  ficção: 'from-blue-900/20 to-blue-950/30',
  aventura: 'from-emerald-900/20 to-emerald-950/30',
  fantasia: 'from-purple-900/20 to-purple-950/30',
  religioso: 'from-amber-800/20 to-amber-900/30',
  clássico: 'from-stone-800/20 to-stone-900/30',
  poesia: 'from-violet-900/20 to-violet-950/30',
  autoajuda: 'from-teal-900/20 to-teal-950/30',
};

export default function BookCard({ book, isFavorite, onToggleFavorite, index = 0 }: BookCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group cursor-pointer"
      onClick={() => navigate(`/reader/${book.id}`)}
    >
      <div className="relative glass-card overflow-hidden transition-all duration-300 hover:gold-glow">
        {/* Cover */}
        <div className={`aspect-[3/4] flex items-center justify-center bg-gradient-to-br ${genreColors[book.genre] || 'from-muted to-secondary'} relative`}>
          <span className="text-5xl drop-shadow-lg">{book.cover}</span>
          
          {/* Favorite button */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(book.id); }}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-background/60 backdrop-blur-sm transition-transform hover:scale-110"
          >
            <Heart
              size={14}
              className={isFavorite ? 'fill-primary text-primary' : 'text-muted-foreground'}
              strokeWidth={1.5}
            />
          </button>

          {/* Language badge */}
          <span className="absolute bottom-2 left-2 text-[9px] font-body font-medium bg-background/70 backdrop-blur-sm px-1.5 py-0.5 rounded-sm text-foreground border-ultra-thin border-border">
            {book.language}
          </span>
        </div>

        {/* Info */}
        <div className="p-2.5">
          <h3 className="font-display text-sm font-semibold leading-tight truncate text-foreground">
            {book.title}
          </h3>
          <p className="text-[10px] text-muted-foreground font-body mt-0.5 truncate">
            {book.author}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
