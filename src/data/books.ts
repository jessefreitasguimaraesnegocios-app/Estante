export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  genre: Genre;
  language: string;
  description: string;
  content: string[];
  totalPages: number;
  voiceType: VoiceType;
}

export type Genre = 'suspense' | 'terror' | 'romance' | 'ficção' | 'aventura' | 'fantasia' | 'religioso' | 'clássico' | 'poesia' | 'autoajuda';

export type VoiceType = 'masculina' | 'feminina' | 'infantil';

export interface Bookmark {
  bookId: string;
  page: number;
  createdAt: string;
}

export interface Annotation {
  id: string;
  bookId: string;
  page: number;
  text: string;
  highlight: string;
  createdAt: string;
}

export interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  mood: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReadingProgress {
  bookId: string;
  currentPage: number;
  lastRead: string;
}

export const GENRES: { value: Genre; label: string; icon: string }[] = [
  { value: 'suspense', label: 'Suspense', icon: '🔍' },
  { value: 'terror', label: 'Terror', icon: '👻' },
  { value: 'romance', label: 'Romance', icon: '💕' },
  { value: 'ficção', label: 'Ficção', icon: '🚀' },
  { value: 'aventura', label: 'Aventura', icon: '⚔️' },
  { value: 'fantasia', label: 'Fantasia', icon: '🧙' },
  { value: 'religioso', label: 'Religioso', icon: '📖' },
  { value: 'clássico', label: 'Clássico', icon: '🏛️' },
  { value: 'poesia', label: 'Poesia', icon: '✨' },
  { value: 'autoajuda', label: 'Autoajuda', icon: '🌱' },
];

export const VOICE_TYPES: { value: VoiceType; label: string; icon: string }[] = [
  { value: 'masculina', label: 'Homem', icon: '🎙️' },
  { value: 'feminina', label: 'Mulher', icon: '🎤' },
  { value: 'infantil', label: 'Criança', icon: '🧒' },
];

export const BIBLE_LANGUAGES = [
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'he', label: 'עברית (Hebraico)', flag: '🇮🇱' },
  { code: 'ar', label: 'العربية (Aramaico)', flag: '🏺' },
  { code: 'gr', label: 'Ελληνικά (Grego)', flag: '🇬🇷' },
  { code: 'la', label: 'Latina', flag: '🏛️' },
];

const loremContent = [
  "No princípio era o silêncio. Um silêncio profundo que envolvia tudo como um manto escuro, pesado, impenetrável. Nada se movia, nada respirava. O universo inteiro parecia conter a respiração, esperando por algo que ainda não tinha nome.",
  "Foi então que a primeira palavra foi sussurrada. Não se sabe de onde veio, nem quem a pronunciou. Mas ela ecoou através do vazio como uma onda, transformando tudo por onde passava. O silêncio se partiu em mil pedaços, e de cada fragmento nasceu uma história.",
  "As histórias se multiplicaram como estrelas no céu noturno. Cada uma brilhava com sua própria luz, contando sobre amores impossíveis, aventuras em terras distantes, mistérios que desafiavam a compreensão humana. Eram tantas que o universo precisou se expandir para contê-las.",
  "E assim nasceram os livros. Guardiões das histórias, portadores de sonhos, janelas para mundos que existiam apenas na imaginação de quem os lia. Cada página era um portal, cada palavra uma chave que abria portas para o impossível.",
  "O leitor sentou-se na poltrona antiga, aquela que pertencera a seu avô. O couro já estava gasto pelo tempo, mas ainda mantinha o conforto acolhedor de décadas de uso. Abriu o livro com cuidado, como quem abre um tesouro.",
  "As letras dançavam diante de seus olhos, formando imagens vividas em sua mente. Podia sentir o vento frio da montanha, ouvir o rugido do rio, cheirar as flores silvestres que cobriam o vale. O livro não era apenas lido — era vivido.",
];

