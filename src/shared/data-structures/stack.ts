type ExecutableObject = { execute(): Promise<unknown> };

type Node<K extends ExecutableObject> = {
  value: K;
};

export class Stack<T extends Node<ExecutableObject>> {
  private stack: T[] = [];

  constructor(private readonly initNodes?: T[]) {
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
