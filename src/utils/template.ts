import type { TemplateVariables } from "../types";

const PLACEHOLDER_PATTERN = /\{\{(\w+)\}\}/g;

export function renderTemplate(content: string, variables: TemplateVariables): string {
  return content.replace(PLACEHOLDER_PATTERN, (_, key: keyof TemplateVariables) => {
    return variables[key] ?? "";
  });
}
