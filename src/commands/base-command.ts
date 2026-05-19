import { CommandKey } from '../questions/questions.ts';

export type NextCommandToExecute = {
  commandKey: CommandKey;
  config?: any;
};

export abstract class BaseCommand {
  constructor(protected readonly message: string) {}
  abstract execute(): Promise<NextCommandToExecute[]>;
}
