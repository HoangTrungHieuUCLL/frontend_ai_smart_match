import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { en } from "./translations/en";
import { vn } from "./translations/vn";

export type Language = "EN" | "VN";

export type TranslationKey =
  | "nav.homepage"
  | "nav.services"
  | "nav.servicesHr"
  | "nav.servicesManagement"
  | "nav.servicesFinance"
  | "nav.team"
  | "nav.clients"
  | "nav.consultation"
  | "nav.jobSearch"
  | "nav.library"
  | "nav.contactCta"
  | "services.heroLine1"
  | "services.heroLine2"
  | "services.sectionTitle"
  | "services.card1Title"
  | "services.card1Desc"
  | "services.card2Title"
  | "services.card2Desc"
  | "services.card3Title"
  | "services.card3Desc"
  | "services.learnMore"
  | "servicesQuanTri.item1Title"
  | "servicesQuanTri.item1Desc"
  | "servicesQuanTri.item2Title"
  | "servicesQuanTri.item2Desc"
  | "servicesQuanTri.item3Title"
  | "servicesQuanTri.item3Desc"
  | "servicesQuanTri.item4Title"
  | "servicesQuanTri.item4Desc"
  | "services.bookButton"
  | "servicesTaiChinh.item1Title"
  | "servicesTaiChinh.item1Desc"
  | "servicesTaiChinh.item2Title"
  | "servicesTaiChinh.item2Desc"
  | "servicesTaiChinh.item3Title"
  | "servicesTaiChinh.item3Desc"
  | "servicesNhanSu.item1Title"
  | "servicesNhanSu.item1Desc"
  | "servicesNhanSu.item2Title"
  | "servicesNhanSu.item2Desc"
  | "servicesNhanSu.item3Title"
  | "servicesNhanSu.item3Desc"
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
  | "home.step3"
  | "common.delete"
  | "common.cancel"
  | "common.close"
  | "common.previous"
  | "common.next"
  | "common.notSpecified"
  | "executiveView.unauthorized"
  | "executiveView.loadError"
  | "executiveView.jobLoadError"
  | "executiveView.unknownCandidate"
  | "executiveView.noSkillsExtracted"
  | "executiveView.jobDeletedSuccess"
  | "executiveView.jobDeleteFailed"
  | "executiveView.cvDeletedSuccess"
  | "executiveView.cvDeleteFailed"
  | "executiveView.noSkillsShort"
  | "executiveView.noRequirementsListed"
  | "executiveView.title"
  | "executiveView.subtitle"
  | "executiveView.adminBadge"
  | "executiveView.loadingDashboard"
  | "executiveView.totalJobs"
  | "executiveView.totalCvs"
  | "executiveView.topSkills"
  | "executiveView.jobManagement"
  | "executiveView.jobManagementDesc"
  | "executiveView.addJob"
  | "executiveView.adminLoginRequired"
  | "executiveView.colPosition"
  | "executiveView.colCompany"
  | "executiveView.colLocation"
  | "executiveView.colType"
  | "executiveView.colRequirements"
  | "executiveView.colSalary"
  | "executiveView.colActions"
  | "executiveView.loadingJobs"
  | "executiveView.noJobsFound"
  | "executiveView.editJobTooltip"
  | "executiveView.deleteJobTooltip"
  | "executiveView.cvExtractedData"
  | "executiveView.cvExtractedDataDesc"
  | "executiveView.searchPlaceholder"
  | "executiveView.colId"
  | "executiveView.colFilename"
  | "executiveView.colCandidateName"
  | "executiveView.colSkills"
  | "executiveView.loadingCandidates"
  | "executiveView.noCandidatesFound"
  | "executiveView.noCvsFound"
  | "executiveView.showingRange"
  | "executiveView.pageOf"
  | "executiveView.deleteCvTooltip"
  | "executiveView.cvSummaryTitle"
  | "executiveView.deleteJobTitle"
  | "executiveView.deleteCvTitle"
  | "executiveView.confirmDeleteJob"
  | "executiveView.confirmDeleteCv"
  | "addJob.editTitle"
  | "addJob.addTitle"
  | "addJob.position"
  | "addJob.companyName"
  | "addJob.location"
  | "addJob.jobType"
  | "addJob.salary"
  | "addJob.overview"
  | "addJob.responsibilities"
  | "addJob.requirements"
  | "addJob.benefits"
  | "addJob.notes"
  | "addJob.optional"
  | "addJob.saveChanges"
  | "addJob.createJob"
  | "addJob.companyNameRequired"
  | "addJob.positionRequired"
  | "addJob.jobUpdatedSuccess"
  | "addJob.jobCreatedSuccess"
  | "addJob.jobUpdateFailed"
  | "addJob.jobCreateFailed"
  | "login.emailPlaceholder"
  | "login.passwordPlaceholder"
  | "login.linkedinNotFound"
  | "login.linkedinMissingEmail"
  | "login.linkedinFailed"
  | "login.invalidCredentials"
  | "login.submit"
  | "login.or"
  | "login.continueWithLinkedin"
  | "login.noAccount"
  | "login.createOne"
  | "upload.importFromLinkedin"
  | "compare.noJobsSelected"
  | "linkedinImport.failed"
  | "linkedinImport.preparing"
  | "linkedinImport.backToUpload"
  | "linkedinImport.sourceBanner"
  | "linkedinLoginCallback.alertTitle"
  | "linkedinLoginCallback.signingIn"
  | "register.linkedinSignupFailed"
  | "register.passwordRequirementsNotMet"
  | "register.passwordsDoNotMatch"
  | "register.emailExists"
  | "register.genericError"
  | "register.emailLabel"
  | "register.emailPlaceholder"
  | "register.passwordLabel"
  | "register.passwordPlaceholder"
  | "register.passwordMustInclude"
  | "register.minLength"
  | "register.oneUppercase"
  | "register.oneNumber"
  | "register.confirmPasswordLabel"
  | "register.confirmPasswordPlaceholder"
  | "register.submit"
  | "register.createWithLinkedin"
  | "register.alreadyHaveAccount"
  | "register.linkLinkedinTitle"
  | "register.linkLinkedinBody"
  | "register.declineLink"
  | "register.confirmLink"
  | "common.edit"
  | "profile.notAvailable"
  | "profile.title"
  | "profile.photoAlt"
  | "profile.linkedinLinked"
  | "profile.subtitle"
  | "profile.familyName"
  | "profile.middleName"
  | "profile.givenName"
  | "profile.emailAddress"
  | "profile.bio"
  | "profile.myCv"
  | "profile.uploadCv"
  | "profile.clickToUpload"
  | "profile.noCvUploaded"
  | "profile.mySkills"
  | "profile.skillsHint"
  | "profile.skillsAutofillHint"
  | "profile.addSkillPlaceholder"
  | "profile.account"
  | "profile.linkedinLabel"
  | "profile.accountLinked"
  | "profile.notLinked"
  | "profile.registeredEmail"
  | "profile.accountCreationDate"
  | "profile.changePassword"
  | "profile.logOut"
  | "profile.currentPassword"
  | "profile.newPassword"
  | "profile.confirmNewPassword"
  | "profile.savePassword"
  | "profile.profileUpdated"
  | "profile.profileUpdateFailed"
  | "profile.passwordRequirementsError"
  | "profile.newPasswordsDoNotMatch"
  | "profile.passwordChanged"
  | "profile.currentPasswordIncorrect";

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
