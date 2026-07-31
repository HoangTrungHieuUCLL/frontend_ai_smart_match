import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { en } from "./translations/en";
import { vn } from "./translations/vn";

export type Language = "EN" | "VN";

export type TranslationKey =
  | "nav.homepage"
  | "nav.services"
  | "nav.servicesHr"
  | "nav.servicesLegal"
  | "nav.servicesFinance"
  | "nav.team"
  | "nav.library"
  | "nav.consultation"
  | "nav.jobSearch"
  | "nav.login"
  | "footer.contact"
  | "footer.director"
  | "footer.address"
  | "footer.follow"
  | "footer.copyright"
  | "home.hero.title"
  | "home.hero.subtitle"
  | "home.hero.cta"
  | "home.services.heading"
  | "home.library.heading"
  | "home.library.viewAll"
  | "services.hr.title"
  | "services.hr.summary"
  | "services.legal.title"
  | "services.legal.summary"
  | "services.finance.title"
  | "services.finance.summary"
  | "services.learnMore"
  | "services.scheduleConsultation"
  | "services.index.heading"
  | "services.index.subtitle"
  | "services.hr.item1.title"
  | "services.hr.item1.body"
  | "services.hr.item2.title"
  | "services.hr.item2.body"
  | "services.hr.item3.title"
  | "services.hr.item3.body"
  | "services.legal.item1.title"
  | "services.legal.item1.body"
  | "services.legal.item2.title"
  | "services.legal.item2.body"
  | "services.legal.item3.title"
  | "services.legal.item3.body"
  | "services.legal.item4.title"
  | "services.legal.item4.body"
  | "services.finance.item1.title"
  | "services.finance.item1.body"
  | "services.finance.item2.title"
  | "services.finance.item2.body"
  | "services.finance.item3.title"
  | "services.finance.item3.body"
  | "team.heading"
  | "team.subtitle"
  | "team.viewProfile"
  | "library.heading"
  | "library.subtitle"
  | "library.readNow"
  | "library.backToLibrary"
  | "library.categoryInspiration"
  | "library.categoryEmployer"
  | "library.categoryExpert"
  | "contact.heading"
  | "contact.subtitle"
  | "contact.candidate.heading"
  | "contact.candidate.fullName"
  | "contact.candidate.email"
  | "contact.candidate.phone"
  | "contact.candidate.currentProfession"
  | "contact.candidate.desiredProfession"
  | "contact.candidate.desiredLevel"
  | "contact.candidate.cvUpload"
  | "contact.candidate.submit"
  | "contact.business.heading"
  | "contact.business.companyName"
  | "contact.business.industry"
  | "contact.business.companySize"
  | "contact.business.serviceInterest"
  | "contact.business.needsDescription"
  | "contact.business.submit"
  | "contact.consentNotice"
  | "contact.submitSuccess"
  | "cta.cvUpload.title"
  | "cta.cvUpload.body"
  | "cta.cvUpload.button"
  | "cta.consultation.title"
  | "cta.consultation.body"
  | "cta.consultation.button"
  | "cookie.message"
  | "cookie.accept"
  | "cookie.decline"
  | "jobSearch.title"
  | "jobSearch.subtitle"
  | "jobSearch.pageStatus"
  | "jobListing.learnMore"
  | "jobListing.save"
  | "jobListing.saved"
  | "jobListing.share"
  | "jobListing.savedAlert"
  | "jobListing.shareAlert"
  | "upload.cvButton"
  | "upload.modalCvTitle"
  | "upload.modalPdfTitle"
  | "upload.familyName"
  | "upload.middleName"
  | "upload.givenName"
  | "upload.email"
  | "upload.familyNamePlaceholder"
  | "upload.middleNamePlaceholder"
  | "upload.givenNamePlaceholder"
  | "upload.emailPlaceholder"
  | "upload.continue"
  | "upload.dropPdf"
  | "upload.browsePdf"
  | "upload.fileSelected"
  | "upload.submit"
  | "upload.onlyPdf"
  | "upload.maxSize"
  | "upload.selectFile"
  | "upload.success"
  | "upload.failed"
  | "upload.error"
  | "upload.singlePdf"
  | "upload.replacePdf"
  | "upload.removeSelectedPdf"
  | "validation.required"
  | "validation.nameLetters"
  | "validation.emailRequired"
  | "validation.emailInvalid"
  | "jobInfo.cardJobDescription"
  | "jobInfo.cardCvUploaded"
  | "jobInfo.cardCvDescription"
  | "jobInfo.cardMatchScore"
  | "jobInfo.cardMatchDescription"
  | "jobInfo.suitMe"
  | "jobInfo.askAi"
  | "jobInfo.compatible"
  | "jobInfo.save"
  | "jobInfo.share"
  | "jobInfo.match"
  | "jobInfo.loading"
  | "jobInfo.notFound"
  | "jobInfo.cardCvReuploadDescription";

export type TranslationDictionary = Record<TranslationKey, string>;
export type PartialTranslationDictionary = Partial<Record<TranslationKey, string>>;

type TranslationValues = Record<string, string | number>;

const translations: { EN: TranslationDictionary; VN: PartialTranslationDictionary } = {
  EN: en,
  VN: vn,
};

type I18nContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, values?: TranslationValues) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

const isLanguage = (value: string | null): value is Language => value === "EN" || value === "VN";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("EN");

  useEffect(() => {
    const storedLanguage = window.sessionStorage.getItem("language");
    if (isLanguage(storedLanguage)) {
      setLanguageState(storedLanguage);
    }
  }, []);

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    window.sessionStorage.setItem("language", nextLanguage);
    document.documentElement.lang = nextLanguage === "VN" ? "vi" : "en";
  };

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key, values) => {
        let text = translations[language][key] ?? translations.EN[key] ?? key;

        if (values) {
          Object.entries(values).forEach(([name, replacement]) => {
            text = text.replaceAll(`{{${name}}}`, String(replacement));
          });
        }

        return text;
      },
    }),
    [language]
  );

  useEffect(() => {
    document.documentElement.lang = language === "VN" ? "vi" : "en";
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useTranslation = () => {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useTranslation must be used inside I18nProvider");
  }

  return context;
};
