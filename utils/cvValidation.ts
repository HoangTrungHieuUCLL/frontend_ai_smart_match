export type CvFormData = {
  familyName: string;
  middleName: string;
  givenName: string;
  email: string;
};

export type CvFormErrors = Partial<Record<keyof CvFormData, string>>;

const NAME_REGEX = /^\p{L}+(?: \p{L}+)*$/u;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateRequiredName = (value: string, label: string) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return `${label} is required`;
  }

  if (!NAME_REGEX.test(trimmed)) {
    return `${label} can only contain letters and spaces`;
  }

  return undefined;
};

export const getCvFormErrors = (formData: CvFormData): CvFormErrors => {
  const errors: CvFormErrors = {
    familyName: validateRequiredName(formData.familyName, "Family name"),
    givenName: validateRequiredName(formData.givenName, "Given name"),
  };

  const middleName = formData.middleName.trim();
  if (middleName && !NAME_REGEX.test(middleName)) {
    errors.middleName = "Middle name can only contain letters and spaces";
  }

  if (!formData.email.trim()) {
    errors.email = "Email address is required";
  } else if (!EMAIL_REGEX.test(formData.email.trim())) {
    errors.email = "Enter a valid email address";
  }

  return errors;
};

export const isCvFormValid = (formData: CvFormData) =>
  Object.values(getCvFormErrors(formData)).every((error) => !error);
