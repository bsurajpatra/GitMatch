import fs from 'fs';
import PDFDocument from 'pdfkit';
import { generateCandidateReportPDF } from '../utils/pdfTemplates/candidateReport.js';
import { generateScreeningReportPDF } from '../utils/pdfTemplates/screeningReport.js';
import { generateComparisonReportPDF } from '../utils/pdfTemplates/comparisonReport.js';

class PDFReportService {
  /**
   * Generates a single candidate evaluation PDF report.
   * @param {string} filePath 
   * @param {object} candidateData 
   * @returns {Promise<void>}
   */
  generateCandidateReport(filePath, candidateData) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 54, bufferPages: true });
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);
        
        generateCandidateReportPDF(doc, candidateData);
        
        doc.end();

        stream.on('finish', () => resolve());
        stream.on('error', (err) => reject(err));
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Generates a bulk screening PDF rankings report.
   * @param {string} filePath 
   * @param {object} screeningData 
   * @returns {Promise<void>}
   */
  generateScreeningReport(filePath, screeningData) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 54, bufferPages: true });
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);
        
        generateScreeningReportPDF(doc, screeningData);
        
        doc.end();

        stream.on('finish', () => resolve());
        stream.on('error', (err) => reject(err));
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Generates a candidate comparison PDF report.
   * @param {string} filePath 
   * @param {object} comparisonData 
   * @returns {Promise<void>}
   */
  generateComparisonReport(filePath, comparisonData) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 54, bufferPages: true });
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);
        
        generateComparisonReportPDF(doc, comparisonData);
        
        doc.end();

        stream.on('finish', () => resolve());
        stream.on('error', (err) => reject(err));
      } catch (err) {
        reject(err);
      }
    });
  }
}

export default new PDFReportService();
