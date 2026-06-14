import { container } from 'tsyringe';
import { ConfigService } from '../config/config.service.ts';
import { Stack } from '../shared/data-structures/stack.ts';
import { RestDataService } from '../rest/rest-data.service.ts';
import { fromEvent } from 'rxjs';
import { getCommand } from '../questions/questions.ts';
import { BaseCommand } from '../commands/base-command.ts';

type BaseCommandStackNode = { value: BaseCommand; config?: Record<string, unknown> };

export class AppManager {
  private commandStack = new Stack<BaseCommandStackNode>([
    { value: getCommand('show-main-menu') },
  ]);
  constructor(
    private readonly configService: ConfigService,
    private readonly restDataService: RestDataService
  ) { }

  private async loadDependencies() { }

  async start() {
    await this.loadDependencies();
    this.observeEscClicked();
    while (!this.commandStack.isEmpty()) {
      const peekedCommand = this.commandStack.peek();

      if (!peekedCommand) {
        console.log('Skipping empty command...');
        continue;
      }

      const { value: nextCommand } = peekedCommand;
      const result = await nextCommand.execute(peekedCommand?.config);

      result.forEach(({ commandKey, config }) => {
        if (commandKey === 'exit') {
          this.commandStack.clear();
          return;
        }
        const resultCommand = getCommand(commandKey);

        if (resultCommand) {
          this.commandStack.push({ value: resultCommand, ...(config ? { config } : {}) });
        }
      });
    }
  }

  private observeEscClicked() {
    fromEvent(process.stdin, 'keypress', (_key, data) => {
      return data.name;
    }).subscribe((key) => {
      if (key === 'escape') {
        console.log('popping...');
        const commandKey = this.commandStack.peek()?.value?.getKey();
        if (commandKey === 'show-main-menu') {
          process.exit(0);
        } else {
        }
      }
    });
  }
}

export default new AppManager(
  new ConfigService(),
  container.resolve(RestDataService)
);
