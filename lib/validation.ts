export type FieldErrors = {
  fullName?: string;
  email?: string;
  password?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function validateCredentials(input: {
  email: string;
  password: string;
  fullName?: string;
}) {
  const fieldErrors: FieldErrors = {};
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (input.fullName !== undefined) {
    const fullName = input.fullName.trim();
    if (fullName.length < 2 || fullName.length > 80) {
      fieldErrors.fullName = "Enter your full name (2 to 80 characters).";
    }
  }

  if (!emailPattern.test(email)) {
    fieldErrors.email = "Enter a valid email address.";
  }

  if (password.length < 8) {
    fieldErrors.password = "Password must be at least 8 characters.";
  } else if (password.length > 72) {
    fieldErrors.password = "Password must be at most 72 characters.";
  }

  return {
    fieldErrors,
    email,
    password,
    fullName: input.fullName?.trim(),
  };
}
