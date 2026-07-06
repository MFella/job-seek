type ExecutableObject = {
  execute(config?: ExecutableConfig): Promise<unknown>;
};

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

  removeAtValue(value: ExecutableObject): boolean {
    const nodeIndex = this.stack.findIndex((node) => node.value === value);
    if (nodeIndex === -1) {
      return false;
    }

    return this.stack.splice(nodeIndex, 1).length === 1;
  }

  removeUpToValue(value: ExecutableObject): boolean {
    const nodeIndex = this.stack.findIndex((node) => node.value === value);
    if (nodeIndex === -1) {
      return false;
    }

    if (nodeIndex === this.stack.length - 1) {
      return true;
    }

    return (
      this.stack.splice(nodeIndex, this.stack.length - nodeIndex).length ===
      this.stack.length - nodeIndex
    );
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
