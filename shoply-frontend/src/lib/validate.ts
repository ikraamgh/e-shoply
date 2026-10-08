import type { ZodSchema } from "zod";

export type FieldErrors<K extends string = string> = Partial<Record<K, string>>;

/** Validate with zod and return a flat field→message map. */
export function validate<T>(schema: ZodSchema<T>, data: unknown): { ok: true; data: T } | { ok: false; errors: FieldErrors } {
  const r = schema.safeParse(data);
  if (r.success) return { ok: true, data: r.data };
  const errors: FieldErrors = {};
  for (const issue of r.error.issues) {
    const k = issue.path.join(".");
    if (!errors[k]) errors[k] = issue.message;
  }
  return { ok: false, errors };
}
