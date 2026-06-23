import { container } from 'tsyringe';
import { BaseCommand } from '../commands/base-command.ts';
import { SeekJobsCommand } from '../commands/job/seek-jobs.command.ts';
import { ShowMainMenuCommand } from '../commands/show-main-menu/show-menu.command.ts';
import { AdjustTechstackCommand } from '../commands/techstack/adjust-techstack.command.ts';
import { ShowTechstackCommand } from '../commands/techstack/show-techstack.command.ts';
import { LocalStorageService } from '../services/local-storage.service.ts';
import { AdjustSeekingSourcesCommand } from '../commands/settings/adjust-seeking-sources.command.ts';
import { ShowSettingsMenuCommand } from '../commands/settings/show-settings-menu.command.ts';
import { SeekJobService } from '../services/seek-job.service.ts';
import { SeekJobCommand } from '../commands/job/seek-job.command.ts';

import type { SeekSources } from '../resolvers/seek-job.ts';

export type CommandConfigs = {
  "go-back": {
    commandKeyToRewind: CommandKey;
  };
  "seek-job": {
    seekSource: SeekSources;
    slug?: string;
  };
};

const commandKeysValues = {
  'show-main-menu': ['exit', 'settings'] as const,
  'show-settings-menu': ['exit', 'settings'] as const,
  'show-techstack': ['adjust-techstack', 'show-main-menu'] as const,
  'seek-jobs': ['show-main-menu'] as const,
  'show-filters-sorting': [
    'adjust-filters',
    'adjust-sorting',
    'show-main-menu',
  ] as const,
  'adjust-techstack': [] as const,
  'adjust-seeking-sources': [] as const,
  'seek-job': [] as const,
  exit: [] as const,
  "open-job-in-browser": [] as const,
  "go-back": [] as const,
};

export type CommandKey = keyof typeof commandKeysValues;

const buildCommandsSet = () =>
  new Map<CommandKey, BaseCommand>([
    [
      'show-main-menu',
      new ShowMainMenuCommand('Main Menu', [
        { name: 'Seek job', value: 'seek-jobs' },
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
      'seek-jobs',
      new SeekJobsCommand(
        'Seeking for the jobs...',
        container.resolve(LocalStorageService),
        container.resolve(SeekJobService)
      ),
    ],
    [
      'seek-job',
      new SeekJobCommand(
        "Fetching details of job...",
        container.resolve(SeekJobService),
      )
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
    ]
  ]);

let commandsSet: Map<CommandKey, BaseCommand>;

export const getCommandsSet = () => {
  if (!commandsSet) {
    commandsSet = buildCommandsSet();
  }
  return commandsSet;
};

export const getCommand = <K extends CommandKey>(key: K) => {
  return getCommandsSet().get(key)!;
};
