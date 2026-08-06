export type SelectChoiceItem<T extends string> = {
  value: T;
  name?: string;
  description?: string;
  disabled?: boolean | string;
};
