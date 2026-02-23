import type { Genre, VoiceType } from '@/data/books';

export interface ApiBook {
  id: string;
  title: string;
  author: string;
  cover: string | null;
  genre: Genre;
  language: string;
  description: string;
  source: 'openlibrary' | 'google' | 'gutendex';
  previewLink?: string;
  subjects?: string[];
  pageCount?: number;
  publishYear?: number;
  textContent?: string;
}

function guessGenre(subjects: string[] = [], title = '', description = ''): Genre {
  const all = [...subjects, title, description].join(' ').toLowerCase();
  if (/horror|terror|scary|gothic|dracula|frankenstein/.test(all)) return 'terror';
  if (/suspense|thriller|mystery|detective|crime/.test(all)) return 'suspense';
  if (/romance|love|passion|heart/.test(all)) return 'romance';
  if (/fantasy|magic|wizard|dragon|fairy/.test(all)) return 'fantasia';
  if (/adventure|journey|expedition|quest/.test(all)) return 'aventura';
  if (/science fiction|sci-fi|space|future|robot/.test(all)) return 'ficção';
  if (/bible|religion|spiritual|church|god|jesus|prayer/.test(all)) return 'religioso';
  if (/poem|poetry|verse|sonnet/.test(all)) return 'poesia';
  if (/self-help|motivation|mindfulness|happiness/.test(all)) return 'autoajuda';
  if (/classic|literature|19th century|18th century/.test(all)) return 'clássico';
  return 'clássico';
}

// Open Library API
export async function searchOpenLibrary(query: string, limit = 12): Promise<ApiBook[]> {
  try {
    const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}&fields=key,title,author_name,cover_i,subject,first_publish_year,language,number_of_pages_median`);
    const data = await res.json();
    return (data.docs || []).map((doc: any) => ({
      id: `ol-${doc.key?.replace('/works/', '')}`,
      title: doc.title || 'Sem título',
      author: doc.author_name?.[0] || 'Autor desconhecido',
      cover: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : null,
      genre: guessGenre(doc.subject, doc.title),
      language: (doc.language || ['en'])[0] === 'por' ? 'Português' : (doc.language || ['en'])[0] === 'spa' ? 'Español' : 'English',
      description: `Publicado em ${doc.first_publish_year || '?'}. ${doc.number_of_pages_median ? doc.number_of_pages_median + ' páginas.' : ''}`,
      source: 'openlibrary' as const,
      subjects: doc.subject?.slice(0, 5),
      pageCount: doc.number_of_pages_median,
      publishYear: doc.first_publish_year,
    }));
  } catch (e) {
    console.error('Open Library error:', e);
    return [];
  }
}

// Google Books API
export async function searchGoogleBooks(query: string, limit = 12): Promise<ApiBook[]> {
  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${limit}&printType=books`);
    const data = await res.json();
    return (data.items || []).map((item: any) => {
      const v = item.volumeInfo || {};
      return {
        id: `gb-${item.id}`,
        title: v.title || 'Sem título',
        author: v.authors?.[0] || 'Autor desconhecido',
        cover: v.imageLinks?.thumbnail?.replace('http:', 'https:') || null,
        genre: guessGenre(v.categories, v.title, v.description),
        language: v.language === 'pt' ? 'Português' : v.language === 'es' ? 'Español' : 'English',
        description: v.description?.slice(0, 200) || `${v.pageCount || '?'} páginas`,
        source: 'google' as const,
        previewLink: v.previewLink,
        subjects: v.categories,
        pageCount: v.pageCount,
        publishYear: v.publishedDate ? parseInt(v.publishedDate) : undefined,
        textContent: v.description,
      };
    });
  } catch (e) {
    console.error('Google Books error:', e);
    return [];
  }
}

// Gutendex (Project Gutenberg)
export async function searchGutendex(query: string, limit = 12): Promise<ApiBook[]> {
  try {
    const res = await fetch(`https://gutendex.com/books?search=${encodeURIComponent(query)}&page=1`);
    const data = await res.json();
    return (data.results || []).slice(0, limit).map((book: any) => {
      const author = book.authors?.[0];
      return {
        id: `gd-${book.id}`,
        title: book.title || 'Sem título',
        author: author ? `${author.name}` : 'Autor desconhecido',
        cover: book.formats?.['image/jpeg'] || null,
        genre: guessGenre(book.subjects, book.title),
        language: (book.languages || ['en'])[0] === 'pt' ? 'Português' : (book.languages || ['en'])[0] === 'es' ? 'Español' : 'English',
        description: book.subjects?.slice(0, 3).join(', ') || 'Livro clássico do Project Gutenberg',
        source: 'gutendex' as const,
        subjects: book.subjects?.slice(0, 5),
        pageCount: undefined,
        publishYear: author?.birth_year,
        textContent: book.formats?.['text/plain; charset=utf-8'] || book.formats?.['text/plain'],
      };
    });
  } catch (e) {
    console.error('Gutendex error:', e);
    return [];
  }
}

// Combined search across all APIs
export async function searchAllBooks(query: string): Promise<ApiBook[]> {
  const [ol, gb, gd] = await Promise.all([
    searchOpenLibrary(query, 8),
    searchGoogleBooks(query, 8),
    searchGutendex(query, 8),
  ]);

  // Merge and deduplicate by title similarity
  const all = [...gb, ...ol, ...gd];
  const seen = new Set<string>();
  return all.filter(book => {
    const key = book.title.toLowerCase().slice(0, 30);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Fetch featured/popular books for homepage
export async function fetchFeaturedBooks(): Promise<ApiBook[]> {
  const queries = ['bestseller fiction', 'classic literature', 'bible', 'romance novel', 'horror thriller', 'fantasy adventure', 'poetry', 'science fiction'];
  const randomQueries = queries.sort(() => Math.random() - 0.5).slice(0, 3);
  
  const results = await Promise.all(randomQueries.map(q => searchGoogleBooks(q, 6)));
  const all = results.flat();
  
  const seen = new Set<string>();
  return all.filter(book => {
    const key = book.title.toLowerCase().slice(0, 30);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Fetch book text content from Gutenberg
export async function fetchBookText(textUrl: string): Promise<string[]> {
  try {
    const res = await fetch(textUrl);
    const text = await res.text();
    // Split into pages of ~800 chars
    const pages: string[] = [];
    const sentences = text.split(/(?<=[.!?])\s+/);
    let current = '';
    for (const sentence of sentences) {
      if (current.length + sentence.length > 800 && current.length > 200) {
        pages.push(current.trim());
        current = sentence;
      } else {
        current += (current ? ' ' : '') + sentence;
      }
      if (pages.length >= 50) break; // limit pages
    }
    if (current.trim()) pages.push(current.trim());
    return pages.length > 0 ? pages : ['Conteúdo não disponível para leitura.'];
  } catch {
    return ['Não foi possível carregar o texto deste livro.'];
  }
}
