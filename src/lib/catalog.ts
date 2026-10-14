import { AGE_GROUPS, type Book, type Category, type UpcomingBook } from "./site";

export type AnyBook = Book | UpcomingBook;
export type AgeFilter = (typeof AGE_GROUPS)[number]["value"] | "";
export type CategoryFilter = Category | "";

export const isUpcoming = (b: AnyBook): b is UpcomingBook => "status" in b && b.status === "coming-soon";

/** A book matches an age filter when its age range overlaps the group's range. */
export function matchesAge(b: Pick<AnyBook, "ageRange">, age: AgeFilter) {
  if (!age) return true;
  const g = AGE_GROUPS.find((x) => x.value === age);
  if (!g) return true;
  return b.ageRange[0] <= g.range[1] && b.ageRange[1] >= g.range[0];
}

export function matchesCategory(b: Pick<AnyBook, "categories">, category: CategoryFilter) {
  return !category || b.categories.includes(category);
}

export function filterBooks<T extends AnyBook>(list: T[], age: AgeFilter, category: CategoryFilter) {
  return list.filter((b) => matchesAge(b, age) && matchesCategory(b, category));
}
