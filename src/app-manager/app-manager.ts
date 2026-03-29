import { ConfigService } from '../config/config.service.ts';
import { getCommand } from '../questions/questions.ts';

export class AppManager {
  private programRunning = false;
  constructor(private readonly configService: ConfigService) {}

  async start() {
    this.programRunning = true;

    while (this.programRunning) {
      const showMenuCommand = getCommand('show-main-menu');
      const result = await showMenuCommand.execute();

      switch (result) {
        case 'exit':
          this.programRunning = false;
          break;
        case 'settings':
          console.log('There will be settings...');
          break;
        case 'seek-job':
          const seekJobCommand = getCommand('seek-job');
          await seekJobCommand.execute();
          break;
        case 'show-techstack':
          const showTechstackCommand = getCommand('show-techstack');
          await showTechstackCommand.execute();
          break;
      }
    }
  }
}

export default new AppManager(new ConfigService());
