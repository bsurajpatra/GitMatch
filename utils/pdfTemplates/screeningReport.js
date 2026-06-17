const getScoreColor = (score) => {
  if (score >= 80) return '#16a34a'; // Success Green
  if (score >= 60) return '#2563eb'; // Info Blue
  if (score >= 40) return '#ea580c'; // Warning Orange
  return '#dc2626'; // Danger Red
};

const getScoreTier = (score) => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Low';
};

/**
 * Generates the Bulk Screening PDF Report.
 * @param {PDFDocument} doc 
 * @param {object} data 
 */
export function generateScreeningReportPDF(doc, data) {
  const {
    name = 'Bulk Candidate Screening',
    statistics = {},
    allRankings = [],
    failures = [],
    jobDescription = '',
    minimumScore = 70
  } = data;

  const titleColor = '#0f172a';
  const subtitleColor = '#475569';
  const mutedTextColor = '#64748b';
  const borderColor = '#cbd5e1';
  const cardBgColor = '#f8fafc';

  // --- Title Header Row ---
  doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(22).text('Bulk Candidate Screening', 54, 55);
  doc.fillColor(mutedTextColor).font('Helvetica').fontSize(9).text(`Report Generated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`, 54, doc.y + 4);
  doc.strokeColor(borderColor).lineWidth(1).moveTo(54, doc.y + 8).lineTo(doc.page.width - 54, doc.y + 8).stroke();
  doc.y = doc.y + 16;

  // --- Screening Meta Summary Card ---
  const metaCardY = doc.y;
  doc.rect(54, metaCardY, doc.page.width - 108, 55).fill(cardBgColor);
  doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(11).text(name || 'Candidate Screening Run', 70, metaCardY + 12);
  
  // Extract a brief excerpt of the JD
  const jdExcerpt = jobDescription.length > 90 ? jobDescription.substring(0, 87).trim() + '...' : jobDescription;
  doc.fillColor(subtitleColor).font('Helvetica').fontSize(8.5).text(`Target Job Criteria: ${jdExcerpt || 'N/A'}`, 70, metaCardY + 28, { width: doc.page.width - 144 });
  doc.fillColor(mutedTextColor).fontSize(7.5).text(`Shortlisting threshold set at minimum final score of ${minimumScore}%`, 70, metaCardY + 41);

  doc.y = metaCardY + 70;

  // --- Statistics Cards Grid ---
  doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(11).text('Screening Statistics', 54, doc.y);
  doc.y += 10;

  const statCardWidth = (doc.page.width - 108 - 24) / 3;
  const statCardHeight = 55;
  const statCardStartY = doc.y;

  // 1. Analyzed / Shortlisted
  doc.rect(54, statCardStartY, statCardWidth, statCardHeight).fill(cardBgColor);
  doc.fillColor('#2563eb').font('Helvetica-Bold').fontSize(16).text(String(statistics.successfulAnalyses ?? allRankings.length), 66, statCardStartY + 10);
  doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(8).text('Candidates Evaluated', 66, statCardStartY + 28);
  doc.fillColor(mutedTextColor).font('Helvetica').fontSize(7.5).text(`${statistics.shortlistedCandidates ?? 0} Shortlisted`, 66, statCardStartY + 38);

  // 2. Average Score
  doc.rect(54 + statCardWidth + 12, statCardStartY, statCardWidth, statCardHeight).fill(cardBgColor);
  doc.fillColor('#7c3aed').font('Helvetica-Bold').fontSize(16).text(`${statistics.averageScore ?? 0}%`, 54 + statCardWidth + 24, statCardStartY + 10);
  doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(8).text('Average Final Score', 54 + statCardWidth + 24, statCardStartY + 28);
  doc.fillColor(mutedTextColor).font('Helvetica').fontSize(7.5).text('Overall screening pool', 54 + statCardWidth + 24, statCardStartY + 38);

  // 3. Highest Score
  doc.rect(54 + (statCardWidth * 2) + 24, statCardStartY, statCardWidth, statCardHeight).fill(cardBgColor);
  doc.fillColor('#16a34a').font('Helvetica-Bold').fontSize(16).text(`${statistics.highestScore ?? 0}%`, 54 + (statCardWidth * 2) + 36, statCardStartY + 10);
  doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(8).text('Highest Fit Score', 54 + (statCardWidth * 2) + 36, statCardStartY + 28);
  doc.fillColor(mutedTextColor).font('Helvetica').fontSize(7.5).text('Top profile matches', 54 + (statCardWidth * 2) + 36, statCardStartY + 38);

  doc.y = statCardStartY + 70;

  // --- Top Candidates Highlights ---
  const topCandidates = allRankings.slice(0, 3);
  if (topCandidates.length > 0) {
    doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(11).text('Top Candidate Recommendations', 54, doc.y);
    doc.y += 10;

    const rankColors = { 1: '#fbbf24', 2: '#9ca3af', 3: '#b46a3c' }; // Gold, Silver, Bronze

    topCandidates.forEach((cand, index) => {
      const topY = doc.y;
      doc.rect(54, topY, doc.page.width - 108, 30).fill(cardBgColor);

      // Rank circle
      doc.circle(70, topY + 15, 8).fill(rankColors[cand.rank] || '#475569');
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8.5).text(String(cand.rank), 68.5, topY + 11.5);

      // Info
      doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(9).text(cand.profile?.name || cand.username, 90, topY + 6);
      doc.fillColor(mutedTextColor).font('Helvetica').fontSize(8).text(`@${cand.username}`, 90, topY + 16);

      // Scores
      const jobFitScore = cand.weightedMatchScore ?? cand.overallScore ?? 0;
      const qualityScore = cand.quality?.qualityScore ?? 0;
      const finalScore = cand.finalScore ?? Math.round(0.7 * jobFitScore + 0.3 * qualityScore);

      const fColor = getScoreColor(finalScore);
      doc.fillColor(titleColor).font('Helvetica').fontSize(8);
      let curX = doc.page.width - 250;
      const curY = topY + 11;
      
      doc.text('Job Fit: ', curX, curY);
      curX += doc.widthOfString('Job Fit: ');
      
      doc.font('Helvetica-Bold');
      doc.text(`${jobFitScore}%`, curX, curY);
      curX += doc.widthOfString(`${jobFitScore}%`);
      
      doc.font('Helvetica');
      doc.text('   Quality: ', curX, curY);
      curX += doc.widthOfString('   Quality: ');
      
      doc.font('Helvetica-Bold');
      doc.text(`${qualityScore}%`, curX, curY);

      doc.fillColor(fColor).font('Helvetica-Bold').fontSize(11.5).text(`${finalScore}%`, doc.page.width - 96, topY + 9, { align: 'right', width: 30 });

      doc.y = topY + 36;
    });
  }

  // Failures Info
  if (failures && failures.length > 0) {
    doc.y += 10;
    if (doc.y > 680) doc.addPage();
    doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(11).text(`Unresolved Profiling Failures (${failures.length})`, 54, doc.y);
    doc.y += 10;
    
    let failText = '';
    failures.slice(0, 10).forEach((f, idx) => {
      failText += `@${f.username} (${f.reason || 'Network timeout'})${idx < failures.length - 1 ? '  ·  ' : ''}`;
    });
    doc.fillColor('#dc2626').font('Helvetica').fontSize(8.2).text(failText, 54, doc.y, { width: doc.page.width - 108, lineGap: 3.5 });
  }

  // --- Page 2+: Detailed Candidate Rankings Table ---
  doc.addPage();
  doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(12).text('All Screened Candidates List', 54, 55);
  doc.y += 10;

  // Header function
  const drawTableHeader = (d) => {
    const headerY = d.y;
    d.rect(54, headerY, d.page.width - 108, 18).fill('#f1f5f9');
    d.fillColor(titleColor).font('Helvetica-Bold').fontSize(8).text('RANK', 64, headerY + 5);
    d.text('CANDIDATE', 110, headerY + 5);
    d.text('JOB FIT', 260, headerY + 5);
    d.text('QUALITY', 330, headerY + 5);
    d.text('FINAL SCORE', 400, headerY + 5);
    d.text('STATUS', 485, headerY + 5);
    d.y = headerY + 18;
  };

  drawTableHeader(doc);

  if (allRankings.length > 0) {
    allRankings.forEach((cand, idx) => {
      // Row page-overflow check
      if (doc.y > doc.page.height - 70) {
        doc.addPage();
        drawTableHeader(doc);
      }

      const rowY = doc.y;
      
      // Striped background
      if (idx % 2 === 1) {
        doc.rect(54, rowY, doc.page.width - 108, 16).fill('#f8fafc');
      }

      // Shortlisted check
      const jobFitScore = cand.weightedMatchScore ?? cand.overallScore ?? 0;
      const qualityScore = cand.quality?.qualityScore ?? 0;
      const finalScore = cand.finalScore ?? Math.round(0.7 * jobFitScore + 0.3 * qualityScore);
      const isShortlisted = finalScore >= minimumScore;

      // Font style changes depending on threshold opacity
      if (!isShortlisted) {
        doc.fillColor('#94a3b8');
      } else {
        doc.fillColor(titleColor);
      }

      doc.font('Helvetica-Bold').fontSize(8).text(`#${cand.rank}`, 64, rowY + 4);
      
      const dispName = cand.profile?.name || cand.username;
      const cutName = dispName.length > 25 ? dispName.substring(0, 22) + '...' : dispName;
      doc.font('Helvetica-Bold').text(cutName, 110, rowY + 4);
      const nameWidth = doc.widthOfString(cutName);
      doc.font('Helvetica').fillColor('#64748b').text(` (@${cand.username})`, 110 + nameWidth + 2, rowY + 4);

      if (!isShortlisted) doc.fillColor('#94a3b8'); else doc.fillColor(getScoreColor(jobFitScore));
      doc.font('Helvetica-Bold').text(`${jobFitScore}%`, 260, rowY + 4);
      
      if (!isShortlisted) doc.fillColor('#94a3b8'); else doc.fillColor(getScoreColor(qualityScore));
      doc.text(`${qualityScore}%`, 330, rowY + 4);
      
      if (!isShortlisted) doc.fillColor('#94a3b8'); else doc.fillColor(getScoreColor(finalScore));
      const finalScoreStr = `${finalScore}%`;
      doc.font('Helvetica-Bold').fontSize(8).text(finalScoreStr, 400, rowY + 4);
      const finalScoreWidth = doc.widthOfString(finalScoreStr);
      doc.font('Helvetica').fontSize(7.5).fillColor(mutedTextColor).text(` (${getScoreTier(finalScore)})`, 400 + finalScoreWidth + 2, rowY + 4 + 0.5);

      if (isShortlisted) {
        doc.fillColor('#16a34a').font('Helvetica-Bold').fontSize(7.5).text('SHORTLISTED', 485, rowY + 4);
      } else {
        doc.fillColor('#64748b').font('Helvetica').fontSize(7.5).text('BELOW THRESHOLD', 485, rowY + 4);
      }

      doc.y = rowY + 16;
    });
  } else {
    doc.fillColor(mutedTextColor).font('Helvetica-Oblique').fontSize(8.5).text('No successfully evaluated candidate rankings available.', 64, doc.y + 6);
  }

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
    doc.text('  //  BULK CANDIDATE SCREENING REPORT', 54 + gitmatchWidth + 2, 30, { characterSpacing: 0.5 });
    doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(54, 40).lineTo(doc.page.width - 54, 40).stroke();
    
    // Footer
    doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(54, doc.page.height - 42).lineTo(doc.page.width - 54, doc.page.height - 42).stroke();
    doc.fillColor('#94a3b8').font('Helvetica').fontSize(7.5).text(`Page ${i + 1} of ${pages.count}`, 54, doc.page.height - 34, { align: 'right', width: doc.page.width - 108 });
    doc.text('Confidential Screening Copy  ·  Local Report', 54, doc.page.height - 34);

    doc.page.margins = oldMargins;
  }
  doc.options.autoPageBreak = oldAutoPageBreak;
}