export const SAMPLE_BOOKS: Book[] = [
  {
    id: 'biblia-pt',
    title: 'Bíblia Sagrada',
    author: 'Palavra de Deus',
    cover: '📜',
    genre: 'religioso',
    language: 'Português',
    description: 'A Bíblia Sagrada completa em português, com todos os livros do Antigo e Novo Testamento.',
    content: [
      "Gênesis 1:1 — No princípio, Deus criou os céus e a terra. A terra era sem forma e vazia, e havia trevas sobre a face do abismo; e o Espírito de Deus se movia sobre a face das águas.",
      "Gênesis 1:3 — E disse Deus: Haja luz; e houve luz. E viu Deus que a luz era boa; e fez Deus separação entre a luz e as trevas.",
      "Salmos 23:1 — O Senhor é o meu pastor; nada me faltará. Deitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas.",
      "João 3:16 — Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.",
      "Provérbios 3:5 — Confia no Senhor de todo o teu coração, e não te estribes no teu próprio entendimento. Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas.",
      "Apocalipse 21:4 — E Deus limpará de seus olhos toda a lágrima; e não haverá mais morte, nem pranto, nem clamor, nem dor; porque já as primeiras coisas são passadas.",
    ],
    totalPages: 6,
    voiceType: 'masculina',
  },
  {
    id: 'biblia-he',
    title: 'תנ״ך (Tanakh)',
    author: 'דבר אלוהים',
    cover: '✡️',
    genre: 'religioso',
    language: 'Hebraico',
    description: 'A Bíblia Hebraica — Torá, Neviim e Ketuvim em hebraico original.',
    content: [
      "בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ — No princípio, Deus criou os céus e a terra.",
      "וַיֹּאמֶר אֱלֹהִים יְהִי אוֹר וַיְהִי אוֹר — E disse Deus: Haja luz; e houve luz.",
      "מִזְמוֹר לְדָוִד יְהוָה רֹעִי לֹא אֶחְסָר — Salmo de Davi: O Senhor é meu pastor, nada me faltará.",
      ...loremContent.slice(3),
    ],
    totalPages: 6,
    voiceType: 'masculina',
  },
  {
    id: 'biblia-ar',
    title: 'الكتاب المقدس',
    author: 'كلمة الله',
    cover: '🕯️',
    genre: 'religioso',
    language: 'Aramaico',
    description: 'Textos bíblicos em aramaico, a língua falada por Jesus Cristo.',
    content: [
      "ܒܪܫܝܬ ܒܪܐ ܐܠܗܐ ܝܬ ܫܡܝܐ ܘܝܬ ܐܪܥܐ — No princípio, Deus criou os céus e a terra.",
      ...loremContent.slice(1),
    ],
    totalPages: 6,
    voiceType: 'masculina',
  },
  {
    id: 'noite-sombria',
    title: 'A Noite Sombria',
    author: 'Carlos Mendes',
    cover: '🌑',
    genre: 'terror',
    language: 'Português',
    description: 'Uma história arrepiante sobre segredos enterrados em uma mansão abandonada.',
    content: loremContent,
    totalPages: 6,
    voiceType: 'masculina',
  },
  {
    id: 'amor-proibido',
    title: 'Amor Proibido',
    author: 'Ana Clara Souza',
    cover: '🌹',
    genre: 'romance',
    language: 'Português',
    description: 'Um romance apaixonante entre dois corações que o destino insiste em separar.',
    content: loremContent,
    totalPages: 6,
    voiceType: 'feminina',
  },
  {
    id: 'enigma-final',
    title: 'O Enigma Final',
    author: 'Roberto Lima',
    cover: '🔐',
    genre: 'suspense',
    language: 'Português',
    description: 'Um detetive brilhante enfrenta o caso mais complexo de sua carreira.',
    content: loremContent,
    totalPages: 6,
    voiceType: 'masculina',
  },
  {
    id: 'reinos-perdidos',
    title: 'Reinos Perdidos',
    author: 'Mariana Costa',
    cover: '🏰',
    genre: 'fantasia',
    language: 'Português',
    description: 'Uma jornada épica por mundos mágicos onde nada é o que parece.',
    content: loremContent,
    totalPages: 6,
    voiceType: 'feminina',
  },
  {
    id: 'alem-horizonte',
    title: 'Além do Horizonte',
    author: 'Pedro Alves',
    cover: '🌌',
    genre: 'ficção',
    language: 'Português',
    description: 'Uma aventura intergaláctica em busca de um novo lar para a humanidade.',
    content: loremContent,
    totalPages: 6,
    voiceType: 'masculina',
  },
  {
    id: 'caminhos-alma',
    title: 'Caminhos da Alma',
    author: 'Lucia Ferreira',
    cover: '🦋',
    genre: 'autoajuda',
    language: 'Português',
    description: 'Reflexões profundas sobre autoconhecimento e transformação pessoal.',
    content: loremContent,
    totalPages: 6,
    voiceType: 'feminina',
  },
  {
    id: 'espada-heroi',
    title: 'A Espada do Herói',
    author: 'Thiago Santos',
    cover: '⚔️',
    genre: 'aventura',
    language: 'Português',
    description: 'Um jovem guerreiro parte em busca da lendária espada que salvará seu reino.',
    content: loremContent,
    totalPages: 6,
    voiceType: 'masculina',
  },
  {
    id: 'versos-lua',
    title: 'Versos da Lua',
    author: 'Isabela Nunes',
    cover: '🌙',
    genre: 'poesia',
    language: 'Português',
    description: 'Uma coletânea de poemas sobre amor, saudade e esperança.',
    content: loremContent,
    totalPages: 6,
    voiceType: 'feminina',
  },
  {
    id: 'dom-casmurro',
    title: 'Dom Casmurro',
    author: 'Machado de Assis',
    cover: '🎩',
    genre: 'clássico',
    language: 'Português',
    description: 'O clássico da literatura brasileira sobre ciúmes, amor e traição.',
    content: loremContent,
    totalPages: 6,
    voiceType: 'masculina',
  },
];
