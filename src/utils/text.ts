export function toProjectSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "project-starter-app";
}

export function toPackageName(value: string): string {
  return toProjectSlug(value).replace(/-/g, "_");
}
