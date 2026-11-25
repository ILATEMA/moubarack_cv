export const SITE = {
  email: 'moubarackilatem@gmail.com',
  whatsapp: '2290169892699',
  whatsappDisplay: '+229 01 69 89 26 99',
};

export const SITES = [
  { id: 'hotel', n: '01', url: 'https://hotel-paradisia-6wof.vercel.app', host: 'hotel-paradisia-6wof.vercel.app' },
  { id: 'restaurant', n: '02', url: 'https://splendorous-frangollo-0917b4.netlify.app/', host: 'splendorous-frangollo-0917b4.netlify.app' },
];

export const APPS = [
  { id: 'event', n: '03', driveId: '1C-EIBQfgJtmF9cySFndc2IkrkYg_8e_c' },
  { id: 'commercial', n: '04', driveId: '1lxqudhNvqoITkPawP8rvmYGKX4y8DTaz' },
  { id: 'bus', n: '05', driveId: '15-SztEFpetthDUKls3DIlMHr4-Hp1gIs' },
  { id: 'school', n: '06', driveId: '1aD_YDItnPdmNbaBQd5L-V38PSaoP5-qQ' },
];

export const SKILLS = [
  {
    id: 'mastered',
    items: [
      { abbr: 'JV', name: 'Java', level: 4 },
      { abbr: 'PHP', name: 'PHP & MySQL', level: 4 },
      { abbr: 'JS', name: 'JavaScript', level: 4 },
      { abbr: 'SB', name: 'Spring Boot', level: 4 },
      { abbr: 'RE', name: 'React', level: 4 },
      { abbr: 'NS', name: 'NestJS', level: 4 },
      { abbr: 'UM', name: 'UML & Merise', level: 4 },
      { abbr: 'EL', name: { fr: 'Electron (desktop)', en: 'Electron (desktop)' }, level: 4 },
    ],
  },
  {
    id: 'explored',
    items: [
      { abbr: 'C', name: 'C', level: 3 },
      { abbr: 'C++', name: 'C++', level: 3 },
      { abbr: 'PY', name: { fr: 'Python (web)', en: 'Python (web)' }, level: 3 },
      { abbr: 'FL', name: 'Flutter · Dart', level: 3 },
      { abbr: 'LV', name: 'Laravel', level: 3 },
    ],
  },
  {
    id: 'learning',
    items: [
      { abbr: 'ML', name: 'Machine Learning', level: 2 },
      { abbr: 'DB', name: { fr: 'Administration de bases de données', en: 'Database administration' }, level: 2 },
    ],
  },
  {
    id: 'bonus',
    items: [
      { abbr: 'AI', name: { fr: 'IA & productivité', en: 'AI & productivity' }, level: 4 },
      { abbr: 'VD', name: { fr: 'Montage vidéo', en: 'Video editing' }, level: 3 },
      { abbr: 'DS', name: 'Design', level: 3 },
      { abbr: 'NW', name: { fr: 'Réseaux · Cisco Packet Tracer', en: 'Networking · Cisco Packet Tracer' }, level: 3 },
      { abbr: 'DO', name: 'DevOps', level: 3 },
    ],
  },
];

export const MARQUEE = [
  'Java', 'Spring Boot', 'React', 'NestJS', 'JavaScript', 'PHP', 'MySQL', 'Electron',
  'Flutter', 'Laravel', 'Python', 'C / C++', 'UML', 'Merise', 'Machine Learning', 'DevOps',
];

export const GUIDE_STEPS = [
  { key: 'guide.s0', target: '#start .cta .btn-primary' },
  { key: 'guide.s1', target: '#levels a[data-sec="2"]' },
  { key: 'guide.s2', target: '#levels a[data-sec="3"]' },
  { key: 'guide.s3', target: '#projets .site-btn' },
  { key: 'guide.s4', target: '#submitBtn' },
];
