import { container } from 'tsyringe';
import { BaseCommand } from '../commands/base-command.ts';
import { SeekJobCommand } from '../commands/job/seek-job.command.ts';
import { ShowMainMenuCommand } from '../commands/show-main-menu/show-menu.command.ts';
import { AdjustTechstackCommand } from '../commands/techstack/adjust-techstack.command.ts';
import { ShowTechstackCommand } from '../commands/techstack/show-techstack.command.ts';
import { LocalStorageService } from '../services/local-storage.service.ts';
import { AdjustSeekingSourcesCommand } from '../commands/settings/adjust-seeking-sources.command.ts';
import { ShowSettingsMenuCommand } from '../commands/settings/show-settings-menu.command.ts';

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
  'adjust-techstack': [] as const,
  'adjust-seeking-sources': [] as const,
};

type CommandKey = keyof typeof commandKeysValues;

export const commandsSet = new Map<
  CommandKey,
  BaseCommand<CommandKey[keyof CommandKey]>
>([
  [
    'show-main-menu',
    new ShowMainMenuCommand('Main Menu', [
      { name: 'Seek job', value: 'seek-job' },
      { name: 'My techstack', value: 'show-techstack' },
      { name: 'Settings', value: 'show-settings-menu' },
      { name: 'Exit', value: 'exit' },
    ]),
  ],
  [
    'show-settings-menu',
    new ShowSettingsMenuCommand('Settings', [
      { name: 'Adjust seeking sources', value: 'adjust-seeking-sources' },
      { name: 'Go to main menu', value: 'show-main-menu' },
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
    new ShowTechstackCommand(
      'What would you like to do?',
      [
        { name: 'Adjust stack', value: 'adjust-techstack' },
        { name: 'Go to main menu', value: 'show-main-menu' },
      ],
      container.resolve(LocalStorageService)
    ),
  ],
  [
    'adjust-techstack',
    new AdjustTechstackCommand(
      'Write your preferences in format: [tech1, tech2, tech3, ...]',
      [
        { name: 'Show techstack', value: 'show-techstack' },
        { name: 'Go back', value: 'go-back' },
      ],
      container.resolve(LocalStorageService)
    ),
  ],
  [
    'adjust-seeking-sources',
    new AdjustSeekingSourcesCommand(
      'Choose sources you want to seek jobs from:',
      [
        { name: 'SolidJobs', value: 'solid-jobs' },
        { name: 'ProtocolIt', value: 'protocol-it' },
        { name: 'JustJoinIt', value: 'just-join-it' },
        { name: 'NoFluffJobs', value: 'no-fluff-jobs' },
        // { name: 'PracujPl', value: 'pracuj-pl' },
        // { name: 'LinkedIn', value: 'linkedin' },
      ],
      container.resolve(LocalStorageService)
    ),
  ],
]);

export const getCommand = (
  key: CommandKey
): BaseCommand<CommandKey[keyof CommandKey]> => {
  return commandsSet.get(key)!;
};
