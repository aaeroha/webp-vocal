export interface NavLink {
  label: string;
  href: string;
}

export interface StatCounter {
  id: string;
  value: number;
  suffix?: string;
  unit: string;
  label: string;
  formatSpaces?: boolean;
}

export interface PrincipleCard {
  id: string;
  iconKey: 'physiology' | 'mechanics' | 'stage';
  title: string;
  description: string;
}

export interface CertificateItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
}

export interface LessonStepItem {
  id: string;
  iconKey: 'breath' | 'tuning' | 'music' | 'mic';
  badge: string;
  title: string;
  description: string;
  highlights: string[];
}

export interface ReviewItem {
  id: string;
  author: string;
  date: string;
  platform: 'Авито' | 'Яндекс';
  text: string;
  url: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface SocialLink {
  id: 'youtube' | 'rutube';
  label: string;
  href: string;
  handle: string;
}

export interface RecommendedTrack {
  title: string;
  artist: string;
  mood: 'Лирика' | 'Драйв' | 'Классика' | 'Соул';
  whyFits: string;
}

export interface VoiceTypeProfile {
  id: string;
  gender: 'female' | 'male';
  name: string;
  rangeLabel: string;
  subtypes: string[];
  compliment: string;
  description: string;
  minHz: number;
  maxHz: number;
  pianoNotes: string[];
  recommendedSongs: RecommendedTrack[];
}

export interface KaraokeNoteStep {
  syllable: string;
  note: string | null;
  duration: number;
  lineBreak?: boolean;
}

export interface KaraokeSection {
  name: string;
  key: string;
  bpm: number;
  notes: KaraokeNoteStep[];
}

export interface KaraokeSong {
  id: string;
  title: string;
  timeSignature: string;
  sections: KaraokeSection[];
}

export const AVITO_REVIEWS_URL =
  'https://www.avito.ru/moskovskaya_oblast_troitsk/predlozheniya_uslug/pedagog_po_vokalu_3081109959?utm_campaign=native&utm_medium=item_page_android&utm_source=soc_sharing_seller#open-item-reviews-list';

export const YANDEX_PROFILE_URL =
  'https://uslugi.yandex.ru/profile/ValeriyaErokhina-2882398';

export const SITE_CONFIG = {
  brandName: 'Валерия Ерохина',
  brandSubtitle: 'Педагог по вокалу',
  telegramUrl: 'https://t.me/valeria_erokhina_vocal',
  whatsappUrl: 'https://wa.me/79000000000',
  email: 'vocal@valeria-erokhina.ru',
  studioAddress:
    'Оборудованная студия: г. Москва, Ватутинки (рядом Новые Ватутинки и Троицк, Калужское шоссе — 15–20 мин от м. Ольховая, Прокшино и Тёплый Стан)',
  yandexMapWidgetLightUrl:
    'https://yandex.ru/map-widget/v1/?ll=37.348786%2C55.518501&z=15&pt=37.348786%2C55.518501%2Cpm2rdm&l=map',
  yandexMapWidgetDarkUrl:
    'https://yandex.ru/map-widget/v1/?ll=37.348786%2C55.518501&z=15&pt=37.348786%2C55.518501%2Cpm2rdm&l=map&theme=dark',
  yandexMapDirectUrl:
    'https://yandex.ru/maps/?ll=37.348786%2C55.518501&z=15&pt=37.348786%2C55.518501%2Cpm2rdm',
  yandexMapRouteUrl:
    'https://yandex.ru/maps/?rtext=~55.518501%2C37.348786&rtt=auto',
  onlinePlatform: 'Онлайн по всему миру: Zoom / Telegram / Google Meet с профессиональным звуком',
  schedule: 'Ежедневно по предварительной записи, 10:00 – 21:00 (МСК)',
};

export const NAV_LINKS: NavLink[] = [
  { label: 'Обо мне', href: '#about' },
  { label: 'Занятия', href: '#formats' },
  { label: 'Пианино', href: '#vocal-piano' },
  { label: '3D-атлас', href: '#vocal-atlas' },
  { label: 'Сертификаты', href: '#certificates' },
  { label: 'Отзывы', href: '#reviews' },
  { label: 'Вопросы', href: '#faq' },
  { label: 'Контакты', href: '#contacts' },
];

export const HERO_CONTENT = {
  eyebrow: 'Индивидуальные уроки для взрослых и детей от 6 лет • Очно в студии и онлайн',
  typewriterPhrases: ['Постановка голоса', 'Современный вокал'],
  subtitle:
    'Меня зовут Валерия Ерохина. Я педагог высшей категории с опытом более 10 лет, магистр педагогических наук и действующая вокалистка. Обучаю свободному, здоровому звучанию с нуля до сцены на основе современной вокальной механики и фонопедии — без зажимов, крика и скучной теории.',
  primaryCta: 'Записаться на занятие',
  videoUrl: './media/video/hero-bg.webm',
  posterUrl: './media/video/hero-poster.webp',
};

export const STATS_CONTENT = {
  eyebrow: 'О моей работе в цифрах',
  items: [
    {
      id: 'years',
      value: 10,
      unit: 'лет',
      label: 'педагогического опыта и живой практики',
    },
    {
      id: 'students',
      value: 200,
      suffix: '+',
      unit: 'учеников',
      label: 'раскрыли свой голос и запели с нуля',
    },
    {
      id: 'laureates',
      value: 35,
      unit: 'лауреатов',
      label: 'победителей международных конкурсов',
    },
    {
      id: 'hours',
      value: 14000,
      suffix: '+',
      unit: 'часов',
      formatSpaces: true,
      label: 'индивидуальных занятий и работы над техникой',
    },
    {
      id: 'songs',
      value: 2000,
      suffix: '+',
      unit: 'песен',
      formatSpaces: true,
      label: 'разобрано, спето на сцене и записано',
    },
  ] satisfies StatCounter[],
};

export const ABOUT_CONTENT = {
  eyebrow: 'Философия преподавания',
  title: 'Голос звучит красиво тогда, когда телу и психике комфортно',
  paragraphs: [
    'За более чем 10 лет педагогической практики и работы на сцене я убедилась: «непоющих» людей не бывает. Чаще всего голосу мешают мышечные зажимы, страх оценки или устаревшие методики вроде «пой на опоре сильнее».',
    'В своей работе я объединяю академическую базу МПГУ, современные знания о вокальной механике (EVT / CVT), фонопедию и живой сценический опыт. Мы бережно настраиваем дыхание, работу связок и резонаторов так, чтобы вы понимали, как именно рождается ваш звук, и могли управлять им осознанно.',
    'На уроках мы работаем с тем репертуаром, который вдохновляет именно вас — от поп- и инди-музыки до джаза, рока, эстрады и мюзикла.',
  ],
  mediaPlaceholder: {
    label: 'Фото или видеофрагмент со сцены / из студии',
    note: 'Временный плейсхолдер — место для концертного кадра или видеовизитки',
  },
  principles: [
    {
      id: 'physiology',
      iconKey: 'physiology',
      title: 'Бережная физиология и фонопедия',
      description:
        'Никакого форсирования и боли в горле. Работаем со снятием гортанных и телесных зажимов, восстанавливаем выносливость и природную свободу голоса.',
    },
    {
      id: 'mechanics',
      iconKey: 'mechanics',
      title: 'Понятная вокальная механика',
      description:
        'Объясняю сложные процессы простым языком: вы точно знаете, как взять высокую ноту, сделать микст, бэлт или мягкий субтон без гадания.',
    },
    {
      id: 'stage',
      iconKey: 'stage',
      title: 'Путь от первых нот до сцены',
      description:
        'Помогаю не только настроить технику, но и раскрыть тембр, артистизм, работу с микрофоном, а также подготовиться к записи в студии или конкурсам.',
    },
  ] satisfies PrincipleCard[],
};

export const CERTIFICATES_CONTENT = {
  eyebrow: 'Образование и квалификация',
  title: 'Дипломы, научная база и сертификаты',
  subtitle: 'Нажмите на любой документ, чтобы рассмотреть его в крупном виде.',
  items: [
    {
      id: 'cert-16',
      title: 'Диплом об окончании аспирантуры МПГУ («Преподаватель-исследователь»)',
      category: 'Аспирантура МПГУ',
      imageUrl: './media/certificates/cert-16.webp',
    },
    {
      id: 'cert-13',
      title: 'Диплом магистра с отличием МПГУ («Педагогическое образование»)',
      category: 'Высшее образование',
      imageUrl: './media/certificates/cert-13.webp',
    },
    {
      id: 'cert-14',
      title: 'Диплом с отличием: Артист-вокалист, преподаватель («Вокальное искусство»)',
      category: 'Профильное образование',
      imageUrl: './media/certificates/cert-14.webp',
    },
    {
      id: 'cert-15',
      title: 'Диплом бакалавра с отличием РАНХиГС при Президенте РФ',
      category: 'Высшее образование',
      imageUrl: './media/certificates/cert-15.webp',
    },
    {
      id: 'cert-08',
      title: 'Удостоверение РАМ им. Гнесиных: «Алгоритмы развития голоса вокалиста»',
      category: 'РАМ им. Гнесиных',
      imageUrl: './media/certificates/cert-08.webp',
    },
    {
      id: 'cert-10',
      title: 'Удостоверение РАМ им. Гнесиных: «Методики обучения эстрадных вокалистов»',
      category: 'РАМ им. Гнесиных',
      imageUrl: './media/certificates/cert-10.webp',
    },
    {
      id: 'cert-11',
      title: 'Удостоверение РАМ им. Гнесиных: «Комплексный подход в воспитании вокалистов»',
      category: 'РАМ им. Гнесиных',
      imageUrl: './media/certificates/cert-11.webp',
    },
    {
      id: 'cert-12',
      title: 'Удостоверение Саратовской консерватории им. Л.В. Собинова (Голососбережение)',
      category: 'Консерватория и фонопедия',
      imageUrl: './media/certificates/cert-12.webp',
    },
    {
      id: 'cert-04',
      title: 'Сертификат «Estill Voice and Myths About the Voice» (DivaIn, USA)',
      category: 'Вокальная механика EVT',
      imageUrl: './media/certificates/cert-04.webp',
    },
    {
      id: 'cert-05',
      title: 'Сертификат «Vocal Rehabilitation» — Вокальная реабилитология (DivaIn, USA)',
      category: 'Вокальная реабилитация',
      imageUrl: './media/certificates/cert-05.webp',
    },
    {
      id: 'cert-09',
      title: 'Сертификат Школы музыкального наставничества им. Елены Образцовой',
      category: 'Вокальная школа',
      imageUrl: './media/certificates/cert-09.webp',
    },
    {
      id: 'cert-01',
      title: 'Свидетельство о членстве в Федерации педагогов вокального искусства РФ',
      category: 'Профессиональный статус',
      imageUrl: './media/certificates/cert-01.webp',
    },
    {
      id: 'cert-03',
      title: 'Диплом лауреата конкурса педмастерства «Музыка – универсальный язык человечества»',
      category: 'Лауреат конкурса',
      imageUrl: './media/certificates/cert-03.webp',
    },
    {
      id: 'cert-06',
      title: 'Диплом лауреата фестиваля-конкурса «Играют преподаватели» (Минкульт МО)',
      category: 'Сценическое мастерство',
      imageUrl: './media/certificates/cert-06.webp',
    },
    {
      id: 'cert-07',
      title: 'Почётная грамота за вклад в музыкальное обучение и воспитание (г.о. Домодедово)',
      category: 'Награда',
      imageUrl: './media/certificates/cert-07.webp',
    },
    {
      id: 'cert-02',
      title: 'Благодарственное письмо Министерства культуры Саратовской области',
      category: 'Награда',
      imageUrl: './media/certificates/cert-02.webp',
    },
  ] satisfies CertificateItem[],
};

export const LESSON_FLOW_CONTENT = {
  eyebrow: 'Как проходят занятия',
  title: 'От первой распевки до уверенного звучания на сцене',
  subtitle:
    'Каждый урок строится индивидуально под ваш голос, музыкальный вкус и задачи — очно в оборудованной студии или онлайн из любой точки мира.',
  items: [
    {
      id: 'step-1',
      iconKey: 'breath',
      badge: 'Настройка тела и дыхания',
      title: 'Снятие зажимов и опора звука',
      description:
        'Начинаем с мягкой телесной и дыхательной разминки: освобождаем челюсть, шею и гортань, чтобы голос звучал легко и без напряжения.',
      highlights: [
        'Элементы фонопедии для комфорта связок',
        'Естественная координация дыхания',
        'Спокойная атмосфера без страха ошибиться',
      ],
    },
    {
      id: 'step-2',
      iconKey: 'tuning',
      badge: 'Вокальная механика',
      title: 'Точные упражнения под ваш голос',
      description:
        'Никаких шаблонных распевок «для всех». Подбираем упражнения, которые развивают именно ваш диапазон, микст, чистоту интонирования и силу звука.',
      highlights: [
        'Понимание работы связок и резонаторов',
        'Уверенные верхние ноты без крика',
        'Ровный переход между регистрами',
      ],
    },
    {
      id: 'step-3',
      iconKey: 'music',
      badge: 'Репертуар и стиль',
      title: 'Разбор любимых песен',
      description:
        'Сразу применяем технику на музыке, которая вас вдохновляет: работаем над фразировкой, дикцией, мелизмами и эмоциональной подачей.',
      highlights: [
        'Поп, инди, джаз, рок, эстрада, мюзикл',
        'Подбор удобной тональности и минусовки',
        'Индивидуальная программа для детей от 6 лет',
      ],
    },
    {
      id: 'step-4',
      iconKey: 'mic',
      badge: 'Студия, онлайн и сцена',
      title: 'Микрофон, запись и выступления',
      description:
        'Учимся уверенно работать с микрофоном, записываем прогресс в студии, а при желании — готовимся к концертам, кастингам и международным конкурсам.',
      highlights: [
        'Очно в студии с профессиональным звуком',
        'Онлайн с готовыми распевками и треками',
        'Подготовка конкурсных и концертных номеров',
      ],
    },
  ] satisfies LessonStepItem[],
};

export const VOICE_TYPES: VoiceTypeProfile[] = [
  {
    id: 'soprano',
    gender: 'female',
    name: 'Сопрано',
    rangeLabel: 'c1 – c3 (до первой – до третьей октавы)',
    subtypes: ['колоратурное', 'лирическое', 'лирико-драматическое', 'драматическое'],
    compliment:
      'Ваш голос звучит звонко, серебристо и воздушно — у вас прекрасные задатки для полётных верхних нот и выразительной лирики!',
    description:
      'Высокий, светлый и полётный женский голос. Легко раскрывается в верхнем регистре, звучит ярко и воздушно.',
    minHz: 262,
    maxHz: 1046,
    pianoNotes: ['C4', 'E4', 'G4', 'C5'],
    recommendedSongs: [
      { title: 'Обезоружена', artist: 'Полина Гагарина', mood: 'Драйв', whyFits: 'Яркие припевы на миксте и головном резонаторе' },
      { title: 'My Heart Will Go On', artist: 'Celine Dion', mood: 'Лирика', whyFits: 'Полётное дыхание и светлые верхние ноты' },
      { title: 'Прованс', artist: 'Ёлка', mood: 'Драйв', whyFits: 'Лёгкая середина и игривые подъезды в первой-второй октаве' },
      { title: 'Ave Maria', artist: 'F. Schubert / Caccini', mood: 'Классика', whyFits: 'Раскрывает кантилену и чистоту высокого тембра' },
    ],
  },
  {
    id: 'mezzo',
    gender: 'female',
    name: 'Меццо-сопрано',
    rangeLabel: 'a – a2 (ля малой – ля второй октавы)',
    subtypes: ['лирическое', 'характерное', 'драматическое'],
    compliment:
      'У вас богатый, тёплый и бархатный тембр — самый универсальный женский голос, в котором одинаково красиво звучат и нежные баллады, и мощный эстрадный бэлт!',
    description:
      'Средний женский голос — плотнее и темнее сопрано, с бархатной серединой и выразительным тёплым тембром.',
    minHz: 205,
    maxHz: 262,
    pianoNotes: ['A3', 'C4', 'E4', 'A4'],
    recommendedSongs: [
      { title: 'Rolling in the Deep', artist: 'Adele', mood: 'Драйв', whyFits: 'Идеально ложится на плотный грудной центр и бэлт' },
      { title: 'Shallow', artist: 'Lady Gaga', mood: 'Лирика', whyFits: 'Красивый переход от мягкого субтона к мощной кульминации' },
      { title: 'Back to Black', artist: 'Amy Winehouse', mood: 'Соул', whyFits: 'Подчёркивает бархатную низкую середину без зажимов' },
      { title: 'Любовь, похожая на сон', artist: 'Алла Пугачёва', mood: 'Классика', whyFits: 'Тёплая выразительная тесситура малой и первой октавы' },
    ],
  },
  {
    id: 'contralto',
    gender: 'female',
    name: 'Контральто (Альт)',
    rangeLabel: 'f – f2 (фа малой – фа второй октавы)',
    subtypes: ['глубокое', 'академическое альтовое'],
    compliment:
      'Редкий и завораживающе глубокий тембр! Ваш природный грудной окрас звучит благородно, чувственно и сразу притягивает внимание слушателей.',
    description:
      'Самый низкий и редкий женский голос — глубокий, насыщенный и благородно-бархатный. В академической практике часто упоминается в паре с термином альт.',
    minHz: 135,
    maxHz: 205,
    pianoNotes: ['F3', 'A3', 'C4', 'F4'],
    recommendedSongs: [
      { title: 'Summertime Sadness', artist: 'Lana Del Rey', mood: 'Лирика', whyFits: 'Глубокие низкие ноты и атмосферный грудной субтон' },
      { title: 'Smooth Operator', artist: 'Sade', mood: 'Соул', whyFits: 'Фирменный бархатный грудной тембр в комфортной зоне' },
      { title: 'На Титанике', artist: 'Лолита', mood: 'Драйв', whyFits: 'Уверенная, плотная подача в нижнем регистре' },
      { title: 'Believe', artist: 'Cher', mood: 'Драйв', whyFits: 'Раскрывает характерную насыщенную середину голоса' },
    ],
  },
  {
    id: 'tenor',
    gender: 'male',
    name: 'Тенор',
    rangeLabel: 'c – c2 (до малой – до второй октавы)',
    subtypes: ['альтино', 'лирический', 'лирико-драматический (спинто)', 'драматический'],
    compliment:
      'Яркий, харизматичный и полетный голос! С правильной координацией микста вы сможете легко брать впечатляющие высокие кульминации без напряжения.',
    description:
      'Высокий, яркий и эмоциональный мужской голос с богатым микстом и свободным верхним регистром.',
    minHz: 155,
    maxHz: 523,
    pianoNotes: ['C3', 'E3', 'G3', 'C4'],
    recommendedSongs: [
      { title: 'Невозможное возможно', artist: 'Дима Билан', mood: 'Драйв', whyFits: 'Динамичный верхний регистр и звонкий микст' },
      { title: 'Stay With Me', artist: 'Sam Smith', mood: 'Соул', whyFits: 'Красивые переходы между грудью и лёгким фальцетом' },
      { title: 'Самый лучший день', artist: 'Григорий Лепс', mood: 'Драйв', whyFits: 'Яркая экспрессия и плотные верхние ноты на опоре' },
      { title: 'Con te partirò', artist: 'Andrea Bocelli', mood: 'Классика', whyFits: 'Максимально раскрывает объём и полётность тенора' },
    ],
  },
  {
    id: 'baritone',
    gender: 'male',
    name: 'Баритон',
    rangeLabel: 'A – a1 (ля большой – ля первой октавы)',
    subtypes: ['лирический', 'лирико-драматический', 'драматический', 'бас-баритон'],
    compliment:
      'Сильный, мужественный и невероятно гибкий тембр! Ваш голос сочетает бархатную глубину внизу и уверенную энергию в популярном репертуаре.',
    description:
      'Средний, самый распространённый мужской тип голоса — мужественный, гибкий и универсальный для любых жанров.',
    minHz: 112,
    maxHz: 155,
    pianoNotes: ['A2', 'C#3', 'E3', 'A3'],
    recommendedSongs: [
      { title: 'Синяя вечность', artist: 'Муслим Магомаев', mood: 'Классика', whyFits: 'Эталонная баритональная ширина и благородная опора' },
      { title: 'Сансара', artist: 'Баста', mood: 'Лирика', whyFits: 'Естественная речевая позиция и искренний тембр' },
      { title: 'All of Me', artist: 'John Legend', mood: 'Соул', whyFits: 'Мягкая середина с красивым выходом в микст' },
      { title: 'Аэропорты', artist: 'Леонид Агутин', mood: 'Драйв', whyFits: 'Комфортный грудной диапазон и выразительный ритм' },
    ],
  },
  {
    id: 'bass',
    gender: 'male',
    name: 'Бас',
    rangeLabel: 'F – f1 (фа большой – фа первой октавы)',
    subtypes: ['кантанте (высокий)', 'центральный', 'профундо (глубокий)'],
    compliment:
      'Мощный, глубокий и благородный голос с впечатляющим грудным резонансом! Такой редкий фундаментный тембр звучит гипнотически и авторитетно.',
    description:
      'Низкий, объёмный и фундаментный мужской голос с мощной грудной опорой и гипнотической глубиной.',
    minHz: 65,
    maxHz: 112,
    pianoNotes: ['F2', 'A2', 'C3', 'F3'],
    recommendedSongs: [
      { title: 'Конь', artist: 'Любэ', mood: 'Классика', whyFits: 'Раскрывает богатую грудную глубину и ровное дыхание' },
      { title: 'Hallelujah', artist: 'Leonard Cohen', mood: 'Лирика', whyFits: 'Низкая бархатная тесситура с интимной подачей' },
      { title: 'Hurt', artist: 'Johnny Cash', mood: 'Соул', whyFits: 'Акустическая глубина и выразительные разговорные низы' },
      { title: 'Прогулки по воде', artist: 'Наутилус Помпилиус', mood: 'Драйв', whyFits: 'Спокойная уверенная мощь в большой и малой октаве' },
    ],
  },
];

export type ResonatorZoneId = 'chest' | 'larynx' | 'false-folds' | 'palate' | 'mask';

export interface VocalTechniqueInfo {
  id: 'chest-support' | 'subtone' | 'mix' | 'belt' | 'distortion' | 'head-register';
  title: string;
  chipLabel: string;
  badge: string;
  subtitle: string;
  noteLabel: string;
  freqHz: number;
  formantHz: number;
  airiness: number;
  brightness: number;
  grit?: number;
  activeZones: ResonatorZoneId[];
  zoneNames: string[];
  accentColor: string;
  anchor3D: [number, number, number];
  physiology: string;
  sensation: string;
  usage: string;
}

export const VOCAL_ATLAS_TECHNIQUES: VocalTechniqueInfo[] = [
  {
    id: 'chest-support',
    title: 'Грудная опора',
    chipLabel: 'Грудная клетка',
    badge: 'НИЖНИЙ РЕЗОНАТОР',
    subtitle: 'Глубина, объём и богатый низ',
    noteLabel: 'Соль малой октавы (G3 • 196 Гц)',
    freqHz: 196.0,
    formantHz: 480,
    airiness: 0.02,
    brightness: 0.48,
    activeZones: ['chest', 'larynx'],
    zoneNames: ['Грудная клетка и трахея', 'Гортань (полное смыкание)'],
    accentColor: '#10B981',
    anchor3D: [0.0, -1.18, 0.35],
    physiology:
      'Голосовые складки работают всей толщиной с низкой частотой смыкания, а грудная клетка и трахея создают глубокий низкочастотный резонанс и устойчивую опору.',
    sensation:
      'Тёплое физическое гудение в центре грудины (ощущается ладонью) и спокойный устойчивый низ.',
    usage: 'Бархатные низы, баритоны, басы, контральто, соул и романсы.',
  },
  {
    id: 'belt',
    title: 'Гортань и бэлт',
    chipLabel: 'Гортань • Бэлт',
    badge: 'МОЩНАЯ СМЫЧКА',
    subtitle: 'Сильная сценическая кульминация',
    noteLabel: 'Ля первой октавы (A4 • 440 Гц)',
    freqHz: 440.0,
    formantHz: 1650,
    airiness: 0.01,
    brightness: 1.0,
    activeZones: ['larynx', 'palate', 'chest'],
    zoneNames: ['Щитовидный хрящ + тванг', 'Нёбный рупор', 'Грудная опора'],
    accentColor: '#F59E0B',
    anchor3D: [0.0, -0.34, 0.36],
    physiology:
      'Плотное, но безопасное смыкание истинных складок, лёгкий наклон перстневидного хряща и узкая настройка надгортанной воронки (тванг), усиливающая голос без крика.',
    sensation:
      'Упругий стержень от нижних рёбер и яркий сфокусированный звон в твёрдом нёбе.',
    usage: 'Кульминации в мюзикле, эстраде, роке и соуле (Lady Gaga, Полина Гагарина).',
  },
  {
    id: 'distortion',
    title: 'Расщепление',
    chipLabel: 'Расщепление',
    badge: 'ЛОЖНЫЕ СКЛАДКИ',
    subtitle: 'Безопасный драйв, дисторшн и рэттл',
    noteLabel: 'Ми первой октавы (E4 • 330 Гц)',
    freqHz: 329.63,
    formantHz: 1550,
    airiness: 0.05,
    brightness: 0.9,
    grit: 0.65,
    activeZones: ['false-folds', 'larynx'],
    zoneNames: ['Ложные (вестибулярные) складки', 'Надгортанник и гортань'],
    accentColor: '#F43F5E',
    anchor3D: [0.0, -0.22, 0.34],
    physiology:
      'Ложные голосовые складки (расположенные чуть выше истинных) мягко сужаются и добавляют равномерную высокочастотную вибрацию, не травмируя основные связки.',
    sensation:
      'Лёгкое контролируемое «щекотание» выше кадыка при абсолютно свободном горле и отсутствии першения.',
    usage: 'Рок-вокал, блюз, экстремальный и эстрадный драйв, эмоциональные надрывы.',
  },
  {
    id: 'subtone',
    title: 'Субтон и глотка',
    chipLabel: 'Нёбо • Субтон',
    badge: 'ВОЗДУШНЫЙ ПОТОК',
    subtitle: 'Мягкое придыхание без зажимов',
    noteLabel: 'До первой октавы (C4 • 262 Гц)',
    freqHz: 261.63,
    formantHz: 680,
    airiness: 0.38,
    brightness: 0.35,
    activeZones: ['palate', 'larynx'],
    zoneNames: ['Голосовые складки (мягкое смыкание)', 'Мягкое нёбо и ротовой тракт'],
    accentColor: '#38BDF8',
    anchor3D: [0.0, 0.22, 0.42],
    physiology:
      'Истинные складки смыкаются бережно, оставляя микроскопический воздушный зазор вдоль задней трети — поток воздуха формирует нежный бархатный тембр.',
    sensation:
      'Лёгкое тепло на верхнем нёбе, полностью расслабленная шея и ровный спокойный выдох.',
    usage: 'Интимные куплеты, инди, джаз, поп-баллады (Billie Eilish, Lana Del Rey).',
  },
  {
    id: 'mix',
    title: 'Микст и маска',
    chipLabel: 'Маска • Микст',
    badge: 'ЗОЛОТОЙ БАЛАНС',
    subtitle: 'Бесшовное соединение регистров',
    noteLabel: 'Соль первой октавы (G4 • 392 Гц)',
    freqHz: 392.0,
    formantHz: 1180,
    airiness: 0.04,
    brightness: 0.72,
    activeZones: ['mask', 'palate', 'larynx'],
    zoneNames: ['Носовые пазухи (маска)', 'Нёбный свод', 'Гортань'],
    accentColor: '#E2A856',
    anchor3D: [0.0, 0.48, 0.56],
    physiology:
      'Грудные и перстнещитовидные мышцы перераспределяют натяжение плавно — звуковая волна отражается от твёрдого нёба прямо в переднюю резонансную «маску».',
    sensation:
      'Отчётливая вибрация в скулах, переносице и верхних зубах при лёгкой, подвижной гортани.',
    usage: 'Плавные высокие переходы без перелома голоса в поп-, джаз- и рок-хитах.',
  },
  {
    id: 'head-register',
    title: 'Головной регистр',
    chipLabel: 'Головной купол',
    badge: 'ВЕРХНИЙ ПОЛЁТ',
    subtitle: 'Лёгкий, серебристый и высокий звук',
    noteLabel: 'Ре второй октавы (D5 • 587 Гц)',
    freqHz: 587.33,
    formantHz: 1380,
    airiness: 0.08,
    brightness: 0.58,
    activeZones: ['mask', 'palate'],
    zoneNames: ['Лобные и верхние пазухи', 'Высокий купол мягкого нёба'],
    accentColor: '#A78BFA',
    anchor3D: [0.0, 0.82, 0.36],
    physiology:
      'Голосовые складки вытягиваются и истончаются, колеблясь только тонкими краями, а акустическая энергия фокусируется в верхних пазухах и куполе головы.',
    sensation:
      'Свободная вибрация за переносицей и в верхней части головы, чувство невесомости звука.',
    usage: 'Высокие ноты сопрано и теноров, фальцет, колоратура и академический кроссовер.',
  },
];

export const VOICE_TEST_CONTENT = {
  songs: [
    {
      id: 'kalinka',
      title: 'Калинка-малинка',
      timeSignature: '2/4',
      sections: [
        {
          name: 'Куплет 1 (медленно)',
          key: 'Am',
          bpm: 70,
          notes: [
            { syllable: 'Под ', note: 'E4', duration: 0.5 },
            { syllable: 'со-', note: 'A4', duration: 0.5 },
            { syllable: 'сно-', note: 'C5', duration: 1.0 },
            { syllable: 'ю, ', note: 'B4', duration: 0.5 },
            { syllable: 'под ', note: 'A4', duration: 0.5 },
            { syllable: 'зе-', note: 'G#4', duration: 0.5 },
            { syllable: 'лё-', note: 'B4', duration: 0.5 },
            { syllable: 'но-', note: 'A4', duration: 0.5 },
            { syllable: 'ю ', note: 'E4', duration: 1.5, lineBreak: true },
            { syllable: '', note: null, duration: 0.5 },
            { syllable: 'Спать ', note: 'A4', duration: 0.5 },
            { syllable: 'по-', note: 'B4', duration: 0.5 },
            { syllable: 'ло-', note: 'C5', duration: 0.5 },
            { syllable: 'жи-', note: 'E5', duration: 1.0 },
            { syllable: 'те ', note: 'D5', duration: 0.5 },
            { syllable: 'вы ', note: 'C5', duration: 0.5 },
            { syllable: 'ме-', note: 'B4', duration: 0.5 },
            { syllable: 'ня! ', note: 'A4', duration: 1.5, lineBreak: true },
            { syllable: 'Ай-', note: 'A4', duration: 0.5 },
            { syllable: 'лю-', note: 'D5', duration: 0.5 },
            { syllable: 'ли, ', note: 'F5', duration: 0.5 },
            { syllable: 'лю-', note: 'E5', duration: 0.5 },
            { syllable: 'ли, ', note: 'D5', duration: 1.0 },
            { syllable: 'ай-', note: 'C5', duration: 0.5 },
            { syllable: 'лю-', note: 'B4', duration: 0.5 },
            { syllable: 'ли, ', note: 'C5', duration: 0.5 },
            { syllable: 'лю-', note: 'B4', duration: 0.5 },
            { syllable: 'ли, ', note: 'A4', duration: 1.0, lineBreak: true },
            { syllable: '', note: null, duration: 0.5 },
            { syllable: 'Спать ', note: 'D5', duration: 0.5 },
            { syllable: 'по-', note: 'C5', duration: 0.5 },
            { syllable: 'ло-', note: 'B4', duration: 0.5 },
            { syllable: 'жи-', note: 'A4', duration: 0.5 },
            { syllable: 'те ', note: 'G#4', duration: 0.5 },
            { syllable: 'вы ', note: 'B4', duration: 0.5 },
            { syllable: 'ме-', note: 'G#4', duration: 0.5 },
            { syllable: 'ня! ', note: 'A4', duration: 1.5 },
            { syllable: '', note: null, duration: 0.5 },
          ],
        },
        {
          name: 'Припев (быстро)',
          key: 'C',
          bpm: 140,
          notes: [
            { syllable: 'Ка-', note: 'E5', duration: 1.0 },
            { syllable: 'лин-', note: 'D5', duration: 0.5 },
            { syllable: 'ка, ', note: 'B4', duration: 0.5 },
            { syllable: 'ка-', note: 'C5', duration: 0.5 },
            { syllable: 'лин-', note: 'D5', duration: 0.5 },
            { syllable: 'ка, ', note: 'B4', duration: 1.0 },
            { syllable: 'ка-', note: 'C5', duration: 0.5 },
            { syllable: 'лин-', note: 'D5', duration: 0.5 },
            { syllable: 'ка ', note: 'E5', duration: 0.5 },
            { syllable: 'мо-', note: 'D5', duration: 0.5 },
            { syllable: 'я! ', note: 'C5', duration: 1.0, lineBreak: true },
            { syllable: '', note: null, duration: 1.0 },
            { syllable: 'В са-', note: 'G4', duration: 0.25 },
            { syllable: 'ду ', note: 'C5', duration: 0.25 },
            { syllable: 'я-', note: 'E5', duration: 0.5 },
            { syllable: 'го-', note: 'D5', duration: 0.5 },
            { syllable: 'да ', note: 'B4', duration: 0.5 },
            { syllable: 'ма-', note: 'C5', duration: 0.5 },
            { syllable: 'лин-', note: 'D5', duration: 0.5 },
            { syllable: 'ка, ', note: 'B4', duration: 1.0 },
            { syllable: 'ма-', note: 'C5', duration: 0.5 },
            { syllable: 'лин-', note: 'D5', duration: 0.5 },
            { syllable: 'ка ', note: 'E5', duration: 0.5 },
            { syllable: 'мо-', note: 'D5', duration: 0.5 },
            { syllable: 'я!', note: 'C5', duration: 1.0 },
            { syllable: '', note: null, duration: 1.0 },
          ],
        },
      ],
    },
    {
      id: 'vo-pole-bereza',
      title: 'Во поле берёза стояла',
      timeSignature: '2/4',
      sections: [
        {
          name: 'Куплет 1',
          key: 'Dm',
          bpm: 100,
          notes: [
            { syllable: 'Во ', note: 'A4', duration: 0.5 },
            { syllable: 'по-', note: 'A4', duration: 0.5 },
            { syllable: 'ле ', note: 'A4', duration: 0.5 },
            { syllable: 'бе-', note: 'A4', duration: 0.5 },
            { syllable: 'рё-', note: 'G4', duration: 1.0 },
            { syllable: 'за ', note: 'F4', duration: 0.5 },
            { syllable: 'сто-', note: 'F4', duration: 0.5 },
            { syllable: 'я-', note: 'E4', duration: 1.0 },
            { syllable: 'ла, ', note: 'D4', duration: 1.0, lineBreak: true },
            { syllable: 'Во ', note: 'A4', duration: 0.5 },
            { syllable: 'по-', note: 'A4', duration: 0.5 },
            { syllable: 'ле ', note: 'A4', duration: 0.5 },
            { syllable: 'куд-', note: 'A4', duration: 0.5 },
            { syllable: 'ря-', note: 'G4', duration: 0.5 },
            { syllable: 'ва-', note: 'G4', duration: 0.5 },
            { syllable: 'я ', note: 'F4', duration: 0.5 },
            { syllable: 'сто-', note: 'F4', duration: 0.5 },
            { syllable: 'я-', note: 'E4', duration: 1.0 },
            { syllable: 'ла. ', note: 'D4', duration: 1.0 },
          ],
        },
        {
          name: 'Припев',
          key: 'Dm',
          bpm: 100,
          notes: [
            { syllable: 'Лю-', note: 'A4', duration: 0.5 },
            { syllable: 'ли, ', note: 'A4', duration: 0.5 },
            { syllable: 'лю-', note: 'G4', duration: 0.5 },
            { syllable: 'ли, ', note: 'F4', duration: 0.5 },
            { syllable: 'сто-', note: 'E4', duration: 0.5 },
            { syllable: 'я-', note: 'E4', duration: 0.5 },
            { syllable: 'ла, ', note: 'D4', duration: 1.0, lineBreak: true },
            { syllable: 'Лю-', note: 'A4', duration: 0.5 },
            { syllable: 'ли, ', note: 'A4', duration: 0.5 },
            { syllable: 'лю-', note: 'G4', duration: 0.5 },
            { syllable: 'ли, ', note: 'F4', duration: 0.5 },
            { syllable: 'сто-', note: 'E4', duration: 0.5 },
            { syllable: 'я-', note: 'E4', duration: 0.5 },
            { syllable: 'ла.', note: 'D4', duration: 1.0 },
          ],
        },
      ],
    },
    {
      id: 'oy-moroz',
      title: 'Ой, мороз, мороз',
      timeSignature: '3/4',
      sections: [
        {
          name: 'Куплет 1',
          key: 'Am',
          bpm: 80,
          notes: [
            { syllable: 'Ой, ', note: 'E4', duration: 1.0 },
            { syllable: 'мо-', note: 'A4', duration: 1.0 },
            { syllable: 'роз, ', note: 'A4', duration: 1.0 },
            { syllable: 'мо-', note: 'B4', duration: 1.0 },
            { syllable: 'роз, ', note: 'C5', duration: 2.0, lineBreak: true },
            { syllable: 'Не ', note: 'C5', duration: 1.0 },
            { syllable: 'мо-', note: 'D5', duration: 1.0 },
            { syllable: 'розь ', note: 'E5', duration: 1.0 },
            { syllable: 'ме-', note: 'D5', duration: 1.5 },
            { syllable: '', note: 'C5', duration: 0.5 },
            { syllable: 'ня, ', note: 'B4', duration: 1.0, lineBreak: true },
            { syllable: 'Не ', note: 'B4', duration: 1.0 },
            { syllable: 'мо-', note: 'C5', duration: 1.0 },
            { syllable: 'розь ', note: 'D5', duration: 1.0 },
            { syllable: 'ме-', note: 'C5', duration: 1.5 },
            { syllable: '', note: 'B4', duration: 0.5 },
            { syllable: 'ня, ', note: 'A4', duration: 1.0, lineBreak: true },
            { syllable: 'Мо-', note: 'A4', duration: 1.0 },
            { syllable: 'е-', note: 'B4', duration: 1.0 },
            { syllable: 'го ', note: 'C5', duration: 1.0 },
            { syllable: 'ко-', note: 'B4', duration: 1.5 },
            { syllable: '', note: 'G#4', duration: 0.5 },
            { syllable: 'ня.', note: 'A4', duration: 1.0 },
          ],
        },
      ],
    },
    {
      id: 'cherny-voron',
      title: 'Чёрный ворон',
      timeSignature: '3/4',
      sections: [
        {
          name: 'Куплет 1',
          key: 'Am',
          bpm: 75,
          notes: [
            { syllable: 'Чёр-', note: 'A4', duration: 2.0 },
            { syllable: 'ный ', note: 'B4', duration: 1.0 },
            { syllable: 'во-', note: 'C5', duration: 1.5 },
            { syllable: '', note: 'B4', duration: 0.5 },
            { syllable: 'рон, ', note: 'A4', duration: 1.0 },
            { syllable: 'что ж ', note: 'C5', duration: 2.0 },
            { syllable: 'ты ', note: 'D5', duration: 1.0 },
            { syllable: 'вьёшь-', note: 'E5', duration: 1.5 },
            { syllable: '', note: 'D5', duration: 0.5 },
            { syllable: 'ся ', note: 'C5', duration: 1.0, lineBreak: true },
            { syllable: 'Над ', note: 'E5', duration: 2.0 },
            { syllable: 'мо-', note: 'D5', duration: 1.0 },
            { syllable: 'е-', note: 'C5', duration: 1.5 },
            { syllable: '', note: 'B4', duration: 0.5 },
            { syllable: 'ю ', note: 'A4', duration: 1.0 },
            { syllable: 'го-', note: 'B4', duration: 2.0 },
            { syllable: 'ло-', note: 'G#4', duration: 1.0 },
            { syllable: 'вой? ', note: 'A4', duration: 2.0, lineBreak: true },
            { syllable: '', note: null, duration: 1.0 },
            { syllable: 'Ты ', note: 'C5', duration: 2.0 },
            { syllable: 'до-', note: 'D5', duration: 1.0 },
            { syllable: 'бы-', note: 'E5', duration: 1.5 },
            { syllable: '', note: 'F5', duration: 0.5 },
            { syllable: 'чи ', note: 'E5', duration: 1.0 },
            { syllable: 'не ', note: 'D5', duration: 2.0 },
            { syllable: 'до-', note: 'C5', duration: 1.0 },
            { syllable: 'ждёшь-', note: 'D5', duration: 1.5 },
            { syllable: '', note: 'C5', duration: 0.5 },
            { syllable: 'ся, ', note: 'B4', duration: 1.0, lineBreak: true },
            { syllable: 'Чёр-', note: 'E5', duration: 2.0 },
            { syllable: 'ный ', note: 'D5', duration: 1.0 },
            { syllable: 'во-', note: 'C5', duration: 1.5 },
            { syllable: '', note: 'B4', duration: 0.5 },
            { syllable: 'рон, ', note: 'A4', duration: 1.0 },
            { syllable: 'я ', note: 'B4', duration: 2.0 },
            { syllable: 'не ', note: 'G#4', duration: 1.0 },
            { syllable: 'твой!', note: 'A4', duration: 2.0 },
            { syllable: '', note: null, duration: 1.0 },
          ],
        },
      ],
    },
    {
      id: 'valenki',
      title: 'Валенки',
      timeSignature: '2/4',
      sections: [
        {
          name: 'Припев',
          key: 'Am',
          bpm: 125,
          notes: [
            { syllable: 'Ва-', note: 'E5', duration: 0.5 },
            { syllable: 'лен-', note: 'E5', duration: 0.5 },
            { syllable: 'ки, ', note: 'D5', duration: 0.5 },
            { syllable: 'да ', note: 'C5', duration: 0.5 },
            { syllable: 'ва-', note: 'B4', duration: 0.5 },
            { syllable: 'лен-', note: 'C5', duration: 0.5 },
            { syllable: 'ки, ', note: 'D5', duration: 0.5 },
            { syllable: 'ой, ', note: 'B4', duration: 0.5, lineBreak: true },
            { syllable: 'да ', note: 'C5', duration: 0.5 },
            { syllable: 'не ', note: 'B4', duration: 0.5 },
            { syllable: 'под-', note: 'A4', duration: 0.5 },
            { syllable: 'ши-', note: 'G#4', duration: 0.5 },
            { syllable: 'ты, ', note: 'A4', duration: 0.5 },
            { syllable: 'ста-', note: 'B4', duration: 0.5 },
            { syllable: 'рень-', note: 'C5', duration: 0.5 },
            { syllable: 'ки! ', note: 'A4', duration: 0.5 },
          ],
        },
        {
          name: 'Куплет 1',
          key: 'Am',
          bpm: 125,
          notes: [
            { syllable: 'Нель-', note: 'E5', duration: 0.5 },
            { syllable: 'зя ', note: 'E5', duration: 0.5 },
            { syllable: 'ва-', note: 'D5', duration: 0.5 },
            { syllable: 'лен-', note: 'C5', duration: 0.5 },
            { syllable: 'ки ', note: 'B4', duration: 0.5 },
            { syllable: 'по-', note: 'C5', duration: 0.5 },
            { syllable: 'но-', note: 'D5', duration: 0.5 },
            { syllable: 'сить, ', note: 'B4', duration: 0.5, lineBreak: true },
            { syllable: 'нель-', note: 'C5', duration: 0.5 },
            { syllable: 'зя ', note: 'B4', duration: 0.5 },
            { syllable: 'к ми-', note: 'A4', duration: 0.5 },
            { syllable: 'лень-', note: 'G#4', duration: 0.5 },
            { syllable: 'ко-', note: 'A4', duration: 0.5 },
            { syllable: 'му ', note: 'B4', duration: 0.5 },
            { syllable: 'схо-', note: 'C5', duration: 0.5 },
            { syllable: 'дить.', note: 'A4', duration: 0.5 },
          ],
        },
      ],
    },
  ] satisfies KaraokeSong[],
  randomPhrases: [
    '«Ми-я-ма-мо-му» — протяните гласные ровно на одном удобном звуке вверх и вниз.',
    '«Ле-е-е-тит свободный звук от дыхания к небу!» — проговорите нараспев с улыбкой.',
    '«Ма-мэ-ми-мо-му» — спойте мягко, словно качая голос на волне, без напряжения в шее.',
    '«Ба-ра-ба-ра-бу» — лёгкое стаккато и длинное протяжное «А-а-а» на самом комфортном тоне.',
  ],
};

export const REVIEWS_CONTENT = {
  eyebrow: 'Отзывы учеников и родителей',
  title: 'Реальные впечатления о занятиях',
  subtitle:
    'Нажмите на любую карточку или рейтинг, чтобы перейти к отзывам на Яндекс Услугах или Авито.',
  yandexRating: '5.0',
  avitoRating: '5.0',
  items: [
    {
      id: 'rev-1',
      author: 'Сергей Дорофеев',
      date: '14.11.2026',
      platform: 'Яндекс',
      text: 'Выражаю огромную благодарность, Валерии! Педагог с большой буквы, очень располагает к себе. Результат заметен с первого дня обучения! Рекомендую!',
      url: YANDEX_PROFILE_URL,
    },
    {
      id: 'rev-2',
      author: 'Вика Козлова',
      date: '24.07.2026',
      platform: 'Яндекс',
      text: 'Долго мечтала научиться петь правильно. Спасибо огромное Валерии! С первого же занятия удалось снять психологические зажимы. Атмосфера на уроках невероятно теплая и поддерживающая, с ней не страшно ошибиться. За несколько месяцев я не только перестала бояться петь при людях, но и начала чувствовать опору, расширила диапазон и наконец-то поняла, как работает мое дыхание. Рекомендую всем, кто сомневается!',
      url: YANDEX_PROFILE_URL,
    },
    {
      id: 'rev-3',
      author: 'Светлана',
      date: '19 июля 2026',
      platform: 'Авито',
      text: 'Искали педагога, который не будет гнать по шаблону, а учтёт особенности голоса и темперамента ребёнка — нашли! На каждом уроке чувствуется, что подход именно к нашему ребёнку: где-то пошутить, где-то подбодрить, где-то разобрать одну строчку десять раз, пока не получится. Прогресс есть, и главное — ребёнок не теряет интерес к занятиям. Спасибо!',
      url: AVITO_REVIEWS_URL,
    },
    {
      id: 'rev-4',
      author: 'Алена Безуглая',
      date: '20.05.2026',
      platform: 'Яндекс',
      text: 'Валерию нашла на Авито. Необходима была помощь в подготовке к конкурсу. Конкурс прошел, а желание заниматься именно с этим педагогом и открывать новые моменты в вокале явно появилось. Милый, профессиональный человек!!! Посещать ее занятия одно удовольствие. Откроет возможности вашего голоса, о которых и не догадывались. Сложное становится совершенно легким!!!! Однозначно советую!!!',
      url: YANDEX_PROFILE_URL,
    },
    {
      id: 'rev-5',
      author: 'Олеся',
      date: '16 марта 2026',
      platform: 'Авито',
      text: 'Обратилась к Валерии как к специалисту по вокалу и не ошиблась! Мне есть с чем сравнить, Валерия отличный преподаватель. Знает как извлечь из тебя красивый звук. Занятия проходят интересно и главное продуктивно. Рекомендую!',
      url: AVITO_REVIEWS_URL,
    },
    {
      id: 'rev-6',
      author: 'Екатерина',
      date: '1 сентября 2025',
      platform: 'Авито',
      text: 'Валерия прекрасный преподаватель, который любит свое дело 🙏 Заметила прогресс через несколько занятий, но планирую продолжать занятия дальше! Валерия очень внимательна к деталям и особенностям голоса. И очень пунктуальна, всегда вовремя. Педагога советую!',
      url: AVITO_REVIEWS_URL,
    },
    {
      id: 'rev-7',
      author: 'Екатерина',
      date: '05.07.2025',
      platform: 'Яндекс',
      text: 'Валерия замечательный педагог по вокалу! Применяет в своей работе эффективные методики развития голоса и преодоления технических трудностей. Занятия дают ощутимое продвижение в вокальном исполнительском искусстве. Каждое занятие проходит интересно и продуктивно, в лёгкой приятной атмосфере. Большое спасибо за отличное настроение и положительные эмоции!',
      url: YANDEX_PROFILE_URL,
    },
    {
      id: 'rev-8',
      author: 'Наталья',
      date: '23 июня 2025',
      platform: 'Авито',
      text: 'Валерия сразу мне понравилась, с ней было комфортно заниматься с первых минут. За 2 занятия мы подготовили песню для выступления на семейном мероприятии. Упражнения-распевки просто прелесть, очень забавные. Рекомендую 👍',
      url: AVITO_REVIEWS_URL,
    },
  ] satisfies ReviewItem[],
};

export const FAQ_CONTENT = {
  eyebrow: 'Частые вопросы',
  title: 'Ответы на часто задаваемые вопросы',
  items: [
    {
      id: 'faq-1',
      question: 'Я никогда не занимался вокалом. Могу ли я начать с нуля?',
      answer:
        'Конечно! Большинство моих учеников приходят на первый урок вообще без музыкального опыта и знания нот. Занятия вокалом — это работа с мышцами вашего голосового аппарата. Если вы умеете разговаривать, кричать, извлекать звуки, то для вокальной работы у вас уже всё есть.',
    },
    {
      id: 'faq-2',
      question: 'Какого возраста ученики у Вас обучаются? Не поздно ли мне начинать?',
      answer:
        'Начинать не поздно ни в 20, ни в 40, ни в 60 лет. Голосовые складки — это мышцы, которые откликаются на грамотную тренировку в любом возрасте. У взрослых учеников даже есть большое преимущество: вы лучше чувствуете свое тело, осознанно воспринимаете задачи и понимаете, какого именно звучания хотите добиться, поэтому прогресс часто идет очень быстро.',
    },
    {
      id: 'faq-3',
      question: 'Какое расписание занятий? Смогу ли я подобрать удобное время?',
      answer:
        'Мы составляем расписание индивидуально. Я преподаю в утренние, дневные и вечерние часы, можно подобрать комфортное «окно» под ваш рабочий или учебный график. Для тех, кто живет в плотном ритме или часто бывает в разъездах, отлично подходит онлайн-формат, который экономит время на дорогу.',
    },
    {
      id: 'faq-4',
      question: 'Я хочу петь, но стесняюсь и не уверен(а) в своих силах.',
      answer:
        'Это совершенно естественное чувство, ведь голос напрямую связан с нашими эмоциями и психологическим комфортом. Мы занимаемся один на один в спокойной, поддерживающей атмосфере. Шаг за шагом вы привыкаете к своему звучанию и обретаете уверенность.',
    },
    {
      id: 'faq-5',
      question: 'Мне кажется, что у меня совсем нет слуха и голоса.',
      answer:
        'Природное отсутствие музыкального слуха встречается крайне редко. В 95% случаев «непопадание в ноты» — это не проблема со слухом, а просто неналаженная координация между слухом и голосовыми складками, а также мышечные зажимы в гортани.',
    },
    {
      id: 'faq-6',
      question: 'Как проходит занятие?',
      answer:
        'Стандартный урок (60 минут) состоит из трех частей:\n1. Настройка и распевка (15-20 минут): мягко разогреваем связки, снимаем зажимы с шеи и челюсти, работаем над дыханием, опорой и расширением диапазона, вокальными украшениями.\n2. Работа над репертуаром (35-40 минут): разбираем композицию, которую вы выбрали сами (или подобрали вместе), работаем над тембром, высокими нотами, дикцией и эмоциональной подачей.\n3. Обратная связь и план: подводим итоги урока.',
    },
    {
      id: 'faq-7',
      question: 'Через сколько занятий я увижу первый результат?',
      answer:
        'Первые физические ощущения — что голос стал звучать свободнее, пропало першение или зажим на высоких нотах — обычно появляются уже после 2-3 уроков. Уверенное владение голосом, расширение диапазона и стабильное чистое исполнение первых песен формируются за 2-3 месяца регулярных занятий (1-2 раза в неделю). Все зависит от вашего уровня подготовки, регулярности занятий и целей, которые вы перед собой ставите.',
    },
  ] satisfies FaqItem[],
};

export const CONTACTS_CONTENT = {
  eyebrow: 'Контакты и запись',
  title: 'Начните путь к свободному голосу',
  subtitle:
    'Выберите удобный способ связи или постройте маршрут до студии — я отвечу лично, помогу подобрать время и расскажу все детали занятий.',
  socialLinks: [
    {
      id: 'youtube',
      label: 'YouTube',
      href: 'https://www.youtube.com/',
      handle: 'Выступления и разборы (скоро ссылка)',
    },
    {
      id: 'rutube',
      label: 'Rutube',
      href: 'https://rutube.ru/',
      handle: 'Видеоуроки и концерты (скоро ссылка)',
    },
  ] satisfies SocialLink[],
};
