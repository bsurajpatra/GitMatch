/**
 * @file matchEngine.js
 * @description Compares extracted job description skills against profile skills and calculates compatibility metrics.
 * @module analytics/matchEngine
 */

/**
 * Calculates the job compatibility metrics based on job requirements and profile skills.
 * 
 * @param {string[]} jdSkills - Array of normalized technical skills required by the job.
 * @param {string[]} profileSkills - Array of normalized technical skills extracted from the candidate's profile.
 * @returns {Object} Compatibility metrics containing match score, matched skills, missing skills, and profile-only skills.
 */
export function calculateMatchScore(jdSkills, profileSkills) {
  const cleanJdSkills = Array.isArray(jdSkills) ? jdSkills : [];
  const cleanProfileSkills = Array.isArray(profileSkills) ? profileSkills : [];

  if (cleanJdSkills.length === 0) {
    return {
      score: 0,
      matched: [],
      missing: [],
      profileOnly: [...cleanProfileSkills].sort()
    };
  }

  // Create lowercase sets for robust case-insensitive comparison
  const profileSet = new Set(cleanProfileSkills.map(s => s.toLowerCase()));
  const jdSet = new Set(cleanJdSkills.map(s => s.toLowerCase()));

  // Filter skills while keeping original casing from the input arrays
  const matched = cleanJdSkills.filter(skill => profileSet.has(skill.toLowerCase()));
  const missing = cleanJdSkills.filter(skill => !profileSet.has(skill.toLowerCase()));
  const profileOnly = cleanProfileSkills.filter(skill => !jdSet.has(skill.toLowerCase()));

  // Calculate percentage match score (rounded to nearest integer)
  const score = Math.round((matched.length / cleanJdSkills.length) * 100);

  return {
    score,
    matched: matched.sort(),
    missing: missing.sort(),
    profileOnly: profileOnly.sort()
  };
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================
/*
const jdRequirements = [
  "React",
  "Node.js",
  "AWS",
  "Docker"
];

const candidateSkills = [
  "React",
  "Node.js",
  "MongoDB"
];

const result = calculateMatchScore(jdRequirements, candidateSkills);
console.log(result);
// Output:
// {
//   score: 50,
//   matched: [ 'Node.js', 'React' ],
//   missing: [ 'AWS', 'Docker' ],
//   profileOnly: [ 'MongoDB' ]
// }
*/
