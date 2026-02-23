import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen } from 'lucide-react';
import { SAMPLE_BOOKS, GENRES, BIBLE_LANGUAGES, type Genre } from '@/data/books';
import { useFavorites } from '@/hooks/useBookData';
import BookCard from '@/components/BookCard';
import BottomNav from '@/components/BottomNav';

export default function LibraryPage() {
  const [selectedGenre, setSelectedGenre] = useState<Genre | 'all' | 'bible'>('all');
  const [search, setSearch] = useState('');
  const { toggleFavorite, isFavorite } = useFavorites();

  const filteredBooks = SAMPLE_BOOKS.filter(book => {
    if (search) {
      const q = search.toLowerCase();
      if (!book.title.toLowerCase().includes(q) && !book.author.toLowerCase().includes(q)) return false;
    }
    if (selectedGenre === 'bible') return book.genre === 'religioso';
    if (selectedGenre !== 'all') return book.genre === selectedGenre;
    return true;
  });

  const bibleBooks = SAMPLE_BOOKS.filter(b => b.genre === 'religioso');

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="px-5 pt-12 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen size={22} className="text-primary" strokeWidth={1.5} />
          <h1 className="font-display text-2xl font-bold text-foreground">Biblioteca</h1>
        </div>
        <p className="text-xs text-muted-foreground font-body">Leitura com voz · {SAMPLE_BOOKS.length} livros</p>
      </header>

      {/* Search */}
      <div className="px-5 py-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar livros..."
            className="w-full bg-secondary text-foreground text-sm pl-9 pr-4 py-2.5 rounded-xl border-ultra-thin border-border font-body placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Genre pills */}
      <div className="px-5 pb-3 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 min-w-max">
          <button
            onClick={() => setSelectedGenre('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-body font-medium border-ultra-thin transition-colors ${selectedGenre === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-secondary-foreground border-border hover:bg-accent'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setSelectedGenre('bible')}
            className={`px-3 py-1.5 rounded-full text-xs font-body font-medium border-ultra-thin transition-colors ${selectedGenre === 'bible' ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-secondary-foreground border-border hover:bg-accent'}`}
          >
            📖 Bíblia
          </button>
          {GENRES.filter(g => g.value !== 'religioso').map(g => (
            <button
              key={g.value}
              onClick={() => setSelectedGenre(g.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-body font-medium border-ultra-thin transition-colors whitespace-nowrap ${selectedGenre === g.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-secondary-foreground border-border hover:bg-accent'}`}
            >
              {g.icon} {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bible section */}
      {selectedGenre === 'bible' && (
        <div className="px-5 mb-4">
          <div className="glass-card p-4 gold-glow">
            <h2 className="font-display text-lg font-semibold text-foreground mb-2">📜 Bíblia Sagrada</h2>
            <p className="font-body text-xs text-muted-foreground mb-3">Disponível em múltiplos idiomas</p>
            <div className="flex flex-wrap gap-2">
              {BIBLE_LANGUAGES.map(lang => {
                const bibleBook = bibleBooks.find(b => b.language.toLowerCase().includes(lang.label.split(' ')[0].toLowerCase()));
                return (
                  <span
                    key={lang.code}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-body border-ultra-thin border-border ${bibleBook ? 'bg-primary/10 text-primary cursor-pointer hover:bg-primary/20' : 'bg-muted text-muted-foreground'}`}
                  >
                    {lang.flag} {lang.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Book grid */}
      <div className="px-5">
        <div className="grid grid-cols-3 gap-3">
          {filteredBooks.map((book, i) => (
            <BookCard
              key={book.id}
              book={book}
              isFavorite={isFavorite(book.id)}
              onToggleFavorite={toggleFavorite}
              index={i}
            />
          ))}
        </div>
        {filteredBooks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground font-body text-sm">Nenhum livro encontrado</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
