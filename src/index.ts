import 'reflect-metadata';
import appManager from './app-manager/app-manager.ts';
import readline from 'readline';
import { container } from 'tsyringe';
import { LoggerService } from './logger/logger.service.ts';

const logger = container.resolve(LoggerService);

readline.emitKeypressEvents(process.stdin);

appManager.start().catch((error) => {
  if (error instanceof Error && error.name === 'ExitPromptError') {
    // Handle user force closed the prompt
    logger.info('Prompt closed.');
  } else {
    logger.error('An unexpected error occurred', error);
    process.exit(1);
  }
});
