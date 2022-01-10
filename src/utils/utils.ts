export const assignPartial = (
  dest: { [key: string]: any },
  source: Partial<{ [key: string]: any }>,
) => {
  for (const key in source) {
    if (source[key] != null) {
      dest[key] = source[key];
    }
  }
};

export const assignOmit = (
  dest: Partial<{ [key: string]: any }>,
  source: { [key: string]: any },
  omitKeys: string[],
) => {
  for (const key in source) {
    if (!omitKeys.includes(key) && source[key] !== null) {
      dest[key] = source[key];
    }
  }
};
