import { CommandConfigs, CommandKey } from '../questions/questions.ts';

export type NextCommandToExecute<K extends CommandKey = CommandKey> = {
  [P in K]: {
    commandKey: P;
    config?: P extends keyof CommandConfigs ? CommandConfigs[P] : never;
  };
}[K];

export abstract class BaseCommand<T extends CommandKey = CommandKey> {
  protected abortController = new AbortController();

  constructor(
    protected readonly message: string,
    protected readonly isCommandPermanent: boolean = true
  ) {}
  abstract execute(
    config?: T extends keyof CommandConfigs ? CommandConfigs[T] : never
  ): Promise<NextCommandToExecute[]>;

  abstract getKey(): CommandKey;

  terminate(): void {
    this.abortController.abort();
  }

  isAborted(): boolean {
    return this.abortController.signal.aborted;
  }

  protected get executionTerminationSignal(): AbortSignal {
    if (this.abortController.signal.aborted) {
      this.abortController = new AbortController();
    }
    return this.abortController.signal;
  }

  // Permanent means that command won't be removed from the stack after execution
  isPermanent(): boolean {
    return this.isCommandPermanent;
  }
}
