
export const examplePrompts: { title: string, prompt: string }[] = [
  { title: "E-commerce for sports equipment", prompt: "Create a modern e-commerce platform for selling sports equipment with product categories, search functionality, user reviews, and secure checkout" },
  { title: "Tech blog platform", prompt: "Build a responsive blog platform for tech enthusiasts with article categories, comment system, and user authentication" },
  { title: "Pet social network", prompt: "Develop a social media platform for pet lovers with profiles, photo sharing, and pet meetup events" },
  { title: "SaaS analytics dashboard", prompt: "Design an intuitive dashboard for my SaaS product with user metrics, revenue tracking, and customizable widgets" },
  { title: "Note-taking app backend", prompt: "Create a scalable backend for a note-taking app with user authentication, note organization, and real-time syncing" },
]


export const jwtConfig = {
  secret: new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET ?? 'secret'),
}
export const WORK_DIR_NAME = 'app';
export const WORK_DIR = `/home/${WORK_DIR_NAME}`;
export const MODIFICATIONS_TAG_NAME = 'bolt_file_modifications';

export const allowedHTMLElements = [
  'a',
  'b',
  'blockquote',
  'br',
  'code',
  'dd',
  'del',
  'details',
  'div',
  'dl',
  'dt',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'ins',
  'kbd',
  'li',
  'ol',
  'p',
  'pre',
  'q',
  'rp',
  'rt',
  'ruby',
  's',
  'samp',
  'source',
  'span',
  'strike',
  'strong',
  'sub',
  'summary',
  'sup',
  'table',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'tr',
  'ul',
  'var',
];