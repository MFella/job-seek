import { ConfigService } from '../config/config.service.ts';
import { getCommand } from '../questions/questions.ts';

export class AppManager {
  private programRunning = true;
  constructor(private readonly configService: ConfigService) {}

  private static loadDependencies() {}

  async start() {
    AppManager.loadDependencies();
    while (this.programRunning) {
      const showMenuCommand = getCommand('show-main-menu');
      const result = await showMenuCommand.execute();

      switch (result) {
        case 'exit':
          this.programRunning = false;
          break;
        case 'seek-job':
          const seekJobCommand = getCommand('seek-job');
          await seekJobCommand.execute();
          break;
        case 'show-techstack':
          const showTechstackCommand = getCommand('show-techstack');
          await showTechstackCommand.execute();
          break;
        case 'show-settings-menu':
          const showSettingsMenuCommand = getCommand('show-settings-menu');
          await showSettingsMenuCommand.execute();
          break;
      }
    }
  }
}

export default new AppManager(new ConfigService());
