export class AsyncHandler<T> {
  private _loading: boolean = false;
  private _error: Error | null = null;
  private _data: T | null = null;
  private currentFetchPromise: Promise<void> | null = null;

  get loading(): boolean {
    return this._loading;
  }

  set loading(value: boolean) {
    this._loading = value;
  }

  get error(): Error | null {
    return this._error;
  }

  set error(value: Error | null) {
    this._error = value;
  }

  get data(): T | null {
    return this._data;
  }

  set data(value: T | null) {
    this._data = value;
  }

  async doAsync(fetchFunction: () => Promise<T>): Promise<T | null> {

    if (this.data) {
      return this.data;
    }

    if (this.currentFetchPromise) {
      await this.currentFetchPromise;
      return this.data;
    }

    this.loading = true;

    this.currentFetchPromise = (async () => {
      try {
        const result = await fetchFunction();
        this.data = result;
        this.error = null;
      } catch (err) {
        this.error = err as Error;
      } finally {
        this.loading = false;
        this.currentFetchPromise = null;
      }
    })();

    await this.currentFetchPromise;
    return this.data;
  }
}
