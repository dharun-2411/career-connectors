import { jsPDF } from 'jspdf';

/**
 * Generates a professionally styled, multi-page PDF document for a Career Roadmap.
 *
 * @param {Object} roadmap - The career roadmap data object
 * @param {Object} progress - Object tracking completed milestone keys
 */
export const generateRoadmapPdf = (roadmap, progress = {}) => {
  if (!roadmap) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Calculate overall progress percentage
  const totalMilestones =
    roadmap.phases?.reduce((acc, p) => acc + (p.milestones?.length || 1), 0) || 1;
  const completedCount = Object.values(progress).filter(Boolean).length;
  const progressPercent = Math.min(100, Math.round((completedCount / totalMilestones) * 100));

  // Running header on page > 1
  const drawRunningHeader = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('CAREERCONNECTORS  |  AI CAREER ROADMAP', margin, 28);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(roadmap.domainName || 'Career Plan', pageWidth - margin, 28, { align: 'right' });

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.75);
    doc.line(margin, 34, pageWidth - margin, 34);
  };

  const checkPageBreak = (neededHeight) => {
    if (y + neededHeight > pageHeight - margin - 25) {
      doc.addPage();
      drawRunningHeader();
      y = 52;
    }
  };

  // --- 1. COVER / HEADER BANNER ---
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(margin, y, contentWidth, 105, 8, 8, 'F');

  // Decorative blue accent strip
  doc.setFillColor(59, 130, 246); // blue-500
  doc.roundedRect(margin, y, 6, 105, 3, 3, 'F');

  // Brand subheader
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(147, 197, 253); // blue-300
  doc.text('AI-GENERATED CAREER PREPARATION ROADMAP', margin + 18, y + 24);

  // Main domain title
  doc.setFont('helvetica', 'extrabold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text(roadmap.domainName || 'Career Roadmap', margin + 18, y + 50);

  // Metadata row (Duration, Progress, Date)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(203, 213, 225); // slate-300
  const durationText = `Est. Duration: ${roadmap.totalDuration || '4-6 Months'}`;
  const progressText = `Progress: ${progressPercent}% Completed`;
  const dateText = `Generated: ${new Date().toLocaleDateString()}`;
  doc.text(`${durationText}   •   ${progressText}   •   ${dateText}`, margin + 18, y + 74);

  // Mini progress indicator bar in banner
  doc.setFillColor(30, 41, 59); // slate-800
  doc.roundedRect(margin + 18, y + 84, contentWidth - 36, 6, 3, 3, 'F');
  if (progressPercent > 0) {
    doc.setFillColor(16, 185, 129); // emerald-500
    const fillWidth = Math.max(8, ((contentWidth - 36) * progressPercent) / 100);
    doc.roundedRect(margin + 18, y + 84, fillWidth, 6, 3, 3, 'F');
  }

  y += 120;

  // --- 2. DOMAIN OVERVIEW ---
  if (roadmap.overview) {
    checkPageBreak(50);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('Executive Overview', margin, y);
    y += 15;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85); // slate-700
    const overviewLines = doc.splitTextToSize(roadmap.overview, contentWidth);
    doc.text(overviewLines, margin, y);
    y += overviewLines.length * 13 + 12;
  }

  // --- 3. CORE TECHNOLOGIES & CERTIFICATIONS ---
  if (roadmap.coreTechnologies?.length || roadmap.recommendedCertifications?.length) {
    checkPageBreak(70);

    const colWidth = (contentWidth - 15) / 2;

    // Tech Column
    if (roadmap.coreTechnologies?.length) {
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y, colWidth, 75, 6, 6, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30, 58, 138); // blue-900
      doc.text('Core Technologies & Tools', margin + 12, y + 18);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      const techStr = roadmap.coreTechnologies.slice(0, 8).join(', ');
      const techLines = doc.splitTextToSize(techStr, colWidth - 24);
      doc.text(techLines, margin + 12, y + 33);
    }

    // Certs Column
    if (roadmap.recommendedCertifications?.length) {
      const col2X = margin + colWidth + 15;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(col2X, y, colWidth, 75, 6, 6, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(67, 24, 255);
      doc.text('Recommended Certifications', col2X + 12, y + 18);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      const certStr = roadmap.recommendedCertifications.slice(0, 4).join(', ');
      const certLines = doc.splitTextToSize(certStr, colWidth - 24);
      doc.text(certLines, col2X + 12, y + 33);
    }

    y += 90;
  }

  // --- 4. STEP-BY-STEP PREPARATION PHASES ---
  if (roadmap.phases?.length) {
    checkPageBreak(40);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text('Preparation Milestones & Execution Plan', margin, y);
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(1.5);
    doc.line(margin, y + 4, margin + 180, y + 4);
    y += 22;

    roadmap.phases.forEach((phase) => {
      checkPageBreak(110);

      // Phase Header Box
      doc.setFillColor(241, 245, 249); // slate-100
      doc.roundedRect(margin, y, contentWidth, 26, 4, 4, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(`Phase ${phase.orderIndex}: ${phase.title}`, margin + 10, y + 17);

      if (phase.duration) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(`Duration: ${phase.duration}`, pageWidth - margin - 10, y + 17, { align: 'right' });
      }
      y += 34;

      // Phase Description
      if (phase.description) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(51, 65, 85);
        const descLines = doc.splitTextToSize(phase.description, contentWidth - 10);
        checkPageBreak(descLines.length * 12 + 10);
        doc.text(descLines, margin + 5, y);
        y += descLines.length * 12 + 8;
      }

      // Key Topics
      if (phase.topics?.length) {
        checkPageBreak(25);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(30, 41, 59);
        doc.text('Key Focus Areas:', margin + 5, y);
        y += 12;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        const topicsStr = phase.topics.join('  •  ');
        const topicLines = doc.splitTextToSize(topicsStr, contentWidth - 10);
        doc.text(topicLines, margin + 5, y);
        y += topicLines.length * 12 + 8;
      }

      // Milestones / Checklist
      if (phase.milestones?.length) {
        checkPageBreak(25);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(30, 41, 59);
        doc.text('Milestones & Action Items:', margin + 5, y);
        y += 12;

        phase.milestones.forEach((m, idx) => {
          checkPageBreak(20);
          const isDone = !!progress[`${phase.phaseId}_m_${idx}`];

          // Checkbox icon
          if (isDone) {
            doc.setFillColor(16, 185, 129); // emerald
            doc.circle(margin + 9, y - 3, 4, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(16, 185, 129);
            doc.text('[DONE]', margin + 18, y);
          } else {
            doc.setDrawColor(148, 163, 184); // slate-400
            doc.circle(margin + 9, y - 3, 4, 'D');
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(100, 116, 139);
            doc.text('[TODO]', margin + 18, y);
          }

          doc.setFont('helvetica', isDone ? 'bold' : 'normal');
          doc.setTextColor(isDone ? 15 : 51, isDone ? 23 : 65, isDone ? 42 : 85);
          const milestoneLines = doc.splitTextToSize(m, contentWidth - 65);
          doc.text(milestoneLines, margin + 58, y);
          y += milestoneLines.length * 12 + 4;
        });
        y += 6;
      }

      // Practical Project
      if (phase.suggestedProjects?.length) {
        phase.suggestedProjects.forEach((proj) => {
          checkPageBreak(60);
          doc.setFillColor(248, 250, 252);
          doc.setDrawColor(203, 213, 225);
          doc.roundedRect(margin + 5, y, contentWidth - 10, 48, 4, 4, 'FD');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9.5);
          doc.setTextColor(15, 23, 42);
          doc.text(`Hands-On Project: ${proj.title} (${proj.difficulty || 'Intermediate'})`, margin + 14, y + 15);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(71, 85, 105);
          const projLines = doc.splitTextToSize(proj.description || '', contentWidth - 28);
          doc.text(projLines.slice(0, 2), margin + 14, y + 28);

          if (proj.technologies?.length) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(37, 99, 235);
            doc.text(`Stack: ${proj.technologies.join(', ')}`, margin + 14, y + 42);
          }

          y += 56;
        });
      }

      y += 12; // Gap between phases
    });
  }

  // --- 5. CAPSTONE PORTFOLIO PROJECTS ---
  if (roadmap.capstoneProjects?.length) {
    checkPageBreak(60);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text('Capstone Portfolio Projects', margin, y);
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(1.5);
    doc.line(margin, y + 4, margin + 150, y + 4);
    y += 22;

    roadmap.capstoneProjects.forEach((cap) => {
      checkPageBreak(70);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(199, 210, 254);
      doc.roundedRect(margin, y, contentWidth, 58, 6, 6, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(30, 27, 75);
      doc.text(`${cap.title} (${cap.difficulty || 'Advanced'})`, margin + 14, y + 17);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      const capLines = doc.splitTextToSize(cap.description || '', contentWidth - 28);
      doc.text(capLines.slice(0, 2), margin + 14, y + 31);

      if (cap.technologies?.length || cap.portfolioImpact) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(79, 70, 229);
        const details = [
          cap.technologies?.length ? `Technologies: ${cap.technologies.join(', ')}` : null,
          cap.portfolioImpact ? `Impact: ${cap.portfolioImpact}` : null,
        ]
          .filter(Boolean)
          .join('  |  ');
        doc.text(details, margin + 14, y + 48);
      }

      y += 68;
    });
  }

  // --- FOOTER ON ALL PAGES ---
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.75);
    doc.line(margin, pageHeight - 30, pageWidth - margin, pageHeight - 30);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(
      'Generated by CareerConnectors AI Platform • Proprietary Career Learning Roadmap',
      margin,
      pageHeight - 18
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 18, { align: 'right' });
  }

  // Save the PDF file
  const fileName = `${(roadmap.domainName || 'Career').replace(/[^a-zA-Z0-9_-]/g, '_')}_Career_Roadmap.pdf`;
  doc.save(fileName);
};
