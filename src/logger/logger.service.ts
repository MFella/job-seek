import { singleton } from 'tsyringe';
import pino from 'pino';

@singleton()
export class LoggerService {
  private readonly logger = pino({
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
    level: process.env.LOG_LEVEL || 'info',
  });

  info(message: string, ...args: any[]): void {
    if (args.length > 0) {
      this.logger.info({ context: args }, message);
    } else {
      this.logger.info(message);
    }
  }

  error(message: string, error?: any, ...args: any[]): void {
    this.logger.error({ err: error, context: args }, message);
  }

  warn(message: string, ...args: any[]): void {
    if (args.length > 0) {
      this.logger.warn({ context: args }, message);
    } else {
      this.logger.warn(message);
    }
  }

  debug(message: string, ...args: any[]): void {
    if (args.length > 0) {
      this.logger.debug({ context: args }, message);
    } else {
      this.logger.debug(message);
    }
  }
}
