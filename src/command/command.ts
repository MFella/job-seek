import { confirm, input, number, select } from '@inquirer/prompts';
import type { CommandType, CommandDefaultValue } from './command-types.d.ts';

abstract class BaseCommand {
  constructor(
    protected readonly type: CommandType,
    protected readonly message: string,
    protected readonly defaultValue: CommandDefaultValue<typeof type>
  ) {}
  abstract execute(): Promise<
    CommandDefaultValue<typeof this.type> | undefined
  >;
}

export class Command extends BaseCommand {
  constructor(
    type: CommandType,
    message: string,
    defaultValue: CommandDefaultValue<typeof type>
  ) {
    super(type, message, defaultValue);
  }

  execute() {
    switch (this.type) {
      case 'input':
        return input({
          message: this.message,
          default: this.defaultValue as string,
        });
      case 'select':
        return select({
          message: this.message,
          choices: this.defaultValue as string[],
        });
      case 'confirm':
        return confirm({
          message: this.message,
          default: this.defaultValue as boolean,
        });
      case 'number':
        return number({
          message: this.message,
          default: this.defaultValue as number,
        });
    }
  }
}
