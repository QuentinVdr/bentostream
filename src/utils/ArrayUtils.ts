/**
 * Utility functions for working with arrays.
 */

/**
 * Checks if an array contains a specific value.
 * @param array - The array to search.
 * @param value - The value to find.
 * @returns True if the value is found, false otherwise.
 */
export const arrayContains = <T>(array: T[], value: T): boolean => {
  return array.includes(value);
};

/**
 * Checks if two arrays are the same.
 * @param array1 - The first array to compare.
 * @param array2 - The second array to compare.
 * @returns True if the arrays are the same, false otherwise.
 */
export const arraysAreSame = <T>(array1: T[], array2: T[]): boolean => {
  if (array1.length !== array2.length) {
    return false;
  }
  for (let i = 0; i < array1.length; i++) {
    if (array1[i] !== array2[i]) {
      return false;
    }
  }
  return true;
};

/**
 * check if two arrays got same values, regardless of order
 * @param array1 - The first array to compare.
 * @param array2 - The second array to compare.
 * @returns True if the arrays have the same values, false otherwise.
 */
export const arraysHaveSameValues = <T>(array1: T[], array2: T[]): boolean => {
  if (array1.length !== array2.length) {
    return false;
  }
  const sortedArray1 = [...array1].sort();
  const sortedArray2 = [...array2].sort();
  for (let i = 0; i < sortedArray1.length; i++) {
    if (sortedArray1[i] !== sortedArray2[i]) {
      return false;
    }
  }
  return true;
};

/**
 * Swap two elements in an array.
 * @param array - The array to modify.
 * @param a - The first element.
 * @param b - The second element.
 */
export const swapArrayElements = <T>(array: T[], a: T, b: T): void => {
  const idxA = array.indexOf(a);
  const idxB = array.indexOf(b);
  if (idxA === -1 || idxB === -1) {
    throw new Error('Invalid elements');
  }
  const temp = array[idxA];
  array[idxA] = array[idxB];
  array[idxB] = temp;
};
