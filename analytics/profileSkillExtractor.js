/**
 * @file profileSkillExtractor.js
 * @description Extracts and normalizes technical skills from GitHub repository data (names, descriptions, topics, and languages).
 * @module analytics/profileSkillExtractor
 */

import { SKILL_DICTIONARY } from './jdParser.js';

/**
 * Normalizes a raw skill string (e.g., topic or language name) against the predefined dictionary.
 * 
 * @param {string} rawSkill - The raw skill string to normalize.
 * @returns {string|null} The normalized skill name, or null if it doesn't match the dictionary.
 */
function normalizeSkill(rawSkill) {
  if (!rawSkill || typeof rawSkill !== 'string') {
    return null;
  }
  const key = rawSkill.trim().toLowerCase();
  return SKILL_DICTIONARY[key] || null;
}

/**
 * Parses a string of text to find and extract any known skills from the dictionary.
 * 
 * @param {string} text - The text block (e.g., repository name or description).
 * @returns {string[]} An array of normalized skill names found in the text.
 */
function extractSkillsFromText(text) {
  const foundSkills = new Set();
  if (!text) return [];

  for (const [alias, normalizedName] of Object.entries(SKILL_DICTIONARY)) {
    const escapedKey = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match the alias surrounded by non-alphanumeric/non-underscore characters
    const pattern = `(?:^|[^a-zA-Z0-9_])(${escapedKey})(?:$|[^a-zA-Z0-9_+#])`;
    const regex = new RegExp(pattern, 'i');
    
    if (regex.test(text)) {
      foundSkills.add(normalizedName);
    }
  }

  return Array.from(foundSkills);
}

/**
 * Extracts and normalizes technical skills from a list of GitHub repositories.
 * 
 * @param {Array.<Object>} repos - Array of repository objects containing name, description, topics, and language.
 * @returns {string[]} A sorted, deduplicated list of normalized skills extracted from the repositories.
 */
export function extractSkillsFromProfile(repos) {
  if (!repos || !Array.isArray(repos)) {
    return [];
  }

  const extractedSkills = new Set();

  repos.forEach(repo => {
    // 1. Extract from Primary Language
    if (repo.language) {
      const normalizedLang = normalizeSkill(repo.language);
      if (normalizedLang) {
        extractedSkills.add(normalizedLang);
      }
    }

    // 2. Extract from Topics/Tags
    if (repo.topics && Array.isArray(repo.topics)) {
      repo.topics.forEach(topic => {
        const normalizedTopic = normalizeSkill(topic);
        if (normalizedTopic) {
          extractedSkills.add(normalizedTopic);
        }
      });
    }

    // 3. Extract from Name (clean delimiters first) and Description
    const nameText = repo.name ? repo.name.replace(/[_\-]/g, ' ') : '';
    const descText = repo.description || '';
    
    const textSkills = extractSkillsFromText(`${nameText} ${descText}`);
    textSkills.forEach(skill => {
      extractedSkills.add(skill);
    });

    // 4. Extract from Deep Scanned Skills (dependencies & files)
    if (repo.deepSkills && Array.isArray(repo.deepSkills)) {
      repo.deepSkills.forEach(skill => {
        extractedSkills.add(skill);
      });
    }
  });

  return Array.from(extractedSkills).sort();
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================
/*
const mockRepos = [
  {
    name: "mern-food-app",
    description: "Food delivery platform built with React, Express and MongoDB",
    topics: ["react", "nodejs", "mongodb"],
    language: "JavaScript"
  },
  {
    name: "aws-infra-deploy",
    description: "Terraform configurations for deploying dockerized microservices on AWS ECS",
    topics: ["terraform", "docker", "aws"],
    language: "HCL"
  }
];

const skills = extractSkillsFromProfile(mockRepos);
console.log(skills);
// Output:
// [ 'AWS', 'Docker', 'Express', 'JavaScript', 'MongoDB', 'Node.js', 'React', 'Terraform' ]
*/
