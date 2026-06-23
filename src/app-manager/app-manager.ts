import { container } from 'tsyringe';
import { ConfigService } from '../config/config.service.ts';
import { Stack } from '../shared/data-structures/stack.ts';
import { RestDataService } from '../rest/rest-data.service.ts';
import { fromEvent } from 'rxjs';
import { CommandConfigs, CommandKey, getCommand } from '../questions/questions.ts';
import { BaseCommand } from '../commands/base-command.ts';
import { LoggerService } from '../logger/logger.service.ts';

type BaseCommandStackNode<T extends CommandKey> = { value: BaseCommand<T>, config?: T extends keyof CommandConfigs ? CommandConfigs[T] : never };

export class AppManager {
  private commandStack = new Stack<BaseCommandStackNode<CommandKey>>([
    { value: getCommand('show-main-menu') },
  ]);
  constructor(
    private readonly configService: ConfigService,
    private readonly restDataService: RestDataService,
    private readonly logger: LoggerService
  ) { }

  private async loadDependencies() { }

  async start() {
    await this.loadDependencies();
    this.observeEscClicked();
    while (!this.commandStack.isEmpty()) {
      const peekedCommand = this.commandStack.peek();

      if (!peekedCommand) {
        this.logger.warn('Skipping empty command...');
        continue;
      }

      const { value: nextCommand } = peekedCommand;
      try {
        if (process.stdin.isTTY) {
          process.stdin.setRawMode(true);
          process.stdin.resume();
        }

        const result = await nextCommand.execute(peekedCommand?.config);

        if (process.stdin.isTTY) {
          process.stdin.setRawMode(false);
        }

        if (!nextCommand.isPermanent()) {
          this.commandStack.removeAtValue(nextCommand);
        }

        for (const next of result) {
          if (next.commandKey === 'exit') {
            this.commandStack.clear();
            return;
          }

          if (next.commandKey === "go-back") {
            const targetKey = next.config?.commandKeyToRewind;
            if (targetKey) {
              this.commandStack.removeUpToValue(getCommand(targetKey));
            }
            continue;
          }
          const resultCommand = getCommand(next.commandKey);

          if (resultCommand) {
            this.commandStack.push({ value: resultCommand, ...(next.config ? { config: next.config } : {}) });
          }
        }
      } catch (error) {
        if (process.stdin.isTTY) {
          process.stdin.setRawMode(false);
        }
        if (nextCommand.isAborted()) {
          continue;
        }
        throw error;
      }
    }
  }

  private observeEscClicked() {
    fromEvent(process.stdin, 'keypress', (_char, key) => {
      return key;
    }).subscribe((key) => {
      if (!key) return;

      if (key.ctrl && key.name === 'c') {
        process.exit(0);
      }

      if (key.name === 'escape') {
        const peekedCommand = this.commandStack.peek();
        if (peekedCommand) {
          const commandKey = peekedCommand.value.getKey();
          if (commandKey === 'show-main-menu') {
            process.exit(0);
          } else {
            // Pop current command and terminate it
            this.commandStack.pop();
            peekedCommand.value.terminate();
            this.logger.info(`Command ${commandKey} aborted`);
          }
        }
      }
    });
  }
}

export default new AppManager(
  new ConfigService(),
  container.resolve(RestDataService),
  container.resolve(LoggerService)
);
