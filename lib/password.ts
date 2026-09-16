/**
 * Client-side password policy for registration.
 *
 * NOTE: the API only enforces `minLength: 8` (see RegisterRequest in
 * predictx-api.json). Everything stricter here is guidance at the point of
 * entry, not a security control — a client can always call the API directly.
 * The same rules should be mirrored in the Laravel validator to actually hold.
 */

export interface PasswordRule {
  id: string;
  label: string;
  test: (value: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (v) => v.length >= 8,
  },
  {
    id: "lower",
    label: "A lowercase letter",
    test: (v) => /[a-z]/.test(v),
  },
  {
    id: "upper",
    label: "An uppercase letter",
    test: (v) => /[A-Z]/.test(v),
  },
  {
    id: "number",
    label: "A number",
    test: (v) => /[0-9]/.test(v),
  },
  {
    id: "symbol",
    label: "A symbol (!?@#$…)",
    test: (v) => /[^A-Za-z0-9]/.test(v),
  },
];

export interface PasswordAssessment {
  passed: string[];
  failed: string[];
  score: number;
  valid: boolean;
  label: "Too short" | "Weak" | "Fair" | "Good" | "Strong";
}

export function assessPassword(value: string): PasswordAssessment {
  const passed: string[] = [];
  const failed: string[] = [];

  for (const rule of PASSWORD_RULES) {
    (rule.test(value) ? passed : failed).push(rule.id);
  }

  const score = passed.length;
  const label =
    value.length === 0
      ? "Too short"
      : score <= 2
        ? "Weak"
        : score === 3
          ? "Fair"
          : score === 4
            ? "Good"
            : "Strong";

  return { passed, failed, score, valid: failed.length === 0, label };
}
