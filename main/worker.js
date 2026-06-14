import { parentPort, workerData } from 'worker_threads';
import processJobFit from '../analytics/processor.js';

/**
 * Worker thread for CPU-bound Job Fit analysis.
 * Receives { repos, jobDescription } via workerData,
 * runs the full analysis pipeline, and posts the result back.
 */
try {
  const { repos, jobDescription } = workerData;
  const result = processJobFit(repos, jobDescription);
  parentPort.postMessage(result);
} catch (error) {
  parentPort.postMessage({ error: error.message });
}
