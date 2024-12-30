export class CustomMap<K extends string, V> {
  private o: Record<K, V> = {} as Record<K, V>;

  set(key: K, value: V): void {
    this.o[key] = value;
  }

  get(key: K): V | undefined {
    return this.o[key];
  }

  has(key: K): boolean {
    return key in this.o;
  }

  delete(key: K): void {
    delete this.o[key];
  }

  clear(): void {
    this.o = {} as Record<K, V>;
  }

  keys(): K[] {
    return Object.keys(this.o) as K[];
  }

  values(): V[] {
    return Object.values(this.o) as V[];
  }

  entries(): [K, V][] {
    return Object.entries(this.o) as [K, V][];
  }

  forEach(callback: (value: V, key: K) => void): void {
    for (const key in this.o) {
      if (this.o.hasOwnProperty(key)) {
        callback(this.o[key], key);
      }
    }
  }
}