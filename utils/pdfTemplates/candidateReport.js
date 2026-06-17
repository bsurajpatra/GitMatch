const getScoreColor = (score) => {
  if (score >= 80) return '#16a34a'; // Success Green
  if (score >= 60) return '#2563eb'; // Info Blue
  if (score >= 40) return '#ea580c'; // Warning Orange
  return '#dc2626'; // Danger Red
};

const getScoreTier = (score) => {
  if (score >= 80) return 'Strong Match';
  if (score >= 60) return 'Good Match';
  if (score >= 40) return 'Fair Match';
  return 'Low Match';
};

const getWeightTier = (weight) => {
  if (weight >= 15) return 'High';
  if (weight >= 10) return 'Med';
  return 'Low';
};

/**
 * Generates the Candidate Evaluation PDF Report.
 * @param {PDFDocument} doc 
 * @param {object} data 
 */
export function generateCandidateReportPDF(doc, data) {
  const {
    overallScore = 0,
    weightedMatchScore = null,
    skillBreakdown = [],
    matchedSkills = [],
    missingSkills = [],
    strengths = [],
    weaknesses = [],
    profile = {},
    evidenceMap = {},
    quality = null,
    role = 'Job Role',
    experience = 'Not Specified'
  } = data;

  const jobFitScore = weightedMatchScore !== null ? weightedMatchScore : overallScore;
  const qualityScore = quality?.qualityScore ?? 0;
  const finalScore = data.finalScore ?? Math.round(0.7 * jobFitScore + 0.3 * qualityScore);

  const combinedStrengths = [...strengths, ...(quality?.strengths || [])].filter(Boolean);
  const combinedWeaknesses = [...weaknesses, ...(quality?.weaknesses || [])].filter(Boolean);

  const finalColor = getScoreColor(finalScore);
  const jobFitColor = getScoreColor(jobFitScore);
  const qualityColor = getScoreColor(qualityScore);

  const titleColor = '#0f172a';
  const subtitleColor = '#475569';
  const mutedTextColor = '#64748b';
  const borderColor = '#cbd5e1';
  const cardBgColor = '#f8fafc';

  // --- Title Header Row ---
  doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(22).text('Candidate Evaluation Report', 54, 55);
  doc.fillColor(mutedTextColor).font('Helvetica').fontSize(9).text(`Generated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`, 54, doc.y + 4, { align: 'left' });
  doc.strokeColor(borderColor).lineWidth(1).moveTo(54, doc.y + 8).lineTo(doc.page.width - 54, doc.y + 8).stroke();
  doc.y = doc.y + 16;

  // --- Section: Candidate Profile Header Card ---
  const headerCardY = doc.y;
  doc.rect(54, headerCardY, doc.page.width - 108, 65).fill(cardBgColor);
  
  doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(14).text(profile.name || profile.login || 'GitHub Candidate', 70, headerCardY + 12);
  if (profile.login) {
    doc.fillColor(mutedTextColor).font('Helvetica').fontSize(9).text(`@${profile.login}`, 70, doc.y + 2);
  }
  
  if (profile.bio) {
    const bioText = profile.bio.length > 80 ? profile.bio.substring(0, 77) + '...' : profile.bio;
    doc.fillColor(subtitleColor).font('Helvetica-Oblique').fontSize(8.5).text(bioText, doc.page.width - 290, headerCardY + 12, { width: 230, align: 'right' });
  }

  // Stats
  doc.fillColor(mutedTextColor).font('Helvetica').fontSize(8.5).text(
    `Public Repositories: ${profile.public_repos ?? 0}   |   Followers: ${profile.followers ?? 0}   |   Following: ${profile.following ?? 0}`,
    70,
    headerCardY + 45
  );

  doc.y = headerCardY + 80;

  // --- Section: Score Meter Overview ---
  doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(11).text('Score Compatibility Summary', 54, doc.y);
  doc.y += 10;
  
  const scoreCardWidth = (doc.page.width - 108 - 24) / 3;
  const scoreCardHeight = 65;
  const scoreCardStartY = doc.y;

  // 1. Final Score Card
  doc.rect(54, scoreCardStartY, scoreCardWidth, scoreCardHeight).fill(cardBgColor);
  doc.fillColor(finalColor).font('Helvetica-Bold').fontSize(20).text(`${finalScore}%`, 66, scoreCardStartY + 12);
  doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(8.5).text('Final Score', 66, scoreCardStartY + 34);
  doc.fillColor(mutedTextColor).font('Helvetica').fontSize(7.5).text(getScoreTier(finalScore), 66, scoreCardStartY + 45);

  // 2. Job Fit Card
  doc.rect(54 + scoreCardWidth + 12, scoreCardStartY, scoreCardWidth, scoreCardHeight).fill(cardBgColor);
  doc.fillColor(jobFitColor).font('Helvetica-Bold').fontSize(20).text(`${jobFitScore}%`, 54 + scoreCardWidth + 24, scoreCardStartY + 12);
  doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(8.5).text('Job Fit compatibility', 54 + scoreCardWidth + 24, scoreCardStartY + 34);
  doc.fillColor(mutedTextColor).font('Helvetica').fontSize(7.5).text(role, 54 + scoreCardWidth + 24, scoreCardStartY + 45, { width: scoreCardWidth - 20, height: 12 });

  // 3. Quality Score Card
  doc.rect(54 + (scoreCardWidth * 2) + 24, scoreCardStartY, scoreCardWidth, scoreCardHeight).fill(cardBgColor);
  doc.fillColor(qualityColor).font('Helvetica-Bold').fontSize(20).text(`${qualityScore}%`, 54 + (scoreCardWidth * 2) + 36, scoreCardStartY + 12);
  doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(8.5).text('Engineering Quality', 54 + (scoreCardWidth * 2) + 36, scoreCardStartY + 34);
  doc.fillColor(mutedTextColor).font('Helvetica').fontSize(7.5).text('Hygiene index', 54 + (scoreCardWidth * 2) + 36, scoreCardStartY + 45);

  doc.y = scoreCardStartY + 85;

  // --- Section: Explanations & Quality Breakdown Side-by-Side ---
  if (doc.y > 560) doc.addPage();
  const mainGridStartY = doc.y;
  const colWidth = (doc.page.width - 108 - 20) / 2;

  // Left side: Score Justification list
  doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(11).text('Score Justification & Explanations', 54, mainGridStartY);
  doc.y += 10;
  
  if (data.explanations && data.explanations.length > 0) {
    data.explanations.slice(0, 5).forEach((exp) => {
      const itemY = doc.y;
      doc.fillColor('#7c3aed').font('Helvetica-Bold').fontSize(10).text('•', 54, itemY);
      doc.fillColor(subtitleColor).font('Helvetica').fontSize(8.5).text(exp, 64, itemY + 1, { width: colWidth - 20, lineGap: 3 });
      doc.y += 5;
    });
  } else {
    doc.fillColor(mutedTextColor).font('Helvetica-Oblique').fontSize(8.5).text('No justification reasons available.', 54, doc.y);
  }

  // Right side: Quality Breakdown progress meters
  const rightColStartX = doc.page.width - 54 - colWidth;
  doc.y = mainGridStartY;
  doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(11).text('Engineering Quality Breakdown', rightColStartX, doc.y);
  doc.y += 15;

  if (quality && quality.breakdown) {
    Object.entries(quality.breakdown).forEach(([key, val]) => {
      const qColor = getScoreColor(val);
      let label = key.charAt(0).toUpperCase() + key.slice(1);
      if (key === 'cicd') label = 'CI/CD Pipelines';

      const lineY = doc.y;
      doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(8).text(label, rightColStartX, lineY);
      doc.fillColor(qColor).fontSize(8).text(`${val}%`, rightColStartX, lineY, { align: 'right', width: colWidth });
      
      // Progress Bar
      doc.rect(rightColStartX, lineY + 12, colWidth, 4).fill('#e2e8f0');
      doc.rect(rightColStartX, lineY + 12, (colWidth * val) / 100, 4).fill(qColor);
      
      doc.y = lineY + 24;
    });
  } else {
    doc.fillColor(mutedTextColor).font('Helvetica-Oblique').fontSize(8.5).text('No quality breakdown indexes recorded.', rightColStartX, doc.y);
  }

  doc.y = Math.max(doc.y, mainGridStartY + 130);

  // --- Page 2 Details: Matched Skills, Missing, Strengths & Evidence ---
  doc.addPage();

  // Matched Skills List
  doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(11).text('Matched Technical Skills', 54, 55);
  doc.y += 10;

  const matchedList = skillBreakdown.length > 0
    ? skillBreakdown.filter(item => item.status === 'matched')
    : matchedSkills.map(skill => {
        const skillData = evidenceMap?.[skill] || { confidence: 0, evidence: [] };
        return { skill, weight: null, confidence: skillData.confidence };
      });

  // Table Headers
  const thStartY = doc.y;
  doc.rect(54, thStartY, doc.page.width - 108, 18).fill('#f1f5f9');
  doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(8).text('SKILL', 64, thStartY + 5);
  doc.text('CONFIDENCE', 180, thStartY + 5);
  doc.text('WEIGHT', 280, thStartY + 5);
  doc.text('EVIDENCE SIGNALS', 380, thStartY + 5);
  doc.y = thStartY + 18;

  if (matchedList.length > 0) {
    matchedList.slice(0, 10).forEach((item, index) => {
      const rowY = doc.y;
      if (index % 2 === 1) {
        doc.rect(54, rowY, doc.page.width - 108, 16).fill('#f8fafc');
      }
      doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(8).text(item.skill, 64, rowY + 4);
      doc.fillColor(getScoreColor(item.confidence)).font('Helvetica').fontSize(8).text(`${item.confidence}%`, 180, rowY + 4);
      doc.fillColor(subtitleColor).text(item.weight !== null ? `${item.weight}% (${getWeightTier(item.weight)})` : 'N/A', 280, rowY + 4);
      
      const signalsCount = evidenceMap?.[item.skill]?.evidence?.length ?? 0;
      doc.text(`${signalsCount} file match${signalsCount !== 1 ? 'es' : ''}`, 380, rowY + 4);
      
      doc.y = rowY + 16;
    });
  } else {
    doc.fillColor(mutedTextColor).font('Helvetica-Oblique').fontSize(8.5).text('No matched skills analyzed.', 64, doc.y + 6);
    doc.y += 20;
  }

  // Missing Skills
  doc.y += 15;
  doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(11).text('Missing Technical Skill Gaps', 54, doc.y);
  doc.y += 10;

  const missingList = skillBreakdown.length > 0
    ? skillBreakdown.filter(item => item.status === 'missing')
    : missingSkills.map(skill => ({ skill, weight: null }));

  if (missingList.length > 0) {
    let missingPillsText = '';
    missingList.forEach((item, idx) => {
      const weightInfo = item.weight !== null ? ` (${item.weight}% weight)` : '';
      missingPillsText += `${item.skill}${weightInfo}${idx < missingList.length - 1 ? '   ·   ' : ''}`;
    });
    doc.fillColor('#dc2626').font('Helvetica-Bold').fontSize(8.5).text(missingPillsText, 54, doc.y, { width: doc.page.width - 108, lineGap: 4 });
  } else {
    doc.fillColor('#16a34a').font('Helvetica').fontSize(8.5).text('✗ No critical skill gaps identified (perfect match coverage).', 54, doc.y);
  }

  doc.y += 20;

  // Strengths & Weaknesses
  if (doc.y > 540) doc.addPage();
  const insightsY = doc.y;
  
  // Left: Strengths
  doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(11).text('Recruiter Strengths', 54, insightsY);
  doc.y += 10;
  if (combinedStrengths.length > 0) {
    combinedStrengths.slice(0, 4).forEach((str) => {
      const itemY = doc.y;
      doc.fillColor('#16a34a').font('Helvetica-Bold').fontSize(8).text('+ ', 54, itemY);
      doc.fillColor(subtitleColor).font('Helvetica').fontSize(8).text(str, 62, itemY, { width: colWidth - 18, lineGap: 2 });
      doc.y += 4;
    });
  } else {
    doc.fillColor(mutedTextColor).font('Helvetica-Oblique').fontSize(8).text('No distinct strengths identified.', 54, doc.y);
  }

  // Right: Weaknesses
  doc.y = insightsY;
  doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(11).text('Areas for Improvement', rightColStartX, doc.y);
  doc.y += 10;
  if (combinedWeaknesses.length > 0) {
    combinedWeaknesses.slice(0, 4).forEach((weak) => {
      const itemY = doc.y;
      doc.fillColor('#ea580c').font('Helvetica-Bold').fontSize(8).text('- ', rightColStartX, itemY);
      doc.fillColor(subtitleColor).font('Helvetica').fontSize(8).text(weak, rightColStartX + 8, itemY, { width: colWidth - 18, lineGap: 2 });
      doc.y += 4;
    });
  } else {
    doc.fillColor(mutedTextColor).font('Helvetica-Oblique').fontSize(8).text('No major weaknesses identified.', rightColStartX, doc.y);
  }

  doc.y = Math.max(doc.y, insightsY + 95);

  // Evidence Repositories summary
  doc.y += 15;
  if (doc.y > 640) doc.addPage();
  doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(11).text('Top Codebase Signal Contributors', 54, doc.y);
  doc.y += 10;

  // Collect top repositories across all matches
  const repoCounts = {};
  Object.values(evidenceMap).forEach(skillData => {
    if (skillData.evidence) {
      skillData.evidence.forEach(ev => {
        if (ev.repository) {
          repoCounts[ev.repository] = (repoCounts[ev.repository] || 0) + 1;
        }
      });
    }
  });

  const sortedRepos = Object.entries(repoCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  if (sortedRepos.length > 0) {
    sortedRepos.forEach(([repoName, count]) => {
      const lineY = doc.y;
      doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(8.5).text(repoName, 54, lineY);
      doc.fillColor(mutedTextColor).font('Helvetica').fontSize(8.5).text(`${count} code evidence signals matched`, 54, lineY, { align: 'right', width: doc.page.width - 108 });
      doc.y = lineY + 15;
    });
  } else {
    doc.fillColor(mutedTextColor).font('Helvetica-Oblique').fontSize(8.5).text('No repository evidence lines recorded.', 54, doc.y);
  }

  // Final Recommendation
  doc.y += 20;
  if (doc.y > 640) doc.addPage();
  doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(11).text('Final Recommendation Summary', 54, doc.y);
  doc.y += 10;

  const recText = data.recommendation || `Candidate demonstrates a ${getScoreTier(finalScore).toLowerCase()} for the role of ${role}. Spanning engineering quality checks (${qualityScore}%) and compatibility tests (${jobFitScore}%), we recommend proceeding with evaluations focusing on the strengths listed above.`;
  doc.fillColor(subtitleColor).font('Helvetica').fontSize(8.5).text(recText, 54, doc.y, { width: doc.page.width - 108, lineGap: 3.5 });

  // --- Dynamic Headers & Footers stamping ---
  addHeaderFooter(doc);
}

function addHeaderFooter(doc) {
  const pages = doc.bufferedPageRange();
  const oldAutoPageBreak = doc.options.autoPageBreak;
  doc.options.autoPageBreak = false;

  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    const oldMargins = doc.page.margins;
    doc.page.margins = { top: 0, bottom: 0, left: 0, right: 0 };
    
    // Header
    doc.fillColor('#64748b').font('Helvetica-Bold').fontSize(7.5);
    doc.text('GITMATCH', 54, 30);
    const gitmatchWidth = doc.widthOfString('GITMATCH');
    doc.font('Helvetica').fillColor('#94a3b8');
    doc.text('  //  CANDIDATE EVALUATION REPORT', 54 + gitmatchWidth + 2, 30, { characterSpacing: 0.5 });
    doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(54, 40).lineTo(doc.page.width - 54, 40).stroke();
    
    // Footer
    doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(54, doc.page.height - 42).lineTo(doc.page.width - 54, doc.page.height - 42).stroke();
    doc.fillColor('#94a3b8').font('Helvetica').fontSize(7.5).text(`Page ${i + 1} of ${pages.count}`, 54, doc.page.height - 34, { align: 'right', width: doc.page.width - 108 });
    doc.text('Confidential Recruiter Copy  ·  Local Report', 54, doc.page.height - 34);

    doc.page.margins = oldMargins;
  }
  doc.options.autoPageBreak = oldAutoPageBreak;
}
