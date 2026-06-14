/**
 * @file jdParser.js
 * @description Extracts and normalizes roles, experience, and technical skills from job description text.
 * @module analytics/jdParser
 */

/**
 * Dictionary of technical skill aliases mapped to their normalized names.
 * Covers popular languages, libraries, frameworks, databases, cloud providers, and tools.
 * @constant {Object.<string, string>}
 */
export const SKILL_DICTIONARY = {
  // ── Frontend Frameworks ────────────────────────────────────────────────────
  "react":           "React",
  "reactjs":         "React",
  "react.js":        "React",
  "vue":             "Vue.js",
  "vuejs":           "Vue.js",
  "vue.js":          "Vue.js",
  "angular":         "Angular",
  "angularjs":       "Angular",
  "nextjs":          "Next.js",
  "next.js":         "Next.js",
  "svelte":          "Svelte",
  "sveltekit":       "Svelte",
  "nuxt":            "Vue.js",
  "nuxtjs":          "Vue.js",
  "astro":           "Astro",
  "remix":           "Remix",
  "qwik":            "Qwik",
  "solidjs":         "SolidJS",
  "solid.js":        "SolidJS",

  // ── Styling ────────────────────────────────────────────────────────────────
  "tailwind":        "Tailwind CSS",
  "tailwindcss":     "Tailwind CSS",
  "html":            "HTML5",
  "html5":           "HTML5",
  "css":             "CSS3",
  "css3":            "CSS3",
  "sass":            "Sass",
  "scss":            "Sass",
  "styled-components": "CSS3",
  "emotion":         "CSS3",
  "bootstrap":       "Bootstrap",
  "material ui":     "Material UI",
  "mui":             "Material UI",
  "chakra ui":       "Chakra UI",
  "shadcn":          "Tailwind CSS",
  "antd":            "React",
  "ant design":      "React",

  // ── State Management ────────────────────────────────────────────────────────
  "redux":           "Redux",
  "zustand":         "Zustand",
  "jotai":           "Jotai",
  "recoil":          "Recoil",
  "mobx":            "MobX",
  "pinia":           "Vue.js",
  "xstate":          "XState",

  // ── Build Tools ─────────────────────────────────────────────────────────────
  "webpack":         "Webpack",
  "vite":            "Vite",
  "esbuild":         "Vite",
  "rollup":          "Webpack",
  "parcel":          "Webpack",
  "turbopack":       "Webpack",
  "nx":              "Nx",
  "turborepo":       "Turborepo",

  // ── Backend & Runtime ───────────────────────────────────────────────────────
  "node":            "Node.js",
  "nodejs":          "Node.js",
  "node.js":         "Node.js",
  "express":         "Express",
  "expressjs":       "Express",
  "express.js":      "Express",
  "nestjs":          "NestJS",
  "nest.js":         "NestJS",
  "fastify":         "Fastify",
  "hono":            "Node.js",
  "koa":             "Node.js",
  "trpc":            "tRPC",
  "django":          "Django",
  "flask":           "Flask",
  "fastapi":         "FastAPI",
  "spring":          "Spring Boot",
  "spring boot":     "Spring Boot",
  "laravel":         "Laravel",
  "rails":           "Ruby on Rails",
  "ruby on rails":   "Ruby on Rails",
  "gin":             "Go",
  "fiber":           "Go",
  "echo":            "Go",
  "actix":           "Rust",
  "axum":            "Rust",

  // ── Languages ───────────────────────────────────────────────────────────────
  "javascript":      "JavaScript",
  "js":              "JavaScript",
  "typescript":      "TypeScript",
  "ts":              "TypeScript",
  "python":          "Python",
  "ruby":            "Ruby",
  "php":             "PHP",
  "golang":          "Go",
  "go":              "Go",
  "rust":            "Rust",
  "java":            "Java",
  "c++":             "C++",
  "cpp":             "C++",
  "c#":              "C#",
  "csharp":          "C#",
  "swift":           "Swift",
  "kotlin":          "Kotlin",
  "dart":            "Dart",
  "scala":           "Scala",
  "elixir":          "Elixir",
  "haskell":         "Haskell",
  "r":               "R",
  "matlab":          "MATLAB",
  "bash":            "Bash",
  "shell":           "Bash",
  "powershell":      "Bash",

  // ── Databases ───────────────────────────────────────────────────────────────
  "mongodb":         "MongoDB",
  "mongo":           "MongoDB",
  "mongodb atlas":   "MongoDB",
  "postgres":        "PostgreSQL",
  "postgresql":      "PostgreSQL",
  "mysql":           "MySQL",
  "mariadb":         "MySQL",
  "redis":           "Redis",
  "sqlite":          "SQLite",
  "dynamodb":        "DynamoDB",
  "cassandra":       "Cassandra",
  "supabase":        "PostgreSQL",
  "planetscale":     "MySQL",
  "cockroachdb":     "PostgreSQL",
  "firebase":        "Firebase",
  "firestore":       "Firebase",
  "neo4j":           "Neo4j",
  "elasticsearch":   "Elasticsearch",

  // ── ORM / Query Builders ────────────────────────────────────────────────────
  "prisma":          "Prisma",
  "drizzle":         "Prisma",
  "typeorm":         "TypeScript",
  "sequelize":       "Node.js",
  "mongoose":        "MongoDB",
  "sqlalchemy":      "Python",
  "peewee":          "Python",

  // ── Cloud & DevOps ──────────────────────────────────────────────────────────
  "aws":             "AWS",
  "amazon web services": "AWS",
  "s3":              "AWS",
  "lambda":          "AWS",
  "ec2":             "AWS",
  "gcp":             "Google Cloud",
  "google cloud":    "Google Cloud",
  "azure":           "Azure",
  "docker":          "Docker",
  "kubernetes":      "Kubernetes",
  "k8s":             "Kubernetes",
  "terraform":       "Terraform",
  "ansible":         "Ansible",
  "jenkins":         "Jenkins",
  "github actions":  "GitHub Actions",
  "gitlab ci":       "GitLab CI",
  "circleci":        "CI/CD",
  "ci/cd":           "CI/CD",
  "nginx":           "Nginx",
  "linux":           "Linux",
  "vercel":          "Vercel",
  "netlify":         "Netlify",
  "heroku":          "Heroku",
  "cloudflare":      "Cloudflare",

  // ── Real-time & Messaging ───────────────────────────────────────────────────
  "socket.io":       "WebSockets",
  "websocket":       "WebSockets",
  "websockets":      "WebSockets",
  "kafka":           "Kafka",
  "rabbitmq":        "RabbitMQ",
  "pubsub":          "WebSockets",
  "mqtt":            "IoT",
  "grpc":            "gRPC",

  // ── Testing ─────────────────────────────────────────────────────────────────
  "jest":            "Testing",
  "vitest":          "Testing",
  "mocha":           "Testing",
  "chai":            "Testing",
  "cypress":         "Testing",
  "playwright":      "Testing",
  "selenium":        "Testing",
  "pytest":          "Testing",
  "junit":           "Testing",
  "rspec":           "Testing",

  // ── Architectures & APIs ───────────────────────────────────────────────────
  "graphql":         "GraphQL",
  "apollo":          "GraphQL",
  "git":             "Git",
  "rest":            "REST API",
  "rest api":        "REST API",
  "restful":         "REST API",
  "openapi":         "REST API",
  "swagger":         "REST API",

  // ── Mobile ─────────────────────────────────────────────────────────────────
  "react native":    "React Native",
  "react-native":    "React Native",
  "flutter":         "Flutter",
  "expo":            "React Native",
  "ionic":           "Ionic",
  "capacitor":       "Ionic",

  // ── SaaS APIs & Payments ───────────────────────────────────────────────────
  "stripe":          "Stripe",
  "twilio":          "Twilio",
  "sendgrid":        "SendGrid",
  "auth0":           "Auth0",
  "clerk":           "Auth0",
  "supabase auth":   "Auth0",

  // ── AI / ML ────────────────────────────────────────────────────────────────
  "tensorflow":      "TensorFlow",
  "pytorch":         "PyTorch",
  "torch":           "PyTorch",
  "scikit-learn":    "Python",
  "sklearn":         "Python",
  "openai":          "AI/ML",
  "langchain":       "AI/ML",
  "huggingface":     "AI/ML",
  "pandas":          "Python",
  "numpy":           "Python",
};

