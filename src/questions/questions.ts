import { BaseCommand } from '../commands/base-command.ts';
import { SeekJobCommand } from '../commands/job/seek-job.command.ts';
import { ShowMainMenuCommand } from '../commands/show-main-menu/show-menu.command.ts';
import { ShowTechstackCommand } from '../commands/techstack/show-techstack.command.ts';

const commandKeysValues = {
  'show-main-menu': ['exit', 'settings'] as const,
  'show-settings-menu': ['exit', 'settings'] as const,
  'show-techstack': ['adjust-techstack', 'show-main-menu'] as const,
  'seek-job': ['show-main-menu'] as const,
  'show-filters-sorting': [
    'adjust-filters',
    'adjust-sorting',
    'show-main-menu',
  ] as const,
};

type CommandKey = keyof typeof commandKeysValues;

export const commandsSet = new Map<
  CommandKey,
  BaseCommand<CommandKey[keyof CommandKey]>
>([
  [
    'show-main-menu',
    new ShowMainMenuCommand('What would you like to do?', [
      { name: 'Seek job', value: 'seek-job' },
      { name: 'My techstack', value: 'show-techstack' },
      { name: 'Settings', value: 'settings' },
      { name: 'Exit', value: 'exit' },
    ]),
  ],
  [
    'seek-job',
    new SeekJobCommand('Seeking for the jobs...', [
      { name: 'Return to main menu', value: 'show-main-menu' },
    ]),
  ],
  [
    'show-techstack',
    new ShowTechstackCommand('What would you like to do?', [
      { name: 'Adjust stack', value: 'adjust-techstack' },
      { name: 'Go to main menu', value: 'show-main-menu' },
    ]),
  ],
]);

export const getCommand = (
  key: CommandKey
): BaseCommand<CommandKey[keyof CommandKey]> => {
  return commandsSet.get(key)!;
};
