export type CommandType = 'input' | 'select' | 'confirm' | 'number';

export type CommandDefaultValue<T extends CommandType> = T extends 'input'
  ? string
  : T extends 'select'
    ? string[]
    : T extends 'confirm'
      ? boolean
      : T extends 'number'
        ? number
        : never;