/**
 * Parses the raw Job Description text to extract role title, experience requirements, and normalized skills.
 * 
 * @param {string} jdText - The raw Job Description text.
 * @returns {Object} Extracted job details containing role, experience, and skills array.
 */
export function parseJobDescription(jdText) {
  if (!jdText || typeof jdText !== 'string') {
    return {
      role: "Unknown Role",
      experience: "Not Specified",
      skills: []
    };
  }

  // Clean lines for structural analysis
  const lines = jdText.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);

  // 1. Extract Role (use first line if it's reasonably short, otherwise fallback)
  let role = "Unknown Role";
  if (lines.length > 0 && lines[0].length < 80) {
    role = lines[0];
  } else {
    // Regex fallback for common role structures
    const roleRegex = /((?:Senior|Junior|Lead|Principal|Associate)?\s*(?:Full\s*Stack|Frontend|Backend|Software|DevOps|Data|Cloud|Systems)\s*(?:Developer|Engineer|Architect|Specialist))/i;
    const match = jdText.match(roleRegex);
    if (match) {
      role = match[1].trim();
    }
  }

  // 2. Extract Experience (regex search for patterns like "3+ years", "5 yrs", etc.)
  let experience = "Not Specified";
  const expRegex = /(\b\d+(?:-\d+)?\+?\s*(?:years?|yrs?)(?:\s*(?:of\s*)?experience)?)/i;
  const expMatch = jdText.match(expRegex);
  if (expMatch) {
    experience = expMatch[1].trim();
  }

  // 3. Extract Technical Skills using the skill dictionary
  const foundSkills = new Set();
  for (const [alias, normalizedName] of Object.entries(SKILL_DICTIONARY)) {
    const escapedKey = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match the alias surrounded by non-alphanumeric/non-underscore characters
    const pattern = `(?:^|[^a-zA-Z0-9_])(${escapedKey})(?:$|[^a-zA-Z0-9_+#])`;
    const regex = new RegExp(pattern, 'i');
    
    if (regex.test(jdText)) {
      foundSkills.add(normalizedName);
    }
  }

  return {
    role,
    experience,
    skills: Array.from(foundSkills).sort()
  };
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================
/*
const rawJD = `
Senior Full Stack Developer

Required Skills:
* React and NestJS
* Node.js / TypeScript
* MongoDB Atlas
* Docker & AWS configuration

Experience:
3+ years of experience in product development.
`;

const parsedJob = parseJobDescription(rawJD);
console.log(parsedJob);
// Output:
// {
//   role: 'Senior Full Stack Developer',
//   experience: '3+ years of experience',
//   skills: [ 'AWS', 'Docker', 'JavaScript', 'MongoDB', 'NestJS', 'Node.js', 'React', 'TypeScript' ]
// }
*/
