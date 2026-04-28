// Mirrors validatePassword in server/controllers/authController.js

export const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", test: (p) => p.length >= 8 },
  { id: "uppercase", label: "One uppercase letter (A–Z)", test: (p) => /[A-Z]/.test(p) },
  { id: "number", label: "One number (0–9)", test: (p) => /\d/.test(p) },
  {
    id: "special",
    label: "One special character (!@#$…)",
    test: (p) => /[!@#$%^&*()_\-+=\[\]{};:'",.<>\/?\\|`~]/.test(p),
  },
];

export const evaluatePassword = (password) => {
  const value = password || "";
  return PASSWORD_RULES.map((rule) => ({ ...rule, passed: rule.test(value) }));
};

export const passwordIsValid = (password) =>
  evaluatePassword(password).every((rule) => rule.passed);
