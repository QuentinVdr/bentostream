function debounce<T extends (...args: unknown[]) => unknown>(func: T, wait: number): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout;

  const debounced = ((...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T & { cancel: () => void };

  debounced.cancel = () => clearTimeout(timeout);

  return debounced;
}

export default debounce;
