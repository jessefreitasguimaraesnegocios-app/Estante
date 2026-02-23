import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, Loader2, Globe } from 'lucide-react';
import { SAMPLE_BOOKS, GENRES, BIBLE_LANGUAGES, type Genre } from '@/data/books';
import { searchAllBooks, fetchFeaturedBooks, fetchTopBooksByGenre, type ApiBook } from '@/services/bookApi';
import { useFavorites } from '@/hooks/useBookData';
import BookCard from '@/components/BookCard';
import ApiBookCard from '@/components/ApiBookCard';
import BottomNav from '@/components/BottomNav';
import ThemeToggle from '@/components/ThemeToggle';

export default function LibraryPage() {
  const [selectedGenre, setSelectedGenre] = useState<Genre | 'all' | 'bible' | 'online'>('all');
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { toggleFavorite, isFavorite } = useFavorites();

  const { data: featuredBooks = [], isLoading: loadingFeatured } = useQuery({
    queryKey: ['featured-books'],
    queryFn: fetchFeaturedBooks,
    staleTime: 1000 * 60 * 10,
  });

  const { data: searchResults = [], isLoading: loadingSearch, isFetching } = useQuery({
    queryKey: ['search-books', searchQuery],
    queryFn: () => searchAllBooks(searchQuery),
    enabled: searchQuery.length > 1,
    staleTime: 1000 * 60 * 5,
  });

  const isGenreSelected = selectedGenre !== 'all' && selectedGenre !== 'online' && selectedGenre !== 'bible';
  const { data: topBooksByGenre = [], isLoading: loadingTopByGenre } = useQuery({
    queryKey: ['top-books-by-genre', selectedGenre],
    queryFn: () => fetchTopBooksByGenre(selectedGenre as Genre, 100),
    enabled: isGenreSelected,
    staleTime: 1000 * 60 * 15,
  });

  const genreLabel = isGenreSelected ? GENRES.find(g => g.value === selectedGenre)?.label ?? selectedGenre : '';

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      setSearchQuery(search.trim());
      setSelectedGenre('online');
    }
  }, [search]);

  const localBooks = SAMPLE_BOOKS.filter(book => {
    if (selectedGenre === 'bible') return book.genre === 'religioso';
    if (selectedGenre === 'online') return false;
    if (selectedGenre !== 'all') return book.genre === selectedGenre;
    return true;
  });

  const bibleBooks = SAMPLE_BOOKS.filter(b => b.genre === 'religioso');
  const isSearchMode = selectedGenre === 'online' && searchQuery;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="px-5 pt-12 pb-2">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <BookOpen size={22} className="text-primary" strokeWidth={1.5} />
            <h1 className="font-display text-2xl font-bold text-foreground">Estante</h1>
          </div>
          <ThemeToggle />
        </div>
        <p className="text-xs text-muted-foreground font-body">
          Leitura com voz · 3 APIs integradas
        </p>
      </header>

      {/* Search */}
      <form onSubmit={handleSearch} className="px-5 py-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar em Open Library, Google Books, Gutenberg..."
            className="w-full bg-secondary text-foreground text-sm pl-9 pr-4 py-2.5 rounded-xl border-ultra-thin border-border font-body placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
          {(loadingSearch || isFetching) && (
            <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary animate-spin" />
          )}
        </div>
      </form>

      {/* Genre pills */}
      <div className="px-5 pb-3 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 min-w-max">
          {[
            { key: 'all', label: 'Todos', icon: '' },
            { key: 'online', label: '🌐 Online', icon: '' },
            { key: 'bible', label: '📖 Bíblia', icon: '' },
            ...GENRES.filter(g => g.value !== 'religioso').map(g => ({ key: g.value, label: `${g.icon} ${g.label}`, icon: '' })),
          ].map(item => (
            <button
              key={item.key}
              onClick={() => setSelectedGenre(item.key as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-body font-medium border-ultra-thin transition-colors whitespace-nowrap ${selectedGenre === item.key ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-secondary-foreground border-border hover:bg-accent'}`}
            >
              {item.label}
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
              {BIBLE_LANGUAGES.map(lang => (
                <span key={lang.code} className="px-2.5 py-1 rounded-md text-[10px] font-body border-ultra-thin border-border bg-primary/10 text-primary">
                  {lang.flag} {lang.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Online search results */}
      {isSearchMode && (
        <div className="px-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Globe size={14} className="text-primary" />
            <h2 className="font-display text-sm font-semibold text-foreground">
              Resultados para "{searchQuery}"
            </h2>
            <span className="text-[10px] text-muted-foreground font-body">({searchResults.length} livros)</span>
          </div>

          {loadingSearch ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="text-primary animate-spin" />
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground font-body text-sm">Nenhum resultado encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {searchResults.map((book, i) => (
                <ApiBookCard key={book.id} book={book} index={i} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Featured online books */}
      {selectedGenre === 'online' && !searchQuery && (
        <div className="px-5 mb-4">
          <h2 className="font-display text-sm font-semibold text-foreground mb-3">📚 Destaques Online</h2>
          {loadingFeatured ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="text-primary animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {featuredBooks.map((book, i) => (
                <ApiBookCard key={book.id} book={book} index={i} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Top 100 mais lidos por gênero (capas + sinopse) */}
      {isGenreSelected && (
        <div className="px-5 mb-6">
          <h2 className="font-display text-base font-semibold text-foreground mb-1">
            Top 100 mais lidos em {genreLabel}
          </h2>
          <p className="text-xs text-muted-foreground font-body mb-3">
            Capas e sinopses · Google Books
          </p>
          {loadingTopByGenre ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="text-primary animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground font-body">Carregando...</span>
            </div>
          ) : topBooksByGenre.length === 0 ? (
            <p className="text-muted-foreground font-body text-sm py-6">Nenhum livro encontrado para este gênero.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {topBooksByGenre.map((book, i) => (
                <ApiBookCard key={book.id} book={book} index={i} showSynopsis />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Local book grid */}
      {selectedGenre !== 'online' && (
        <div className="px-5">
          {isGenreSelected && localBooks.length > 0 && (
            <h2 className="font-display text-sm font-semibold text-foreground mb-2">Livros da biblioteca local</h2>
          )}
          <div className="grid grid-cols-3 gap-3">
            {localBooks.map((book, i) => (
              <BookCard key={book.id} book={book} isFavorite={isFavorite(book.id)} onToggleFavorite={toggleFavorite} index={i} />
            ))}
          </div>
          {localBooks.length === 0 && !isGenreSelected && (
            <div className="text-center py-12">
              <p className="text-muted-foreground font-body text-sm">Nenhum livro encontrado</p>
            </div>
          )}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
