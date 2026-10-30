import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { researchWorker } from './workers/research.worker.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`=======================================================`);
  logger.info(`AI RESEARCH COPILOT - BACKEND SERVICE STARTED`);
  logger.info(`Port:        ${env.PORT}`);
  logger.info(`Environment: ${env.NODE_ENV}`);
  logger.info(`Health:      http://localhost:${env.PORT}/health`);
  logger.info(`API Base:    http://localhost:${env.PORT}/api/v1`);
  logger.info(`=======================================================`);

  // Start background research queue worker
  researchWorker.start();
});

// Graceful Shutdown
function handleShutdown(signal: string) {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  researchWorker.stop();
  server.close(() => {
    logger.info('HTTP server closed successfully. Process exiting.');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forcefully terminating process due to shutdown timeout.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

