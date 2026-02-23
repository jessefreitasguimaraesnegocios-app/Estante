import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Lock, Calendar, Smile, Frown, Meh, Heart as HeartIcon } from 'lucide-react';
import { useDiary } from '@/hooks/useBookData';
import BottomNav from '@/components/BottomNav';
import ThemeToggle from '@/components/ThemeToggle';

const MOODS = [
  { value: '😊', icon: Smile, label: 'Feliz' },
  { value: '😢', icon: Frown, label: 'Triste' },
  { value: '😐', icon: Meh, label: 'Neutro' },
  { value: '❤️', icon: HeartIcon, label: 'Amor' },
];

export default function DiaryPage() {
  const { entries, addEntry, updateEntry, removeEntry } = useDiary();
  const [isWriting, setIsWriting] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('😊');

  const handleSave = () => {
    if (title.trim() || content.trim()) {
      addEntry({ title: title.trim() || 'Sem título', content: content.trim(), mood });
      setTitle('');
      setContent('');
      setMood('😊');
      setIsWriting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Diário Pessoal</h1>
            <p className="text-xs text-muted-foreground font-body flex items-center gap-1 mt-0.5">
              <Lock size={10} /> Seus segredos estão seguros
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
            onClick={() => setIsWriting(true)}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-md transition-transform hover:scale-105"
          >
            <Plus size={20} />
          </button>
          </div>
        </div>
      </header>

      {/* New entry form */}
      {isWriting && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-5 mb-4 glass-card p-4 gold-glow"
        >
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Título da entrada..."
            className="w-full bg-transparent text-foreground font-display text-lg font-semibold placeholder:text-muted-foreground focus:outline-none mb-3"
          />
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Escreva seus pensamentos, segredos, acontecimentos..."
            rows={5}
            className="w-full bg-transparent text-foreground font-body text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none resize-none mb-3"
          />
          
          {/* Mood selector */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs text-muted-foreground font-body">Humor:</span>
            {MOODS.map(m => (
              <button
                key={m.value}
                onClick={() => setMood(m.value)}
                className={`text-lg transition-transform ${mood === m.value ? 'scale-125' : 'opacity-50 hover:opacity-75'}`}
              >
                {m.value}
              </button>
            ))}
          </div>

          <div className="flex gap-2 justify-end">
            <button onClick={() => setIsWriting(false)} className="px-4 py-1.5 text-sm text-muted-foreground font-body">
              Cancelar
            </button>
            <button onClick={handleSave} className="px-4 py-1.5 bg-primary text-primary-foreground text-sm rounded-lg font-body font-medium">
              Salvar
            </button>
          </div>
        </motion.div>
      )}

      {/* Entries */}
      <div className="px-5 space-y-3">
        {entries.length === 0 && !isWriting && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📝</p>
            <p className="text-muted-foreground font-body text-sm">Seu diário está vazio</p>
            <p className="text-muted-foreground font-body text-xs mt-1">Toque no + para começar a escrever</p>
          </div>
        )}

        {entries.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">{entry.mood}</span>
                  <h3 className="font-display text-sm font-semibold text-foreground">{entry.title}</h3>
                </div>
                <p className="font-body text-xs text-muted-foreground line-clamp-3">{entry.content}</p>
                <p className="font-body text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                  <Calendar size={9} />
                  {new Date(entry.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <button onClick={() => removeEntry(entry.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
