class SafeLocalStorage implements Storage {
  get length() {
    if (typeof window === 'undefined') return 0;
    return window.localStorage.length;
  }

  clear() {
    if (typeof window === 'undefined') return;
    window.localStorage.clear();
  }

  getItem(key: string) {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(key);
  }

  key(index: number) {
    if (typeof window === 'undefined') return null;
    return window.localStorage.key(index);
  }

  removeItem(key: string) {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(key);
  }

  setItem(key: string, value: string) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, value);
  }
}

export const safeLocalStorage: Storage = new SafeLocalStorage();