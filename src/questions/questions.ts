import { Command } from '../command/command.js';

export const questionsSet = new Set<Command>([
  new Command('input', 'What is your name?', ''),
  new Command('select', 'What role are you looking for?', [
    'frontend',
    'backend',
    'fullstack',
    'devops',
  ]),
  new Command('confirm', 'Do you want to submit your application?', true),
  new Command('number', 'What is your age?', 0),
]);

const externalSourcesApi = new Set<string>([]);
