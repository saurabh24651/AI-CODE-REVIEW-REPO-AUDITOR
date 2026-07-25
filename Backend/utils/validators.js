export const validatePassword = (password) => {
  const errors = [];

  if (!password || password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  const uppercaseCount = (password.match(/[A-Z]/g) || []).length;
  if (uppercaseCount < 1) {
    errors.push("Password must contain at least 1 uppercase letter");
  }

  const lowercaseCount = (password.match(/[a-z]/g) || []).length;
  if (lowercaseCount < 2) {
    errors.push("Password must contain at least 2 lowercase letters");
  }

  const symbolRegex = /[%@#$&*!]/;
  if (!symbolRegex.test(password)) {
    errors.push("Password must contain at least 1 symbol from %@#$&*!");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};