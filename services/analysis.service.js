/**
 * @file analysis.service.js
 * @description Core service coordinating user profile fetching, background worker thread analysis, and formatting.
 * @module services/analysis.service
 */

import GitHubService from './github.service.js';
import { Worker } from 'worker_threads';
import path from 'path';
import { fileURLToPath } from 'url';
import { formatAnalysisResult } from '../analytics/resultFormatter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Dependency → Skill mapping
// Maps package/module names from popular package managers to normalized skills
// ============================================================================
const DEP_TO_SKILL = {
  // React ecosystem
  "react": "React",
  "react-dom": "React",
  "react-router": "React",
  "react-router-dom": "React",
  "react-scripts": "React",
  "create-react-app": "React",
  "@testing-library/react": "React",
  "react-query": "React",
  "react-hook-form": "React",
  "react-redux": "Redux",
  "@reduxjs/toolkit": "Redux",
  "redux": "Redux",
  "redux-saga": "Redux",
  "redux-thunk": "Redux",

  // Next.js
  "next": "Next.js",

  // Vue ecosystem
  "vue": "Vue.js",
  "@vue/cli": "Vue.js",
  "nuxt": "Vue.js",

  // Angular ecosystem
  "@angular/core": "Angular",
  "@angular/cli": "Angular",

  // Svelte
  "svelte": "Svelte",
  "@sveltejs/kit": "Svelte",

  // Styling
  "sass": "Sass",
  "node-sass": "Sass",
  "tailwindcss": "Tailwind CSS",
  "@tailwindcss/forms": "Tailwind CSS",

  // Build tools
  "webpack": "Webpack",
  "webpack-cli": "Webpack",
  "vite": "Vite",
  "@vitejs/plugin-react": "Vite",

  // Backend - Node.js
  "express": "Express",
  "express-validator": "Express",
  "koa": "Node.js",
  "fastify": "Node.js",
  "hapi": "Node.js",
  "@nestjs/core": "NestJS",
  "@nestjs/common": "NestJS",
  "nest": "NestJS",

  // GraphQL
  "graphql": "GraphQL",
  "apollo-server": "GraphQL",
  "@apollo/server": "GraphQL",
  "@apollo/client": "GraphQL",
  "graphql-yoga": "GraphQL",
  "type-graphql": "GraphQL",

  // TypeScript
  "typescript": "TypeScript",
  "ts-node": "TypeScript",
  "ts-jest": "TypeScript",
  "@types/node": "TypeScript",

  // Databases - MongoDB
  "mongoose": "MongoDB",
  "mongodb": "MongoDB",

  // Databases - SQL / PostgreSQL
  "pg": "PostgreSQL",
  "pg-hstore": "PostgreSQL",
  "sequelize": "PostgreSQL",
  "typeorm": "PostgreSQL",
  "knex": "PostgreSQL",
  "prisma": "PostgreSQL",
  "@prisma/client": "PostgreSQL",

  // MySQL
  "mysql": "MySQL",
  "mysql2": "MySQL",

  // Redis
  "redis": "Redis",
  "ioredis": "Redis",

  // SQLite
  "better-sqlite3": "SQLite",
  "sqlite3": "SQLite",

  // Cloud / DevOps
  "@aws-sdk/client-s3": "AWS",
  "@aws-sdk/client-dynamodb": "AWS",
  "aws-sdk": "AWS",
  "@google-cloud/storage": "Google Cloud",

  // Testing
  "jest": "JavaScript",
  "mocha": "JavaScript",
  "chai": "JavaScript",

  // HTTP / REST
  "axios": "REST API",
  "node-fetch": "REST API",
  "supertest": "REST API",
  "got": "REST API",

  // Python packages → skills
  "django": "Django",
  "flask": "Flask",
  "fastapi": "FastAPI",
  "sqlalchemy": "PostgreSQL",
  "psycopg2": "PostgreSQL",
  "pymongo": "MongoDB",
  "redis-py": "Redis",
  "boto3": "AWS",
  "tensorflow": "Python",
  "torch": "Python",
  "numpy": "Python",
  "pandas": "Python",
  "scikit-learn": "Python",

  // Ruby
  "rails": "Ruby on Rails",
  "sinatra": "Ruby",
  "activerecord": "Ruby on Rails",

  // Go modules (detected by module name patterns)
  "gin": "Go",
  "fiber": "Go",
  "echo": "Go",
  "gorm": "Go",

  // PHP
  "laravel": "Laravel",
  "symfony": "PHP",
};

// Files we scan in each repo root
const DEPENDENCY_FILES = [
  'package.json',
  'requirements.txt',
  'Pipfile',
  'Gemfile',
  'go.mod',
  'pom.xml',
  'composer.json',
  'cargo.toml',
];

class AnalysisService {
  /**
   * Orchestrates the Job Fit Analysis pipeline:
   * 1. Fetches public user profile and repositories.
   * 2. Deep-scans dependency files for framework/library signals.
   * 3. Delegates CPU-bound skill extraction and matching to a background Worker Thread.
   * 4. Formats raw engine metrics into strengths, weaknesses, and match scores.
   *
   * @param {string} username - Target GitHub username to analyze.
   * @param {string} jobDescription - Raw Job Description text.
   * @param {string|null} [token=null] - Optional GitHub OAuth token to raise API limits.
   * @returns {Promise<Object>} Final structured analysis and candidate profile.
   */
  async analyzeJobFit(username, jobDescription, token = null) {
    if (!username || typeof username !== 'string' || username.trim() === '') {
      throw new Error("GitHub username is required and cannot be empty.");
    }
    if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim() === '') {
      throw new Error("Job Description is required and cannot be empty.");
    }

