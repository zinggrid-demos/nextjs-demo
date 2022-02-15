/*
 * Array of suitability strings in order. An index
 * into this array is what's stored in the database.
 *
 * Note that we put TV-G in between TV-Y and
 * TV-Y7, as some G content might not be suitable
 * for the under-7 crowd.
 */
export const suitabilities = [
  "TV-Y",
  "TV-G",
  "TV-Y7",
  "TV-Y7 FV",
  "TV-PG",
  "TV-14",
  "TV-MA"
]

export const adminSuitability = suitabilities.length - 1
