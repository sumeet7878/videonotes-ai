import { jsPDF } from 'jspdf';
import type { GeneratedNotes } from '../types';

const BLUE_HEADER = [14, 71, 161] as const;
const BLUE_LIGHT = [66, 133, 244] as const;
const GRAY_TEXT = [60, 60, 60] as const;
const GRAY_LIGHT = [245, 247, 250] as const;
const WHITE = [255, 255, 255] as const;
const ACCENT = [234, 67, 53] as const;

function setColor(doc: jsPDF, color: readonly [number, number, number]) {
  doc.setTextColor(color[0], color[1], color[2]);
}

function setFillColor(doc: jsPDF, color: readonly [number, number, number]) {
  doc.setFillColor(color[0], color[1], color[2]);
}

function setDrawColor(doc: jsPDF, color: readonly [number, number, number]) {
  doc.setDrawColor(color[0], color[1], color[2]);
}

// ─── Smart Notes PDF ──────────────────────────────────────────────────────────

export async function generateSmartNotesPdf(notes: GeneratedNotes): Promise<string> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentW = pageW - margin * 2;
  let y = 0;

  const addPage = () => {
    doc.addPage();
    y = margin;
    drawPageFooter(doc, pageW, pageH, doc.internal.pages.length - 1);
  };

  const checkY = (needed: number) => {
    if (y + needed > pageH - 20) addPage();
  };

  // Cover page
  setFillColor(doc, BLUE_HEADER);
  doc.rect(0, 0, pageW, pageH, 'F');

  // Decorative circles
  doc.setFillColor(255, 255, 255);
  doc.circle(pageW - 20, 20, 40, 'F');
  doc.setFillColor(66, 133, 244);
  doc.circle(pageW - 20, 20, 32, 'F');

  setFillColor(doc, [255, 255, 255]);
  doc.roundedRect(margin, 60, contentW, 120, 4, 4, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  setColor(doc, BLUE_HEADER);
  doc.text('NoteVision AI', margin + 10, 85);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  setColor(doc, GRAY_TEXT);
  doc.text('AI-Powered Video Notes Generator', margin + 10, 94);

  // Divider
  setDrawColor(doc, BLUE_LIGHT);
  doc.setLineWidth(0.5);
  doc.line(margin + 10, 98, pageW - margin - 10, 98);

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  setColor(doc, GRAY_TEXT);
  const titleLines = doc.splitTextToSize(notes.videoTitle, contentW - 20);
  doc.text(titleLines, margin + 10, 110);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  setColor(doc, [100, 100, 100]);
  doc.text(`Duration: ${notes.duration}`, margin + 10, 128);
  doc.text(`Generated: ${notes.generatedAt}`, margin + 10, 135);
  doc.text(`${notes.sections.length} frames analyzed`, margin + 10, 142);

  // Summary box
  setFillColor(doc, BLUE_HEADER);
  doc.roundedRect(margin, 190, contentW, 60, 4, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  setColor(doc, WHITE);
  doc.text('EXECUTIVE SUMMARY', margin + 10, 203);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  setColor(doc, [200, 220, 255]);
  const summaryLines = doc.splitTextToSize(notes.summary, contentW - 20);
  doc.text(summaryLines.slice(0, 5), margin + 10, 213);

  drawPageFooter(doc, pageW, pageH, 1);

  // TOC page
  doc.addPage();
  y = margin;
  drawPageHeader(doc, pageW, margin, 'Table of Contents', notes.videoTitle);
  y = margin + 22;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  notes.tableOfContents.forEach((item, idx) => {
    checkY(8);
    const isEven = idx % 2 === 0;
    if (isEven) {
      setFillColor(doc, GRAY_LIGHT);
      doc.rect(margin, y - 4, contentW, 8, 'F');
    }
    setColor(doc, BLUE_HEADER);
    doc.text(item, margin + 4, y + 1);

    // Page number estimation
    setColor(doc, [150, 150, 150]);
    doc.text(`pg ${idx + 3}`, pageW - margin - 2, y + 1, { align: 'right' });
    y += 9;
  });

  drawPageFooter(doc, pageW, pageH, 2);

  // Content pages
  for (let i = 0; i < notes.sections.length; i++) {
    const section = notes.sections[i];
    doc.addPage();
    y = margin;

    drawPageHeader(doc, pageW, margin, `Frame ${i + 1} of ${notes.sections.length}`, section.timestamp);
    y = margin + 22;

    // Image
    if (section.imageDataUrl && section.imageDataUrl.startsWith('data:')) {
      const imgH = (contentW * 9) / 16;
      checkY(imgH + 5);
      try {
        doc.addImage(section.imageDataUrl, 'JPEG', margin, y, contentW, imgH);
        // Timestamp overlay
        setFillColor(doc, BLUE_HEADER);
        doc.roundedRect(margin + 2, y + imgH - 9, 22, 8, 2, 2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        setColor(doc, WHITE);
        doc.text(`⏱ ${section.timestamp}`, margin + 4, y + imgH - 4);
        y += imgH + 6;
      } catch {
        y += 4;
      }
    }

    // Key Point banner
    checkY(14);
    setFillColor(doc, BLUE_HEADER);
    doc.roundedRect(margin, y, contentW, 12, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    setColor(doc, WHITE);
    doc.text('KEY POINT', margin + 4, y + 8);
    y += 14;

    checkY(20);
    setFillColor(doc, [232, 240, 254]);
    doc.roundedRect(margin, y, contentW, 14, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    setColor(doc, [13, 71, 161]);
    const kpLines = doc.splitTextToSize(section.keyPoint, contentW - 8);
    doc.text(kpLines[0], margin + 4, y + 9);
    y += 16;

    // Explanation
    checkY(10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    setColor(doc, BLUE_LIGHT);
    doc.text('EXPLANATION', margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    setColor(doc, GRAY_TEXT);
    const expLines = doc.splitTextToSize(section.explanation, contentW);
    checkY(expLines.length * 5 + 4);
    doc.text(expLines, margin, y);
    y += expLines.length * 5 + 6;

    // Important details
    if (section.importantDetails.length > 0) {
      checkY(10);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      setColor(doc, ACCENT);
      doc.text('IMPORTANT DETAILS', margin, y);
      y += 6;

      section.importantDetails.forEach((detail) => {
        checkY(8);
        setFillColor(doc, [255, 243, 242]);
        doc.roundedRect(margin, y - 3, contentW, 7, 1, 1, 'F');
        setColor(doc, [100, 0, 0]);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const dLines = doc.splitTextToSize(`• ${detail}`, contentW - 8);
        doc.text(dLines[0], margin + 4, y + 2);
        y += 8;
      });
      y += 3;
    }

    // Highlight terms
    if (section.highlightTerms.length > 0) {
      checkY(14);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      setColor(doc, [80, 80, 80]);
      doc.text('KEY TERMS: ', margin, y);
      let tx = margin + doc.getTextWidth('KEY TERMS: ');
      section.highlightTerms.forEach((term) => {
        const tw = doc.getTextWidth(term) + 6;
        if (tx + tw > pageW - margin) {
          y += 7;
          tx = margin;
        }
        setFillColor(doc, [255, 245, 157]);
        doc.roundedRect(tx, y - 5, tw, 6, 1, 1, 'F');
        setColor(doc, [33, 33, 33]);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.text(term, tx + 3, y);
        tx += tw + 3;
      });
      y += 8;
    }

    drawPageFooter(doc, pageW, pageH, i + 3);
  }

  return doc.output('datauristring');
}

function drawPageHeader(doc: jsPDF, pageW: number, margin: number, label: string, subtitle: string) {
  setFillColor(doc, BLUE_HEADER);
  doc.rect(0, 0, pageW, 18, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  setColor(doc, WHITE);
  doc.text('NoteVision AI', margin, 11);

  setColor(doc, [160, 200, 255]);
  doc.setFont('helvetica', 'normal');
  doc.text(label, pageW / 2, 11, { align: 'center' });

  setColor(doc, [160, 200, 255]);
  doc.setFontSize(8);
  doc.text(subtitle, pageW - margin, 11, { align: 'right' });
}

function drawPageFooter(doc: jsPDF, pageW: number, pageH: number, pageNum: number) {
  setFillColor(doc, GRAY_LIGHT);
  doc.rect(0, pageH - 12, pageW, 12, 'F');
  setColor(doc, [150, 150, 150]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Generated by NoteVision AI', 15, pageH - 5);
  doc.text(`Page ${pageNum}`, pageW - 15, pageH - 5, { align: 'right' });
}


// ─── Handwritten Notes PDF ────────────────────────────────────────────────────

const HW_BLUE = [26, 35, 126] as const;   // #1a237e
const HW_RED = [198, 40, 40] as const;    // #c62828
const HW_YELLOW = [255, 245, 0] as const;
const LINE_COLOR = [180, 200, 230] as const;
const PAGE_BG = [255, 253, 240] as const;

export async function generateHandwrittenPdf(notes: GeneratedNotes): Promise<string> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentW = pageW - margin * 2;
  let y = 0;
  let pageCount = 0;

  const newPage = (first = false) => {
    if (!first) doc.addPage();
    pageCount++;
    drawLinedBackground(doc, pageW, pageH, margin);
    y = margin + 10;
    addWatermark(doc, pageW, pageH, pageCount);
  };

  const checkY = (needed: number) => {
    if (y + needed > pageH - 18) newPage();
  };

  newPage(true);

  // Title section
  doc.setFont('helvetica', 'bolditalic');
  doc.setFontSize(22);
  setColor(doc, HW_BLUE);
  doc.text('NoteVision AI', margin, y);
  y += 8;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  setColor(doc, [80, 80, 120]);
  doc.text('AI-Generated Handwritten Style Notes', margin, y);
  y += 10;

  // Underline title area
  setDrawColor(doc, HW_BLUE);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  // Video title (big handwriting style)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  setColor(doc, HW_BLUE);
  const titleLines = doc.splitTextToSize(notes.videoTitle, contentW);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 9 + 3;

  // Date/duration in red
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  setColor(doc, HW_RED);
  doc.text(`Date: ${notes.generatedAt}  |  Duration: ${notes.duration}`, margin, y);
  y += 10;

  // Summary
  checkY(20);
  drawMarginDoodle(doc, margin, y, 'star');
  doc.setFont('helvetica', 'bolditalic');
  doc.setFontSize(13);
  setColor(doc, HW_RED);
  doc.text('Summary:', margin + 5, y + 1);
  y += 8;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  setColor(doc, HW_BLUE);
  const sumLines = doc.splitTextToSize(notes.summary, contentW - 5);
  sumLines.forEach((line: string) => {
    checkY(7);
    doc.text(line, margin + 5, y);
    y += 6;
  });
  y += 6;

  // Sections
  for (let i = 0; i < notes.sections.length; i++) {
    const section = notes.sections[i];

    checkY(20);
    drawMarginDoodle(doc, margin, y, i % 3 === 0 ? 'circle' : i % 3 === 1 ? 'arrow' : 'star');

    // Section header with yellow highlight
    const headerText = `${i + 1}. Scene at ${section.timestamp}`;
    const headerW = doc.getTextWidth(headerText) + 6;
    setFillColor(doc, HW_YELLOW);
    doc.rect(margin + 4, y - 6, headerW, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    setColor(doc, HW_BLUE);
    doc.text(headerText, margin + 5, y);
    y += 8;

    // Image (smaller for handwritten feel)
    if (section.imageDataUrl && section.imageDataUrl.startsWith('data:')) {
      const imgW = contentW * 0.75;
      const imgH = (imgW * 9) / 16;
      checkY(imgH + 8);
      try {
        // Slight rotation for realism
        doc.saveGraphicsState();
        // jsPDF doesn't support rotation transforms easily, so we skip tilt on image
        doc.addImage(section.imageDataUrl, 'JPEG', margin + 5, y, imgW, imgH);
        // Polaroid-style border
        setDrawColor(doc, [180, 180, 180]);
        doc.setLineWidth(0.5);
        doc.rect(margin + 5, y, imgW, imgH);
        doc.restoreGraphicsState();
        // Caption below image
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.5);
        setColor(doc, [100, 100, 140]);
        doc.text(`↑ Frame at ${section.timestamp}`, margin + 5, y + imgH + 5);
        y += imgH + 10;
      } catch {
        y += 4;
      }
    }

    // Key Point with yellow highlight on important words
    checkY(10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    setColor(doc, HW_RED);
    doc.text('Key Point: ', margin + 5, y);
    const kpLabelW = doc.getTextWidth('Key Point: ');
    doc.setFont('helvetica', 'italic');
    setColor(doc, HW_BLUE);
    const kpLines = doc.splitTextToSize(section.keyPoint, contentW - kpLabelW - 5);
    doc.text(kpLines[0], margin + 5 + kpLabelW, y);
    if (kpLines.length > 1) {
      y += 6;
      doc.text(kpLines.slice(1), margin + 5, y);
    }
    y += 8;

    // Explanation
    checkY(10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    setColor(doc, HW_BLUE);
    const expLines = doc.splitTextToSize(section.explanation, contentW - 5);
    expLines.forEach((line: string) => {
      checkY(7);
      doc.text(line, margin + 5, y);
      y += 6;
    });
    y += 3;

    // Important details as bullet list in red
    if (section.importantDetails.length > 0) {
      checkY(8);
      doc.setFont('helvetica', 'bolditalic');
      doc.setFontSize(10);
      setColor(doc, HW_RED);
      doc.text('! Important:', margin + 5, y);
      y += 6;

      section.importantDetails.forEach((detail) => {
        checkY(7);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9.5);
        setColor(doc, HW_RED);
        const dLines = doc.splitTextToSize(`→ ${detail}`, contentW - 10);
        doc.text(dLines[0], margin + 8, y);
        y += 6;
      });
      y += 2;
    }

    // Highlighted terms
    if (section.highlightTerms.length > 0) {
      checkY(10);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      setColor(doc, [60, 60, 100]);
      doc.text('Terms: ', margin + 5, y);
      let tx = margin + 5 + doc.getTextWidth('Terms: ');

      section.highlightTerms.forEach((term) => {
        const tw = doc.getTextWidth(term) + 4;
        if (tx + tw > pageW - margin) {
          y += 6;
          tx = margin + 5;
        }
        setFillColor(doc, HW_YELLOW);
        doc.rect(tx, y - 5, tw, 6, 'F');
        setColor(doc, HW_BLUE);
        doc.setFont('helvetica', 'bolditalic');
        doc.text(term, tx + 2, y);
        tx += tw + 3;
      });
      y += 8;
    }

    // Section divider
    checkY(6);
    setDrawColor(doc, [180, 200, 230]);
    doc.setLineWidth(0.3);
    doc.setLineDashPattern([2, 2], 0);
    doc.line(margin + 5, y, pageW - margin - 5, y);
    doc.setLineDashPattern([], 0);
    y += 8;
  }

  return doc.output('datauristring');
}

function drawLinedBackground(doc: jsPDF, pageW: number, pageH: number, margin: number) {
  // Cream/notebook background
  setFillColor(doc, PAGE_BG);
  doc.rect(0, 0, pageW, pageH, 'F');

  // Red margin line
  setDrawColor(doc, [255, 150, 150]);
  doc.setLineWidth(0.4);
  doc.line(margin + 8, 0, margin + 8, pageH);

  // Blue horizontal lines like a notebook
  setDrawColor(doc, LINE_COLOR);
  doc.setLineWidth(0.2);
  for (let lineY = 18; lineY < pageH - 10; lineY += 7) {
    doc.line(0, lineY, pageW, lineY);
  }
}

function addWatermark(doc: jsPDF, pageW: number, pageH: number, pageNum: number) {
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  setColor(doc, [180, 180, 200]);
  doc.text(`Written by AI ✨  |  NoteVision AI  |  Page ${pageNum}`, pageW - 15, pageH - 5, { align: 'right' });
}

function drawMarginDoodle(doc: jsPDF, margin: number, y: number, type: 'star' | 'circle' | 'arrow') {
  const x = margin - 8;
  setDrawColor(doc, HW_BLUE);
  doc.setLineWidth(0.5);

  if (type === 'star') {
    // Simple asterisk star
    doc.line(x, y - 4, x, y + 4);
    doc.line(x - 3, y - 2, x + 3, y + 2);
    doc.line(x - 3, y + 2, x + 3, y - 2);
  } else if (type === 'circle') {
    doc.circle(x, y, 2.5);
  } else {
    // Arrow
    doc.line(x - 3, y, x + 3, y);
    doc.line(x + 1, y - 2, x + 3, y);
    doc.line(x + 1, y + 2, x + 3, y);
  }
}
