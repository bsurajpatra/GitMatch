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
  // Frontend
  "react": "React",
  "reactjs": "React",
  "react.js": "React",
  "vue": "Vue.js",
  "vuejs": "Vue.js",
  "vue.js": "Vue.js",
  "angular": "Angular",
  "angularjs": "Angular",
  "nextjs": "Next.js",
  "next.js": "Next.js",
  "svelte": "Svelte",
  "tailwind": "Tailwind CSS",
  "tailwindcss": "Tailwind CSS",
  "html": "HTML5",
  "html5": "HTML5",
  "css": "CSS3",
  "css3": "CSS3",
  "sass": "Sass",
  "scss": "Sass",
  "webpack": "Webpack",
  "vite": "Vite",
  "redux": "Redux",

  // Backend & Runtime
  "node": "Node.js",
  "nodejs": "Node.js",
  "node.js": "Node.js",
  "express": "Express",
  "expressjs": "Express",
  "express.js": "Express",
  "nestjs": "NestJS",
  "nest.js": "NestJS",
  "django": "Django",
  "flask": "Flask",
  "fastapi": "FastAPI",
  "spring": "Spring Boot",
  "spring boot": "Spring Boot",
  "laravel": "Laravel",
  "rails": "Ruby on Rails",
  "ruby on rails": "Ruby on Rails",

  // Languages
  "javascript": "JavaScript",
  "js": "JavaScript",
  "typescript": "TypeScript",
  "ts": "TypeScript",
  "python": "Python",
  "ruby": "Ruby",
  "php": "PHP",
  "golang": "Go",
  "go": "Go",
  "rust": "Rust",
  "java": "Java",
  "c++": "C++",
  "cpp": "C++",
  "c#": "C#",
  "csharp": "C#",
  "swift": "Swift",
  "kotlin": "Kotlin",
  "bash": "Bash",
  "shell": "Bash",

  // Databases
  "mongodb": "MongoDB",
  "mongo": "MongoDB",
  "mongodb atlas": "MongoDB",
  "postgres": "PostgreSQL",
  "postgresql": "PostgreSQL",
  "mysql": "MySQL",
  "redis": "Redis",
  "sqlite": "SQLite",
  "dynamodb": "DynamoDB",
  "cassandra": "Cassandra",

  // Cloud & DevOps
  "aws": "AWS",
  "amazon web services": "AWS",
  "gcp": "Google Cloud",
  "google cloud": "Google Cloud",
  "azure": "Azure",
  "docker": "Docker",
  "kubernetes": "Kubernetes",
  "k8s": "Kubernetes",
  "terraform": "Terraform",
  "jenkins": "Jenkins",
  "github actions": "GitHub Actions",

  // Architectures & APIs
  "graphql": "GraphQL",
  "git": "Git",
  "rest": "REST API",
  "rest api": "REST API",
  "restful": "REST API"
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
