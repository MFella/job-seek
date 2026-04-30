import { select } from '@inquirer/prompts';

export type SelectChoiceItem<T extends string> = {
  value: T;
  name?: string;
  description?: string;
  disabled?: boolean | string;
  type?: never;
};
