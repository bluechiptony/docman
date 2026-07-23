export const PASSWORD_POLICY_PATTERN =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}$/;

export const PASSWORD_POLICY_MESSAGE =
  "Password must contain at least 8 characters, one uppercase letter, one number, and one special character";

export const PASSWORD_REQUIREMENTS = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (password: string) => password.length >= 8,
  },
  {
    id: "uppercase",
    label: "At least 1 uppercase letter",
    test: (password: string) => /[A-Z]/.test(password),
  },
  {
    id: "number",
    label: "At least 1 number",
    test: (password: string) => /\d/.test(password),
  },
  {
    id: "special",
    label: "At least 1 special character",
    test: (password: string) => /[^A-Za-z0-9\s]/.test(password),
  },
] as const;

export function isStrongPassword(password: string): boolean {
  return PASSWORD_POLICY_PATTERN.test(password);
}

export function passwordStrength(password: string) {
  const results = PASSWORD_REQUIREMENTS.map((requirement) => ({
    ...requirement,
    met: requirement.test(password),
  }));
  const score = results.filter((requirement) => requirement.met).length;
  return { score, results };
}
