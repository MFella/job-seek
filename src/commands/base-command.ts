export abstract class BaseCommand<T = string> {
  constructor(protected readonly message: string) {}
  abstract execute(): Promise<T | T[]>;
}
