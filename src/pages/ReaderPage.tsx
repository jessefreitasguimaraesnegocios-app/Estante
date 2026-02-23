import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Play, Pause, SkipBack, SkipForward,
  Bookmark, BookmarkCheck, Heart, PenLine, Volume2,
  ChevronLeft, ChevronRight, X, Mic, User, Baby
} from 'lucide-react';
import { SAMPLE_BOOKS, VOICE_TYPES, type VoiceType } from '@/data/books';
import { useFavorites, useBookmarks, useAnnotations, useReadingProgress } from '@/hooks/useBookData';

export default function ReaderPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const book = SAMPLE_BOOKS.find(b => b.id === bookId);
  
  const { isFavorite, toggleFavorite } = useFavorites();
  const { getBookmarks, addBookmark, removeBookmark } = useBookmarks();
  const { getAnnotations, addAnnotation, removeAnnotation } = useAnnotations();
  const { getProgress, updateProgress } = useReadingProgress();
  
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceType, setVoiceType] = useState<VoiceType>('masculina');
  const [showAnnotation, setShowAnnotation] = useState(false);
  const [annotationText, setAnnotationText] = useState('');
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (book) {
      const saved = getProgress(book.id);
      if (saved) setCurrentPage(saved.currentPage);
    }
  }, [book?.id]);

  useEffect(() => {
    if (book) updateProgress(book.id, currentPage);
  }, [currentPage, book?.id]);

  const stopSpeech = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  }, []);

  const playSpeech = useCallback(() => {
    if (!book) return;
    stopSpeech();
    
    const utterance = new SpeechSynthesisUtterance(book.content[currentPage]);
    utterance.lang = book.language === 'Hebraico' ? 'he-IL' : book.language === 'Aramaico' ? 'ar-SA' : 'pt-BR';
    utterance.rate = 0.9;
    
    // Set voice pitch based on type
    if (voiceType === 'feminina') { utterance.pitch = 1.3; }
    else if (voiceType === 'infantil') { utterance.pitch = 1.8; utterance.rate = 1.05; }
    else { utterance.pitch = 0.8; }

    utterance.onend = () => setIsPlaying(false);
    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  }, [book, currentPage, voiceType, stopSpeech]);

  const togglePlay = () => isPlaying ? stopSpeech() : playSpeech();

  const goPage = (dir: number) => {
    if (!book) return;
    stopSpeech();
    setCurrentPage(p => Math.max(0, Math.min(book.totalPages - 1, p + dir)));
  };

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Livro não encontrado</p>
      </div>
    );
  }

  const bookmarks = getBookmarks(book.id);
  const annotations = getAnnotations(book.id);
  const isBookmarked = bookmarks.some(b => b.page === currentPage);
  const pageAnnotations = annotations.filter(a => a.page === currentPage);

  const voiceIcons = { masculina: User, feminina: Mic, infantil: Baby };

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
        <div className="flex gap-1.5">
          <button onClick={() => toggleFavorite(book.id)} className="p-1.5 transition-colors">
            <Heart size={18} strokeWidth={1.5} className={isFavorite(book.id) ? 'fill-primary text-primary' : 'text-muted-foreground'} />
          </button>
          <button
            onClick={() => isBookmarked ? removeBookmark(book.id, currentPage) : addBookmark(book.id, currentPage)}
            className="p-1.5 transition-colors"
          >
            {isBookmarked
              ? <BookmarkCheck size={18} strokeWidth={1.5} className="text-primary" />
              : <Bookmark size={18} strokeWidth={1.5} className="text-muted-foreground" />}
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8 max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <p className="font-body text-base leading-relaxed text-foreground/90 whitespace-pre-line">
              {book.content[currentPage]}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Page annotations */}
        {pageAnnotations.length > 0 && (
          <div className="mt-6 space-y-2">
            {pageAnnotations.map(a => (
              <div key={a.id} className="glass-card p-3 text-sm">
                <div className="flex justify-between items-start">
                  <p className="text-muted-foreground font-body text-xs">{a.text}</p>
                  <button onClick={() => removeAnnotation(a.id)} className="text-muted-foreground hover:text-destructive ml-2">
                    <X size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Page nav */}
      <div className="flex items-center justify-between px-6 py-2 text-xs text-muted-foreground">
        <button onClick={() => goPage(-1)} disabled={currentPage === 0} className="p-1 disabled:opacity-30">
          <ChevronLeft size={16} />
        </button>
        <span className="font-body">Página {currentPage + 1} de {book.totalPages}</span>
        <button onClick={() => goPage(1)} disabled={currentPage === book.totalPages - 1} className="p-1 disabled:opacity-30">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Controls */}
      <div className="border-t border-ultra-thin border-border bg-card/80 backdrop-blur-md px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-2">
          {/* Voice selector */}
          <div className="relative">
            <button
              onClick={() => setShowVoiceSelector(!showVoiceSelector)}
              className="p-2 rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-accent"
            >
              <Volume2 size={18} strokeWidth={1.5} />
            </button>
            <AnimatePresence>
              {showVoiceSelector && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute bottom-full mb-2 left-0 glass-card p-2 min-w-[140px] shadow-lg"
                >
                  {VOICE_TYPES.map(v => {
                    const VIcon = voiceIcons[v.value];
                    return (
                      <button
                        key={v.value}
                        onClick={() => { setVoiceType(v.value); setShowVoiceSelector(false); if (isPlaying) { stopSpeech(); setTimeout(playSpeech, 100); }}}
                        className={`flex items-center gap-2 w-full px-3 py-1.5 rounded text-xs font-body transition-colors ${voiceType === v.value ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-secondary'}`}
                      >
                        <VIcon size={14} />
                        {v.label}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Play controls */}
          <div className="flex items-center gap-3">
            <button onClick={() => goPage(-1)} disabled={currentPage === 0} className="p-1.5 text-muted-foreground disabled:opacity-30">
              <SkipBack size={18} strokeWidth={1.5} />
            </button>
            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-md transition-transform hover:scale-105 active:scale-95"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
            </button>
            <button onClick={() => goPage(1)} disabled={currentPage === book.totalPages - 1} className="p-1.5 text-muted-foreground disabled:opacity-30">
              <SkipForward size={18} strokeWidth={1.5} />
            </button>
          </div>

          {/* Annotation */}
          <button
            onClick={() => setShowAnnotation(!showAnnotation)}
            className="p-2 rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-accent"
          >
            <PenLine size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Annotation form */}
        <AnimatePresence>
          {showAnnotation && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 flex gap-2">
                <input
                  value={annotationText}
                  onChange={e => setAnnotationText(e.target.value)}
                  placeholder="Adicionar nota..."
                  className="flex-1 bg-secondary text-foreground text-sm px-3 py-2 rounded-lg border-ultra-thin border-border font-body placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
                <button
                  onClick={() => {
                    if (annotationText.trim()) {
                      addAnnotation({ bookId: book.id, page: currentPage, text: annotationText, highlight: '' });
                      setAnnotationText('');
                      setShowAnnotation(false);
                    }
                  }}
                  className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg font-body font-medium"
                >
                  Salvar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
