export interface ValidationErrors {
  fullName?: string;
  email?: string;
  gender?: string;
  phoneNumber?: string;
  password?: string;
  confirmPassword?: string;
}

export const validateSignup = (formData: {
  fullName: string;
  email: string;
  gender: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Full Name validation
  if (!formData.fullName.trim()) {
    errors.fullName = "Full name is required";
  } else if (formData.fullName.trim().length < 2) {
    errors.fullName = "Full name must be at least 2 characters";
  } else if (formData.fullName.trim().length > 50) {
    errors.fullName = "Full name must be less than 50 characters";
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email) {
    errors.email = "Email is required";
  } else if (!emailRegex.test(formData.email)) {
    errors.email = "Please enter a valid email address";
  }

  // Gender validation
  if (!formData.gender) {
    errors.gender = "Please select a gender";
  }

  // Phone Number validation
  const phoneRegex = /^[0-9]{10}$/;
  if (!formData.phoneNumber) {
    errors.phoneNumber = "Phone number is required";
  } else if (!phoneRegex.test(formData.phoneNumber)) {
    errors.phoneNumber = "Phone number must be exactly 10 digits";
  }

  // Password validation
  if (!formData.password) {
    errors.password = "Password is required";
  } else if (formData.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  } else if (formData.password.length > 20) {
    errors.password = "Password must be less than 20 characters";
  } else if (!/[A-Z]/.test(formData.password)) {
    errors.password = "Password must contain at least one uppercase letter";
  } else if (!/[a-z]/.test(formData.password)) {
    errors.password = "Password must contain at least one lowercase letter";
  } else if (!/[0-9]/.test(formData.password)) {
    errors.password = "Password must contain at least one number";
  }

  // Confirm Password validation
  if (!formData.confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
};