import { CommandKey } from '../questions/questions.ts';

export type NextCommandToExecute = {
  commandKey: CommandKey;
  config?: Record<string, unknown>;
};

export abstract class BaseCommand {
  constructor(
    protected readonly message: string,
    protected readonly isCommandFulfilled: boolean = false
  ) { }
  abstract execute(config?: Record<string, unknown>): Promise<NextCommandToExecute[]>;

  abstract getKey(): CommandKey;

  isFulfilled(): boolean {
    return this.isCommandFulfilled;
  }

  protected onCommandEnd(): void { }
}