    const githubService = new GitHubService(token);

    // 1. Fetch public profile and public repositories
    const profile = await githubService.getUserByUsername(username);
    const repos = await githubService.getRepositoriesByUsername(username);

    // 2. Deep-scan top repos for dependency files (limit to 10 most recently updated)
    const topRepos = [...repos]
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 10);

    const enrichedRepos = await Promise.all(
      topRepos.map(repo => this.enrichRepoWithDependencies(githubService, repo))
    );

    // Combine enriched top repos with the rest (unenriched)
    const remainingRepos = repos.filter(r => !topRepos.find(t => t.id === r.id));
    const allRepos = [...enrichedRepos, ...remainingRepos];

    // 3. Offload CPU-bound calculations to Worker Thread
    const rawMatchResult = await this.runWorkerAnalysis(allRepos, jobDescription);

    // 4. Format result
    const formattedResult = formatAnalysisResult(rawMatchResult.match);

    return {
      profile: {
        login: profile.login,
        name: profile.name,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        public_repos: profile.public_repos,
        followers: profile.followers,
        following: profile.following
      },
      role: rawMatchResult.role,
      experience: rawMatchResult.experience,
      jdSkills: rawMatchResult.jdSkills,
      profileSkills: rawMatchResult.profileSkills,
      ...formattedResult
    };
  }

  /**
   * Fetches dependency files from a repo root and maps known packages to skills.
   * Attaches `deepSkills` array to the repo object.
   */
  async enrichRepoWithDependencies(githubService, repo) {
    const owner = repo.owner?.login || repo.full_name?.split('/')[0];
    if (!owner) return repo;

    const deepSkills = new Set();

    // Try to get root contents listing
    const rootContents = await githubService.getRepoRootContents(owner, repo.name);
    const rootFileNames = rootContents.map(f => f.name.toLowerCase());

    for (const depFile of DEPENDENCY_FILES) {
      if (!rootFileNames.includes(depFile.toLowerCase())) continue;

      const content = await githubService.getFileContents(owner, repo.name, depFile);
      if (!content) continue;

      const skills = this.parseDepFile(depFile, content);
      skills.forEach(s => deepSkills.add(s));
    }

    return {
      ...repo,
      deepSkills: Array.from(deepSkills)
    };
  }

  /**
   * Parses a dependency file and extracts known skill signals.
   */
  parseDepFile(filename, content) {
    const skills = new Set();

    try {
      if (filename === 'package.json') {
        const json = JSON.parse(content);
        const allDeps = {
          ...json.dependencies,
          ...json.devDependencies,
          ...json.peerDependencies,
        };
        for (const pkg of Object.keys(allDeps)) {
          const skill = DEP_TO_SKILL[pkg.toLowerCase()];
          if (skill) skills.add(skill);
        }

        // Also check scripts for framework signals
        const scripts = JSON.stringify(json.scripts || '').toLowerCase();
        if (scripts.includes('react-scripts') || scripts.includes('react-app')) skills.add('React');
        if (scripts.includes('next')) skills.add('Next.js');
        if (scripts.includes('vue-cli') || scripts.includes('nuxt')) skills.add('Vue.js');
        if (scripts.includes('ng ')) skills.add('Angular');

      } else if (filename === 'requirements.txt' || filename === 'pipfile') {
        const lines = content.split('\n');
        for (const line of lines) {
          const pkg = line.split('==')[0].split('>=')[0].split('<=')[0].trim().toLowerCase();
          const skill = DEP_TO_SKILL[pkg];
          if (skill) skills.add(skill);
          // Add Python as base language if any Python file exists
          skills.add('Python');
        }

      } else if (filename === 'gemfile') {
        // Ruby gem detection
        const gemMatches = content.match(/gem\s+['"]([^'"]+)['"]/gi) || [];
        for (const match of gemMatches) {
          const gemName = match.replace(/gem\s+['"]/i, '').replace(/['"]/, '').trim().toLowerCase();
          const skill = DEP_TO_SKILL[gemName];
          if (skill) skills.add(skill);
        }
        skills.add('Ruby');

      } else if (filename === 'go.mod') {
        skills.add('Go');
        const requireMatches = content.match(/require\s+([^\s]+)/g) || [];
        for (const match of requireMatches) {
          const mod = match.replace('require ', '').split('/').pop().toLowerCase();
          const skill = DEP_TO_SKILL[mod];
          if (skill) skills.add(skill);
        }

      } else if (filename === 'pom.xml') {
        skills.add('Java');
        if (content.includes('spring-boot')) skills.add('Spring Boot');
        if (content.includes('hibernate')) skills.add('PostgreSQL');

      } else if (filename === 'composer.json') {
        skills.add('PHP');
        if (content.includes('laravel')) skills.add('Laravel');

      } else if (filename === 'cargo.toml') {
        skills.add('Rust');
      }
    } catch (e) {
      // Silently skip malformed files
    }

    return Array.from(skills);
  }

  /**
   * Instantiates the worker thread to execute parsing and matching logic in the background.
   */
  runWorkerAnalysis(repos, jobDescription) {
    return new Promise((resolve, reject) => {
      const workerPath = path.join(__dirname, '../main/worker.js');
      const worker = new Worker(workerPath, {
        workerData: { repos, jobDescription }
      });

      worker.on('message', (result) => resolve(result));
      worker.on('error', (err) => reject(err));
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker thread exited with code ${code}`));
        }
      });
    });
  }
}

export default new AnalysisService();
