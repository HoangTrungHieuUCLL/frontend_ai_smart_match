export type CvFormData = {
  familyName: string;
  middleName: string;
  givenName: string;
  email: string;
};

export type CvFormErrors = Partial<Record<keyof CvFormData, string>>;

export type CvValidationMessages = {
  familyNameLabel: string;
  givenNameLabel: string;
  middleNameLabel: string;
  required: (label: string) => string;
  nameLetters: (label: string) => string;
  emailRequired: string;
  emailInvalid: string;
};

const NAME_REGEX = /^\p{L}+(?: \p{L}+)*$/u;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const defaultMessages: CvValidationMessages = {
  familyNameLabel: "Family name",
  givenNameLabel: "Given name",
  middleNameLabel: "Middle name",
  required: (label) => `${label} is required`,
  nameLetters: (label) => `${label} can only contain letters and spaces`,
  emailRequired: "Email address is required",
  emailInvalid: "Enter a valid email address",
};

const validateRequiredName = (value: string, label: string, messages: CvValidationMessages) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return messages.required(label);
  }

  if (!NAME_REGEX.test(trimmed)) {
    return messages.nameLetters(label);
  }

  return undefined;
};

export const getCvFormErrors = (
  formData: CvFormData,
  messages: CvValidationMessages = defaultMessages
): CvFormErrors => {
  const errors: CvFormErrors = {
    familyName: validateRequiredName(formData.familyName, messages.familyNameLabel, messages),
    givenName: validateRequiredName(formData.givenName, messages.givenNameLabel, messages),
  };

  const middleName = formData.middleName.trim();
  if (middleName && !NAME_REGEX.test(middleName)) {
    errors.middleName = messages.nameLetters(messages.middleNameLabel);
  }

  if (!formData.email.trim()) {
    errors.email = messages.emailRequired;
  } else if (!EMAIL_REGEX.test(formData.email.trim())) {
    errors.email = messages.emailInvalid;
  }

  return errors;
};

export const isCvFormValid = (formData: CvFormData, messages?: CvValidationMessages) =>
  Object.values(getCvFormErrors(formData, messages)).every((error) => !error);
