export type IdentifierPayload = {
  email?: string;
  telephone?: string;
  cin?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+0-9][0-9\s().-]{7,14}$/;
const CIN_REGEX = /^\d{12}$/;

/**
 * Un CIN fait 12 chiffres, ce qui peut aussi correspondre au format téléphone.
 * On le détecte donc avant le téléphone, en excluant les préfixes mobiles
 * malgaches (0… et 261…).
 */
export function buildIdentifierPayload(value: string): IdentifierPayload {
  const trimmed = value.trim();

  if (!trimmed) {
    return {};
  }

  if (EMAIL_REGEX.test(trimmed)) {
    return { email: trimmed };
  }

  const digits = trimmed.replace(/\D/g, "");
  const looksLikeCin =
    CIN_REGEX.test(trimmed) &&
    !digits.startsWith("0") &&
    !digits.startsWith("261");

  if (looksLikeCin) {
    return { cin: trimmed };
  }

  if (PHONE_REGEX.test(trimmed)) {
    return { telephone: trimmed };
  }

  return {};
}

export function isIdentifierValid(value: string): boolean {
  return Object.keys(buildIdentifierPayload(value)).length > 0;
}
