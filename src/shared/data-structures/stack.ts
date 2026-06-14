type ExecutableObject = { execute(config?: Record<string, unknown>): Promise<unknown> };

type ExecutableConfig = Record<string, unknown> | undefined;

type Node<K extends ExecutableObject, Config extends ExecutableConfig> = {
  value: K;
  config?: Config;
};

export class Stack<T extends Node<ExecutableObject, ExecutableConfig>> {
  private stack: T[] = [];

  constructor(readonly initNodes?: T[]) {
    if (initNodes?.length && Array.isArray(initNodes)) {
      this.stack = initNodes;
    }
  }

  push(item: T): void {
    this.stack.push(item);
  }

  pop(): T | undefined {
    return this.stack.pop();
  }

  peek(): T | undefined {
    return this.stack[this.stack.length - 1];
  }

  isEmpty(): boolean {
    return this.stack.length === 0;
  }

  size(): number {
    return this.stack.length;
  }

  clear(): void {
    this.stack = [];
  }
}
