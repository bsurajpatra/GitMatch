import { parseJobDescription } from './jdParser.js';
import { extractSkillsFromProfile } from './profileSkillExtractor.js';
import { calculateMatchScore } from './matchEngine.js';

/**
 * Orchestrates the full Job Fit analysis workflow.
 * 
 * @param {Array.<Object>} repos - Raw GitHub repositories list.
 * @param {string} jobDescription - Raw Job Description text.
 * @returns {Object} Complete analysis results.
 */
const processJobFit = (repos, jobDescription) => {
  // 1. Parse Job Description
  const parsedJd = parseJobDescription(jobDescription);

  // 2. Extract Skills from Profile
  const profileSkills = extractSkillsFromProfile(repos);

  // 3. Match Profile Skills against JD Requirements
  const matchResult = calculateMatchScore(parsedJd.skills, profileSkills);

  return {
    role: parsedJd.role,
    experience: parsedJd.experience,
    jdSkills: parsedJd.skills,
    profileSkills: profileSkills,
    match: matchResult
  };
};

export default processJobFit;
