import { useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Play, Pause, SkipBack, SkipForward,
  Volume2, ChevronLeft, ChevronRight, Loader2,
  Mic, User, Baby, ExternalLink, Heart, BookOpen
} from 'lucide-react';
import { VOICE_TYPES, type VoiceType } from '@/data/books';
import { fetchBookText, searchGutendex, type ApiBook } from '@/services/bookApi';
import { generateElevenLabsSpeech, isElevenLabsAvailable } from '@/services/elevenLabsTts';
import { useApiFavorites } from '@/hooks/useBookData';
import ThemeToggle from '@/components/ThemeToggle';
import { useQuery } from '@tanstack/react-query';

export default function ApiReaderPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const book = state?.book as ApiBook | undefined;
  const { toggleApiFavorite, isApiFavorite } = useApiFavorites();

  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceType, setVoiceType] = useState<VoiceType>('masculina');
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [isLoadingVoice, setIsLoadingVoice] = useState(false);
  const geminiAudioRef = useRef<HTMLAudioElement | null>(null);

  // Try to fetch full text:
  // 1. If Gutenberg → use textContent URL directly
  // 2. If Google/OpenLibrary → try to find the book on Gutendex by title+author
  // 3. Fallback to description only
  const { data: pages = [], isLoading } = useQuery({
    queryKey: ['book-text', book?.id],
    queryFn: async () => {
      if (!book) return ['Livro não encontrado.'];

      // Direct Gutenberg text
      if (book.source === 'gutendex' && book.textContent) {
        return fetchBookText(book.textContent);
      }

      // Try to find on Gutendex by title (for Google/OpenLibrary books)
      if (book.source !== 'gutendex') {
        try {
          const results = await searchGutendex(book.title, 3);
          const match = results.find(r =>
            r.textContent &&
            r.title.toLowerCase().includes(book.title.toLowerCase().slice(0, 15))
          );
          if (match?.textContent) {
            return fetchBookText(match.textContent);
          }
        } catch { /* ignore */ }
      }

      // Fallback: show description + message
      const descPage = book.description || 'Sem sinopse disponível.';
      const noTextPage =
        '📚 Texto completo não disponível para leitura direta.\n\n' +
        'Este livro está disponível nas plataformas originais. ' +
        (book.previewLink ? 'Use o ícone de link externo (↗) no topo para acessar a prévia.' : 'Pesquise o título no Google para encontrar o texto completo.');
      return [descPage, noTextPage];
    },
    enabled: !!book,
    staleTime: Infinity,
  });

  const hasFullText = pages.length > 2 || (pages.length > 0 && !pages[0]?.startsWith('📚'));

  const stopSpeech = useCallback(() => {
    window.speechSynthesis.cancel();
    if (geminiAudioRef.current) {
      geminiAudioRef.current.pause();
      geminiAudioRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const playWithWebSpeech = useCallback(() => {
    if (!pages[currentPage] || !book) return;
    const utterance = new SpeechSynthesisUtterance(pages[currentPage]);
    utterance.lang = book.language === 'Português' ? 'pt-BR' : book.language === 'Español' ? 'es-ES' : 'en-US';
    utterance.rate = 0.9;
    if (voiceType === 'feminina') utterance.pitch = 1.3;
    else if (voiceType === 'infantil') { utterance.pitch = 1.8; utterance.rate = 1.05; }
    else utterance.pitch = 0.8;
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  }, [pages, currentPage, voiceType, book]);

  const playSpeech = useCallback(async () => {
    if (!pages[currentPage] || !book) return;
    stopSpeech();

    if (isElevenLabsAvailable()) {
      setIsLoadingVoice(true);
      try {
        const result = await generateElevenLabsSpeech(
          pages[currentPage],
          voiceType,
          book.genre
        );
        if (result) {
          const audio = new Audio(URL.createObjectURL(result.blob));
          geminiAudioRef.current = audio;
          audio.onended = () => {
            URL.revokeObjectURL(audio.src);
            geminiAudioRef.current = null;
            setIsPlaying(false);
          };
          audio.onerror = () => {
            URL.revokeObjectURL(audio.src);
            geminiAudioRef.current = null;
            setIsPlaying(false);
          };
          await audio.play();
          setIsPlaying(true);
          return;
        }
      } catch (_) {
        // fallback to Web Speech
      } finally {
        setIsLoadingVoice(false);
      }
    }

    playWithWebSpeech();
  }, [pages, currentPage, voiceType, book, stopSpeech, playWithWebSpeech]);

  const togglePlay = () => isPlaying ? stopSpeech() : playSpeech();
  const goPage = (dir: number) => {
    stopSpeech();
    setCurrentPage(p => Math.max(0, Math.min(pages.length - 1, p + dir)));
  };

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground font-body">Livro não encontrado</p>
      </div>
    );
  }

  const voiceIcons = { masculina: User, feminina: Mic, infantil: Baby };
  const fav = isApiFavorite(book.id);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-ultra-thin border-border bg-card/50 backdrop-blur-sm">
        <button onClick={() => { stopSpeech(); navigate(-1); }} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={20} strokeWidth={1.5} />
        </button>
        <div className="text-center flex-1 mx-4">
          <h1 className="font-display text-sm font-semibold truncate text-foreground">{book.title}</h1>
          <p className="text-[10px] text-muted-foreground">{book.author}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => toggleApiFavorite(book)}
            className="p-1.5 transition-transform hover:scale-110 active:scale-95"
            aria-label={fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Heart size={18} strokeWidth={1.5} className={fav ? 'fill-red-500 text-red-500' : 'text-muted-foreground'} />
          </button>
          <ThemeToggle />
          {book.previewLink && (
            <a href={book.previewLink} target="_blank" rel="noopener noreferrer" className="p-1.5 text-muted-foreground hover:text-primary">
              <ExternalLink size={16} strokeWidth={1.5} />
            </a>
          )}
        </div>
      </header>

      {/* Book cover + info */}
      {currentPage === 0 && (
        <div className="px-6 py-6 flex gap-4 items-start">
          {book.cover && (
            <img src={book.cover} alt={book.title} className="w-20 h-28 object-cover rounded-md shadow-md flex-shrink-0" />
          )}
          <div className="flex-1">
            <h2 className="font-display text-lg font-bold text-foreground">{book.title}</h2>
            <p className="text-xs text-muted-foreground font-body">{book.author}</p>
            {book.publishYear && <p className="text-[10px] text-muted-foreground font-body mt-0.5">Publicado em {book.publishYear}</p>}
            <span className="inline-block mt-1.5 text-[9px] font-body font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border-ultra-thin border-primary/20">
              {book.source === 'openlibrary' ? 'Open Library' : book.source === 'google' ? 'Google Books' : 'Project Gutenberg'}
            </span>
            {/* Text availability badge */}
            {!isLoading && (
              <div className={`inline-flex items-center gap-1 ml-2 mt-1.5 text-[9px] font-body font-medium px-2 py-0.5 rounded-full border-ultra-thin ${hasFullText ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' : 'bg-amber-500/10 text-amber-700 border-amber-500/20'}`}>
                <BookOpen size={8} />
                {hasFullText ? 'Texto completo' : 'Sinopse apenas'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 max-w-2xl mx-auto w-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 size={24} className="text-primary animate-spin" />
            <span className="text-sm text-muted-foreground font-body">Buscando texto completo...</span>
            <span className="text-xs text-muted-foreground font-body">Procurando no Project Gutenberg</span>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={currentPage} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <p className="font-body text-base leading-relaxed text-foreground/90 whitespace-pre-line">
                {pages[currentPage]}
              </p>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Page nav */}
      <div className="flex items-center justify-between px-6 py-2 text-xs text-muted-foreground">
        <button onClick={() => goPage(-1)} disabled={currentPage === 0} className="p-1 disabled:opacity-30">
          <ChevronLeft size={16} />
        </button>
        <span className="font-body">Página {currentPage + 1} de {pages.length || 1}</span>
        <button onClick={() => goPage(1)} disabled={currentPage >= pages.length - 1} className="p-1 disabled:opacity-30">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Controls */}
      <div className="border-t border-ultra-thin border-border bg-card/80 backdrop-blur-md px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-2">
          <div className="relative">
            <button onClick={() => setShowVoiceSelector(!showVoiceSelector)} className="p-2 rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-accent">
              <Volume2 size={18} strokeWidth={1.5} />
            </button>
            <AnimatePresence>
              {showVoiceSelector && (
                <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }} className="absolute bottom-full mb-2 left-0 glass-card p-2 min-w-[140px] shadow-lg">
                  {VOICE_TYPES.map(v => {
                    const VIcon = voiceIcons[v.value];
                    return (
                      <button key={v.value} onClick={() => { setVoiceType(v.value); setShowVoiceSelector(false); if (isPlaying) { stopSpeech(); setTimeout(playSpeech, 100); } }} className={`flex items-center gap-2 w-full px-3 py-1.5 rounded text-xs font-body transition-colors ${voiceType === v.value ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-secondary'}`}>
                        <VIcon size={14} />
                        {v.label}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => goPage(-1)} disabled={currentPage === 0} className="p-1.5 text-muted-foreground disabled:opacity-30">
              <SkipBack size={18} strokeWidth={1.5} />
            </button>
            <button onClick={togglePlay} disabled={isLoadingVoice || isLoading} className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-70">
              {isLoadingVoice ? <Loader2 size={20} className="animate-spin" /> : isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
            </button>
            <button onClick={() => goPage(1)} disabled={currentPage >= pages.length - 1} className="p-1.5 text-muted-foreground disabled:opacity-30">
              <SkipForward size={18} strokeWidth={1.5} />
            </button>
          </div>

          <div className="w-10" />
        </div>
      </div>
    </div>
  );
}
