/**
 * Client-side form validation helpers (used alongside HTML5 native constraints).
 */

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/;

export function validateEmail(email) {
  const value = String(email || '').trim();
  if (!value) return 'Email address is required.';
  if (!EMAIL_REGEX.test(value)) return 'Enter an email address in the format you@example.com.';
  return '';
}

export function validatePassword(password, { strict = false } = {}) {
  const value = String(password || '');
  if (!value) return 'Password is required.';
  if (value.length < 8) return 'Password must be at least 8 characters long.';
  if (strict && !PASSWORD_REGEX.test(value)) {
    return 'Password must include uppercase, lowercase, a number, and a special character.';
  }
  return '';
}

export function validateRequired(value, label = 'This field') {
  if (!String(value ?? '').trim()) return `${label} is required.`;
  return '';
}

export function validatePositiveNumber(value, label = 'Value', { min = 0 } = {}) {
  const num = Number(value);
  if (Number.isNaN(num) || num < min) {
    return `${label} must be ${min === 0 ? '0 or greater' : `at least ${min}`}.`;
  }
  return '';
}

export function validateAddressForm(fields) {
  const errors = {};
  if (!String(fields.recipient_name || '').trim()) {
    errors.recipient_name = 'Full name is required.';
  }
  if (!String(fields.street_address || '').trim()) {
    errors.street_address = 'Street address is required.';
  }
  if (!String(fields.city || '').trim()) {
    errors.city = 'City is required.';
  }
  if (!String(fields.country || '').trim()) {
    errors.country = 'Country is required.';
  }
  if (fields.phone && String(fields.phone).trim().length < 7) {
    errors.phone = 'Enter a valid phone number.';
  }
  return errors;
}

export function validateProductForm(fields) {
  const errors = {};
  if (!String(fields.name || '').trim()) errors.name = 'Product name is required.';
  if (!String(fields.category_id || '').trim()) errors.category_id = 'Select a category.';
  const priceErr = validatePositiveNumber(fields.price, 'Price', { min: 0.01 });
  if (priceErr) errors.price = priceErr;
  const stockErr = validatePositiveNumber(fields.stock_quantity, 'Stock quantity', { min: 0 });
  if (stockErr) errors.stock_quantity = stockErr;
  const disc = Number(fields.discount_percent || 0);
  if (Number.isNaN(disc) || disc < 0 || disc > 95) {
    errors.discount_percent = 'Discount must be between 0% and 95%.';
  }
  if (!String(fields.description || '').trim()) {
    errors.description = 'Description is required.';
  }
  return errors;
}
