const getScoreColor = (score) => {
  if (score >= 80) return '#16a34a'; // Success Green
  if (score >= 60) return '#2563eb'; // Info Blue
  if (score >= 40) return '#ea580c'; // Warning Orange
  return '#dc2626'; // Danger Red
};

/**
 * Generates the Candidate Comparison PDF Report.
 * @param {PDFDocument} doc 
 * @param {object} data 
 */
export function generateComparisonReportPDF(doc, data) {
  const {
    winner = '',
    winnerProfile = {},
    finalRecommendation = '',
    categories = {},
    insights = {},
    candidates = []
  } = data;

  const titleColor = '#0f172a';
  const subtitleColor = '#475569';
  const mutedTextColor = '#64748b';
  const borderColor = '#cbd5e1';
  const cardBgColor = '#f8fafc';

  // --- Title Header Row ---
  doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(22).text('Candidate Comparison Report', 54, 55);
  doc.fillColor(mutedTextColor).font('Helvetica').fontSize(9).text(`Generated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}   |   Comparing ${candidates.length} Profiles`, 54, doc.y + 4);
  doc.strokeColor(borderColor).lineWidth(1).moveTo(54, doc.y + 8).lineTo(doc.page.width - 54, doc.y + 8).stroke();
  doc.y = doc.y + 16;

  // --- Section: Final Recommendation / Winner Box ---
  if (finalRecommendation) {
    const recStartY = doc.y;
    // Draw thick border box on left
    doc.rect(54, recStartY, doc.page.width - 108, 60).fill('#f8fafc');
    doc.rect(54, recStartY, 4, 60).fill('#16a34a'); // Green accent left line
    
    doc.fillColor('#16a34a').font('Helvetica-Bold').fontSize(8).text('GITMATCH RECOMMENDATION', 70, recStartY + 10);
    
    // Fit text inside bounds safely
    const cleanRec = finalRecommendation.length > 200 ? finalRecommendation.substring(0, 197) + '...' : finalRecommendation;
    doc.fillColor(subtitleColor).font('Helvetica').fontSize(8.5).text(cleanRec, 70, recStartY + 23, { width: doc.page.width - 144, lineGap: 2 });
    
    doc.y = recStartY + 75;
  }

  // --- Section: Candidate Overview Cards Grid (Wrapping to rows/pages) ---
  doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(11).text('Profiles Side-by-Side', 54, doc.y);
  doc.y += 10;

  const numCandidates = candidates.length;
  const maxCardsPerRow = Math.min(numCandidates, 3);
  const cardSpacing = 12;
  const cardWidth = (doc.page.width - 108 - (cardSpacing * (maxCardsPerRow - 1))) / maxCardsPerRow;
  const cardHeight = 160;

  let currentY = doc.y;

  candidates.forEach((c, idx) => {
    const colIdx = idx % maxCardsPerRow;
    
    // Page overflow check for each row of cards
    if (colIdx === 0 && idx > 0) {
      currentY += cardHeight + cardSpacing;
      if (currentY + cardHeight > doc.page.height - 70) {
        doc.addPage();
        currentY = 55; // start at top of new page
      }
    } else if (idx === 0) {
      if (currentY + cardHeight > doc.page.height - 70) {
        doc.addPage();
        currentY = 55;
      }
    }

    const startX = 54 + colIdx * (cardWidth + cardSpacing);
    const startY = currentY;
    const isWinner = winner === c.username;

    // Draw Card Wrapper
    doc.rect(startX, startY, cardWidth, cardHeight).fill(cardBgColor);
    if (isWinner) {
      // Highlight winner card with a green border line on top
      doc.rect(startX, startY, cardWidth, 3).fill('#16a34a');
      doc.fillColor('#16a34a').font('Helvetica-Bold').fontSize(8).text('WINNER', startX + 10, startY + 12);
    }

    // Name & Username
    const nameY = startY + (isWinner ? 24 : 12);
    doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(11).text(c.profile?.name || c.username, startX + 10, nameY, { width: cardWidth - 20, height: 16 });
    const usernameY = nameY + 16;
    doc.fillColor(mutedTextColor).font('Helvetica').fontSize(8.5).text(`@${c.username}`, startX + 10, usernameY);

    // Scores
    const finalScore = c.finalScore ?? Math.round(0.7 * (c.jobFit || 0) + 0.3 * (c.qualityScore || 0));
    const scoreY = usernameY + 15;
    doc.fillColor(titleColor).font('Helvetica').fontSize(8.5).text('Final Score: ', startX + 10, scoreY);
    const scoreLabelWidth = doc.widthOfString('Final Score: ');
    doc.font('Helvetica-Bold').fillColor(getScoreColor(finalScore)).text(`${finalScore}%`, startX + 10 + scoreLabelWidth, scoreY);

    const fitY = scoreY + 13;
    doc.fillColor(subtitleColor).font('Helvetica').fontSize(8).text(`Job Fit Score: ${c.jobFit ?? c.overallScore}%`, startX + 10, fitY);
    const qualY = fitY + 11;
    doc.text(`Quality Score: ${c.qualityScore}%`, startX + 10, qualY);

    // Divider line
    const dividerY = qualY + 12;
    doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(startX + 10, dividerY).lineTo(startX + cardWidth - 10, dividerY).stroke();

    // Top Strengths / Insights bullets
    const bulletStartY = dividerY + 6;
    const candInsights = insights[c.username] || [];
    if (candInsights.length > 0) {
      candInsights.slice(0, 2).forEach((ins, insIdx) => {
        const itemY = bulletStartY + insIdx * 16;
        doc.fillColor(subtitleColor).font('Helvetica').fontSize(7.5).text('• ', startX + 10, itemY);
        const shortIns = ins.length > 45 ? ins.substring(0, 42) + '...' : ins;
        doc.text(shortIns, startX + 18, itemY, { width: cardWidth - 28, lineGap: 1.5 });
      });
    } else {
      doc.fillColor(mutedTextColor).font('Helvetica-Oblique').fontSize(7.5).text('No insight bullets recorded.', startX + 10, bulletStartY);
    }
  });

  doc.y = currentY + cardHeight + 20;

  // --- Page 2: Technical Skill Matrix ---
  doc.addPage();
  doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(11).text('Technical Skill Matrix', 54, 55);
  doc.y += 10;

  // Shared Core Skills
  const commonSkills = categories.skills?.commonSkills || [];
  const sharedY = doc.y;
  const labelText = `Shared Core Skills (${commonSkills.length}): `;
  doc.fillColor(subtitleColor).font('Helvetica-Bold').fontSize(9).text(labelText, 54, sharedY);
  const labelWidth = doc.widthOfString(labelText);
  
  const skillListText = commonSkills.length > 0 ? commonSkills.join(', ') : 'None identified in pool.';
  doc.font('Helvetica').fillColor(subtitleColor).fontSize(8.5).text(
    skillListText,
    54 + labelWidth,
    sharedY + 0.5,
    { width: doc.page.width - 108 - labelWidth, lineGap: 2 }
  );

  doc.y += 15;

  // Unique Skills wrapping (3 columns max)
  let uniqueStartY = doc.y;
  const maxCols = Math.min(numCandidates, 3);
  const colSpacing = 12;
  const colWidth = (doc.page.width - 108 - (colSpacing * (maxCols - 1))) / maxCols;
  const rowHeight = 50;

  candidates.forEach((c, idx) => {
    const colIdx = idx % maxCols;

    if (colIdx === 0 && idx > 0) {
      uniqueStartY += rowHeight + 15;
      if (uniqueStartY + rowHeight > doc.page.height - 70) {
        doc.addPage();
        uniqueStartY = 55;
      }
    } else if (idx === 0) {
      if (uniqueStartY + rowHeight > doc.page.height - 70) {
        doc.addPage();
        uniqueStartY = 55;
      }
    }

    const startX = 54 + colIdx * (colWidth + colSpacing);
    const startY = uniqueStartY;
    const uniqueSkills = categories.skills?.uniqueSkills?.[c.username] || [];

    doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(8.5).text(`@${c.username} Unique Skills (${uniqueSkills.length})`, startX, startY);
    const textY = startY + 11;
    if (uniqueSkills.length > 0) {
      doc.fillColor(subtitleColor).font('Helvetica').fontSize(8).text(uniqueSkills.join(', '), startX, textY, { width: colWidth - 10, lineGap: 2.5 });
    } else {
      doc.fillColor(mutedTextColor).font('Helvetica-Oblique').fontSize(8).text('No exclusive unique skills.', startX, textY);
    }
  });

  doc.y = uniqueStartY + rowHeight + 20;

  // Evidence Confidence Matrix table (chunked by 3 columns of candidates)
  const strongerEvidence = categories.skills?.strongerEvidence || [];
  if (strongerEvidence.length > 0) {
    if (doc.y > 450) doc.addPage();
    doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(11).text('Core Evidence & Confidence Strength', 54, doc.y);
    doc.y += 10;

    const candidateChunks = [];
    for (let i = 0; i < candidates.length; i += 3) {
      candidateChunks.push(candidates.slice(i, i + 3));
    }

    candidateChunks.forEach((chunk, chunkIdx) => {
      if (chunkIdx > 0) {
        doc.y += 15;
      }
      if (doc.y > doc.page.height - 100) {
        doc.addPage();
      }

      const tableHeaderY = doc.y;
      doc.rect(54, tableHeaderY, doc.page.width - 108, 18).fill('#f1f5f9');
      
      // Headers
      doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(8).text('CORE SKILL', 64, tableHeaderY + 5);
      doc.text('EVIDENCE WINNER', 180, tableHeaderY + 5);
      
      chunk.forEach((c, idx) => {
        const colX = 290 + (idx * 90);
        doc.text(`@${c.username}`, colX, tableHeaderY + 5, { width: 85, align: 'center' });
      });

      doc.y = tableHeaderY + 18;

      strongerEvidence.forEach((ev, idx) => {
        if (doc.y > doc.page.height - 40) {
          doc.addPage();
          const headerY = doc.y;
          doc.rect(54, headerY, doc.page.width - 108, 18).fill('#f1f5f9');
          doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(8).text('CORE SKILL', 64, headerY + 5);
          doc.text('EVIDENCE WINNER', 180, headerY + 5);
          chunk.forEach((c, idx) => {
            const colX = 290 + (idx * 90);
            doc.text(`@${c.username}`, colX, headerY + 5, { width: 85, align: 'center' });
          });
          doc.y = headerY + 18;
        }

        const rowY = doc.y;
        if (idx % 2 === 1) {
          doc.rect(54, rowY, doc.page.width - 108, 16).fill('#f8fafc');
        }

        doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(8).text(ev.skill, 64, rowY + 4);
        
        if (ev.winner !== 'Tied') {
          doc.fillColor('#16a34a').font('Helvetica-Bold').text(`@${ev.winner}`, 180, rowY + 4);
        } else {
          doc.fillColor(mutedTextColor).font('Helvetica').text('Tied / Equal', 180, rowY + 4);
        }

        chunk.forEach((c, cIdx) => {
          const colX = 290 + (cIdx * 90);
          const details = ev.details?.[c.username] || { confidence: 0, count: 0 };
          
          doc.fillColor(ev.winner === c.username ? '#16a34a' : titleColor)
            .font(ev.winner === c.username ? 'Helvetica-Bold' : 'Helvetica')
            .fontSize(8)
            .text(`${details.confidence}% (${details.count} signals)`, colX, rowY + 4, { width: 85, align: 'center' });
        });

        doc.y = rowY + 16;
      });
    });
  }

  // Engineering Quality breakdown table (chunked by 3 columns of candidates)
  if (doc.y > 450) doc.addPage();
  doc.y += 15;
  doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(11).text('Engineering Quality Breakdown Matrix', 54, doc.y);
  doc.y += 10;

  const candidateChunks = [];
  for (let i = 0; i < candidates.length; i += 3) {
    candidateChunks.push(candidates.slice(i, i + 3));
  }

  const qualityLabels = {
    documentation: 'Documentation Quality',
    testing: 'Testing Practices',
    cicd: 'CI/CD Pipelines',
    architecture: 'Modular Architecture',
    activity: 'Development Cadence',
    complexity: 'Codebase Complexity'
  };

  candidateChunks.forEach((chunk, chunkIdx) => {
    if (chunkIdx > 0) {
      doc.y += 15;
    }
    if (doc.y > doc.page.height - 120) {
      doc.addPage();
    }

    const tableHeaderY = doc.y;
    doc.rect(54, tableHeaderY, doc.page.width - 108, 18).fill('#f1f5f9');
    
    // Headers
    doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(8).text('HYGIENE CHECK', 64, tableHeaderY + 5);
    doc.text('PRACTICE WINNER', 180, tableHeaderY + 5);
    
    chunk.forEach((c, idx) => {
      const colX = 290 + (idx * 90);
      doc.text(`@${c.username}`, colX, tableHeaderY + 5, { width: 85, align: 'center' });
    });

    doc.y = tableHeaderY + 18;

    Object.entries(qualityLabels).forEach(([key, label], idx) => {
      if (doc.y > doc.page.height - 40) {
        doc.addPage();
        const headerY = doc.y;
        doc.rect(54, headerY, doc.page.width - 108, 18).fill('#f1f5f9');
        doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(8).text('HYGIENE CHECK', 64, headerY + 5);
        doc.text('PRACTICE WINNER', 180, headerY + 5);
        chunk.forEach((c, idx) => {
          const colX = 290 + (idx * 90);
          doc.text(`@${c.username}`, colX, headerY + 5, { width: 85, align: 'center' });
        });
        doc.y = headerY + 18;
      }

      const rowY = doc.y;
      if (idx % 2 === 1) {
        doc.rect(54, rowY, doc.page.width - 108, 16).fill('#f8fafc');
      }

      const metricData = categories.qualityBreakdown?.[key] || { winner: 'Tied', scores: {} };

      doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(8).text(label, 64, rowY + 4);
      
      if (metricData.winner !== 'Tied') {
        doc.fillColor('#16a34a').font('Helvetica-Bold').text(`@${metricData.winner}`, 180, rowY + 4);
      } else {
        doc.fillColor(mutedTextColor).font('Helvetica').text('Tied', 180, rowY + 4);
      }

      chunk.forEach((c, cIdx) => {
        const colX = 290 + (cIdx * 90);
        const scoreVal = metricData.scores?.[c.username] ?? 0;
        
        doc.fillColor(metricData.winner === c.username ? '#16a34a' : titleColor)
          .font(metricData.winner === c.username ? 'Helvetica-Bold' : 'Helvetica')
          .fontSize(8)
          .text(`${scoreVal}%`, colX, rowY + 4, { width: 85, align: 'center' });
      });

      doc.y = rowY + 16;
    });
  });

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
    doc.text('  //  CANDIDATE COMPARISON REPORT', 54 + gitmatchWidth + 2, 30, { characterSpacing: 0.5 });
    doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(54, 40).lineTo(doc.page.width - 54, 40).stroke();
    
    // Footer
    doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(54, doc.page.height - 42).lineTo(doc.page.width - 54, doc.page.height - 42).stroke();
    doc.fillColor('#94a3b8').font('Helvetica').fontSize(7.5).text(`Page ${i + 1} of ${pages.count}`, 54, doc.page.height - 34, { align: 'right', width: doc.page.width - 108 });
    doc.text('Confidential Recruiter Evaluation  ·  Local Report', 54, doc.page.height - 34);

    doc.page.margins = oldMargins;
  }
  doc.options.autoPageBreak = oldAutoPageBreak;
}
