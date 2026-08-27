import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { en } from "./translations/en";
import { vn } from "./translations/vn";

export type Language = "EN" | "VN";

export type TranslationKey =
  | "nav.homepage"
  | "nav.services"
  | "nav.team"
  | "nav.clients"
  | "nav.consultation"
  | "nav.jobSearch"
  | "nav.login"
  | "footer.contact"
  | "footer.director"
  | "footer.address"
  | "footer.follow"
  | "footer.copyright"
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
  | "jobInfo.cardCvReuploadDescription"
  | "home.heroLine1"
  | "home.heroLine2"
  | "home.heroLine3"
  | "home.heroCta"
  | "home.chatQuestion"
  | "home.chatGreeting"
  | "home.chatStrength1"
  | "home.chatStrength2"
  | "home.chatGapIntro"
  | "home.chatGap1"
  | "home.chatGap2"
  | "home.stepsTitle1"
  | "home.stepsTitle2Prefix"
  | "home.stepsTitle2Highlight"
  | "home.step1"
  | "home.step2"
  | "home.step3";

export type TranslationDictionary = Record<TranslationKey, string>;

type TranslationValues = Record<string, string | number>;

const translations: Record<Language, TranslationDictionary> = {
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
  const [language, setLanguageState] = useState<Language>("VN");

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
