import { container } from 'tsyringe';
import { ConfigService } from '../config/config.service.ts';
import {
  CommandKey,
  getCommand,
  getCommandsSet,
} from '../questions/questions.ts';
import { Stack } from '../shared/data-structures/stack.ts';
import { RestDataService } from '../rest/rest-data.service.ts';

export class AppManager {
  private commandStack = new Stack([{ value: getCommand('show-main-menu') }]);
  constructor(
    private readonly configService: ConfigService,
    private readonly restDataService: RestDataService
  ) {}

  private async loadDependencies() {}

  async start() {
    await this.loadDependencies();
    while (!this.commandStack.isEmpty()) {
      const nextCommand = this.commandStack.pop()?.value;

      if (!nextCommand) {
        console.log('Skipping empty command...');
        continue;
      }

      const result = await nextCommand.execute();

      result.forEach(({ commandKey }) => {
        if (commandKey === 'exit') {
          this.commandStack.clear();
          return;
        }
        const resultCommand = getCommand(commandKey);

        if (resultCommand) {
          this.commandStack.push({ value: resultCommand });
        }
      });
    }
  }
}

export default new AppManager(
  new ConfigService(),
  container.resolve(RestDataService)
);
