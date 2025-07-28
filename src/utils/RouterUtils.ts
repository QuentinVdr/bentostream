const customSearchParamSerializer = {
  stringify: (search: Record<string, unknown>): string => {
    const params = new URLSearchParams();

    Object.entries(search).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          params.set(key, value.join('.'));
        }
      } else if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    });

    const result = params.toString();
    return result ? `?${result}` : '';
  },

  parse: (searchStr: string): Record<string, unknown> => {
    const search: Record<string, unknown> = {};
    const params = new URLSearchParams(searchStr);

    params.forEach((value, key) => {
      if (key === 'streams' && value) {
        search[key] = value
          .split('.')
          .map(item => item.trim())
          .filter(Boolean);
      } else {
        search[key] = value;
      }
    });

    return search;
  },
};

export default customSearchParamSerializer;
