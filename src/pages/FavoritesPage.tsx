import { SAMPLE_BOOKS } from '@/data/books';
import { useFavorites, useApiFavorites } from '@/hooks/useBookData';
import BookCard from '@/components/BookCard';
import ApiBookCard from '@/components/ApiBookCard';
import BottomNav from '@/components/BottomNav';
import ThemeToggle from '@/components/ThemeToggle';

export default function FavoritesPage() {
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { apiFavorites } = useApiFavorites();
  const favoriteBooks = SAMPLE_BOOKS.filter(b => favorites.includes(b.id));
  const total = favoriteBooks.length + apiFavorites.length;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="px-5 pt-12 pb-4 flex items-start justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Favoritos</h1>
          <p className="text-xs text-muted-foreground font-body mt-0.5">{total} livros salvos</p>
        </div>
        <ThemeToggle />
      </header>

      <div className="px-5">
        {total === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">💕</p>
            <p className="text-muted-foreground font-body text-sm">Nenhum favorito ainda</p>
            <p className="text-muted-foreground font-body text-xs mt-1">Toque no ♡ em qualquer livro</p>
          </div>
        ) : (
          <>
            {/* Online favorites */}
            {apiFavorites.length > 0 && (
              <div className="mb-6">
                <h2 className="font-display text-sm font-semibold text-foreground mb-3">🌐 Online</h2>
                <div className="grid grid-cols-3 gap-3">
                  {apiFavorites.map((book, i) => (
                    <ApiBookCard key={book.id} book={book} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Local favorites */}
            {favoriteBooks.length > 0 && (
              <div>
                <h2 className="font-display text-sm font-semibold text-foreground mb-3">📚 Biblioteca local</h2>
                <div className="grid grid-cols-3 gap-3">
                  {favoriteBooks.map((book, i) => (
                    <BookCard key={book.id} book={book} isFavorite={isFavorite(book.id)} onToggleFavorite={toggleFavorite} index={i} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
