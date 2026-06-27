export type ValidationResult =
  | { valid: true }
  | { valid: false; message: string };

export interface AddressFields {
  province?: string;
  ward?: string;
  street?: string;
}

const FULL_NAME_REGEX = /^[\p{L}\s'.-]+$/u;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^0[35789]\d{8}$/;

export function sanitizePhoneInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, 10);
}

export function validateFullName(
  value: string,
  options?: { required?: boolean },
): ValidationResult {
  const trimmed = value.trim();
  const required = options?.required ?? true;

  if (!trimmed) {
    return required
      ? { valid: false, message: "Vui lòng nhập họ và tên" }
      : { valid: true };
  }

  if (trimmed.length < 2) {
    return { valid: false, message: "Họ và tên phải có ít nhất 2 ký tự" };
  }

  if (trimmed.length > 50) {
    return { valid: false, message: "Họ và tên không được quá 50 ký tự" };
  }

  if (!FULL_NAME_REGEX.test(trimmed)) {
    return {
      valid: false,
      message: "Họ và tên chỉ được chứa chữ cái và khoảng trắng",
    };
  }

  return { valid: true };
}

export function validatePhone(
  value: string,
  options?: { required?: boolean },
): ValidationResult {
  const digits = sanitizePhoneInput(value);
  const required = options?.required ?? true;

  if (!digits) {
    return required
      ? { valid: false, message: "Vui lòng nhập số điện thoại" }
      : { valid: true };
  }

  if (digits.length !== 10) {
    return {
      valid: false,
      message: "Số điện thoại phải gồm đúng 10 chữ số",
    };
  }

  if (!PHONE_REGEX.test(digits)) {
    return {
      valid: false,
      message: "Số điện thoại không hợp lệ (bắt đầu bằng 03, 05, 07, 08 hoặc 09)",
    };
  }

  return { valid: true };
}

export function validateEmail(
  value: string,
  options?: { required?: boolean },
): ValidationResult {
  const trimmed = value.trim();
  const required = options?.required ?? false;

  if (!trimmed) {
    return required
      ? { valid: false, message: "Vui lòng nhập email" }
      : { valid: true };
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, message: "Email không hợp lệ" };
  }

  if (trimmed.length > 100) {
    return { valid: false, message: "Email không được quá 100 ký tự" };
  }

  return { valid: true };
}

export function validateStreet(
  value: string,
  options?: { required?: boolean },
): ValidationResult {
  const trimmed = value.trim();
  const required = options?.required ?? true;

  if (!trimmed) {
    return required
      ? { valid: false, message: "Vui lòng nhập số nhà, tên đường" }
      : { valid: true };
  }

  if (trimmed.length < 5) {
    return {
      valid: false,
      message: "Địa chỉ chi tiết phải có ít nhất 5 ký tự",
    };
  }

  if (trimmed.length > 200) {
    return {
      valid: false,
      message: "Địa chỉ chi tiết không được quá 200 ký tự",
    };
  }

  return { valid: true };
}

export function validateAddress(
  address: AddressFields,
): ValidationResult {
  if (!address.province?.trim()) {
    return { valid: false, message: "Vui lòng chọn Tỉnh / Thành phố" };
  }

  if (!address.ward?.trim()) {
    return { valid: false, message: "Vui lòng chọn Phường / Xã" };
  }

  return validateStreet(address.street ?? "", { required: true });
}

export function validateNote(value: string): ValidationResult {
  const trimmed = value.trim();

  if (trimmed.length > 500) {
    return {
      valid: false,
      message: "Ghi chú không được quá 500 ký tự",
    };
  }

  return { valid: true };
}

export function validateDateOfBirth(
  value: Date | undefined,
  options?: { required?: boolean },
): ValidationResult {
  const required = options?.required ?? false;

  if (!value) {
    return required
      ? { valid: false, message: "Vui lòng chọn ngày sinh" }
      : { valid: true };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (value >= today) {
    return { valid: false, message: "Ngày sinh phải nhỏ hơn ngày hiện tại" };
  }

  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 120);

  if (value < minDate) {
    return { valid: false, message: "Ngày sinh không hợp lệ" };
  }

  return { valid: true };
}

export function validatePersonalInfo(input: {
  fullName: string;
  phone: string;
  email?: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};

  const fullNameResult = validateFullName(input.fullName);
  if (!fullNameResult.valid) errors.fullName = fullNameResult.message;

  const phoneResult = validatePhone(input.phone);
  if (!phoneResult.valid) errors.phone = phoneResult.message;

  if (input.email !== undefined) {
    const emailResult = validateEmail(input.email);
    if (!emailResult.valid) errors.email = emailResult.message;
  }

  return errors;
}

export function validateAddressForm(input: {
  fullName: string;
  phone: string;
  address: AddressFields;
}): Record<string, string> {
  const errors = validatePersonalInfo({
    fullName: input.fullName,
    phone: input.phone,
  });

  const addressResult = validateAddress(input.address);
  if (!addressResult.valid) {
    if (addressResult.message.includes("Tỉnh")) {
      errors.province = addressResult.message;
    } else if (addressResult.message.includes("Phường")) {
      errors.ward = addressResult.message;
    } else {
      errors.street = addressResult.message;
    }
  }

  return errors;
}

export function getFirstError(errors: Record<string, string>): string | null {
  const firstKey = Object.keys(errors)[0];
  return firstKey ? errors[firstKey] : null;
}
