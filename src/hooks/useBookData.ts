import { useState, useEffect, useCallback } from 'react';
import type { Bookmark, Annotation, DiaryEntry, ReadingProgress } from '@/data/books';

function getStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => getStorage('favorites', []));

  const toggle = useCallback((bookId: string) => {
    setFavorites(prev => {
      const next = prev.includes(bookId) ? prev.filter(id => id !== bookId) : [...prev, bookId];
      setStorage('favorites', next);
      return next;
    });
  }, []);

  return { favorites, toggleFavorite: toggle, isFavorite: (id: string) => favorites.includes(id) };
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => getStorage('bookmarks', []));

  const addBookmark = useCallback((bookId: string, page: number) => {
    setBookmarks(prev => {
      const exists = prev.find(b => b.bookId === bookId && b.page === page);
      if (exists) return prev;
      const next = [...prev, { bookId, page, createdAt: new Date().toISOString() }];
      setStorage('bookmarks', next);
      return next;
    });
  }, []);

  const removeBookmark = useCallback((bookId: string, page: number) => {
    setBookmarks(prev => {
      const next = prev.filter(b => !(b.bookId === bookId && b.page === page));
      setStorage('bookmarks', next);
      return next;
    });
  }, []);

  const getBookmarks = useCallback((bookId: string) => bookmarks.filter(b => b.bookId === bookId), [bookmarks]);

  return { bookmarks, addBookmark, removeBookmark, getBookmarks };
}

export function useAnnotations() {
  const [annotations, setAnnotations] = useState<Annotation[]>(() => getStorage('annotations', []));

  const addAnnotation = useCallback((annotation: Omit<Annotation, 'id' | 'createdAt'>) => {
    setAnnotations(prev => {
      const next = [...prev, { ...annotation, id: crypto.randomUUID(), createdAt: new Date().toISOString() }];
      setStorage('annotations', next);
      return next;
    });
  }, []);

  const removeAnnotation = useCallback((id: string) => {
    setAnnotations(prev => {
      const next = prev.filter(a => a.id !== id);
      setStorage('annotations', next);
      return next;
    });
  }, []);

  const getAnnotations = useCallback((bookId: string) => annotations.filter(a => a.bookId === bookId), [annotations]);

  return { annotations, addAnnotation, removeAnnotation, getAnnotations };
}

export function useDiary() {
  const [entries, setEntries] = useState<DiaryEntry[]>(() => getStorage('diary', []));

  const addEntry = useCallback((entry: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    setEntries(prev => {
      const next = [{ ...entry, id: crypto.randomUUID(), createdAt: now, updatedAt: now }, ...prev];
      setStorage('diary', next);
      return next;
    });
  }, []);

  const updateEntry = useCallback((id: string, updates: Partial<Pick<DiaryEntry, 'title' | 'content' | 'mood'>>) => {
    setEntries(prev => {
      const next = prev.map(e => e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e);
      setStorage('diary', next);
      return next;
    });
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries(prev => {
      const next = prev.filter(e => e.id !== id);
      setStorage('diary', next);
      return next;
    });
  }, []);

  return { entries, addEntry, updateEntry, removeEntry };
}

export function useReadingProgress() {
  const [progress, setProgress] = useState<ReadingProgress[]>(() => getStorage('reading-progress', []));

  const updateProgress = useCallback((bookId: string, currentPage: number) => {
    setProgress(prev => {
      const existing = prev.findIndex(p => p.bookId === bookId);
      const entry = { bookId, currentPage, lastRead: new Date().toISOString() };
      const next = existing >= 0
        ? prev.map((p, i) => i === existing ? entry : p)
        : [...prev, entry];
      setStorage('reading-progress', next);
      return next;
    });
  }, []);

  const getProgress = useCallback((bookId: string) => progress.find(p => p.bookId === bookId), [progress]);

  return { progress, updateProgress, getProgress };
}
