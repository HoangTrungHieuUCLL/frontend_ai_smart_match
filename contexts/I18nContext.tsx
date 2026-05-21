import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

export type Language = "EN" | "VN";

type TranslationKey =
  | "nav.homepage"
  | "nav.services"
  | "nav.team"
  | "nav.clients"
  | "nav.consultation"
  | "nav.jobSearch"
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
  | "jobInfo.notFound";

type TranslationValues = Record<string, string | number>;

const translations: Record<Language, Record<TranslationKey, string>> = {
  EN: {
    "nav.homepage": "Homepage",
    "nav.services": "Our services",
    "nav.team": "Our team",
    "nav.clients": "Our clients",
    "nav.consultation": "Consultation",
    "nav.jobSearch": "Job search with AI",
    "footer.contact": "Contact",
    "footer.director": "Director",
    "footer.address": "Address",
    "footer.follow": "Follow HRNEXT.vn on",
    "footer.copyright": "© 2025. All copyrights belong to HR Next.vn",
    "jobSearch.title": "Job Search with AI",
    "jobSearch.subtitle": "Browse job listings, save the ones you like, and open the details page for each role.",
    "jobSearch.pageStatus": "Page {{page}} of {{pageCount}}. Showing up to {{jobsPerPage}} jobs per page.",
    "jobListing.learnMore": "Learn more",
    "jobListing.save": "Save",
    "jobListing.share": "Share",
    "jobListing.savedAlert": "Saved {{title}}",
    "jobListing.shareAlert": "Share {{title}}",
    "upload.cvButton": "Upload your CV",
    "upload.modalCvTitle": "Upload your CV",
    "upload.modalPdfTitle": "Upload your PDF",
    "upload.familyName": "Family name",
    "upload.middleName": "Middle name",
    "upload.givenName": "Given name",
    "upload.email": "Email address",
    "upload.familyNamePlaceholder": "Enter your family name",
    "upload.middleNamePlaceholder": "Enter your middle name",
    "upload.givenNamePlaceholder": "Enter your given name",
    "upload.emailPlaceholder": "Enter your email",
    "upload.continue": "Continue",
    "upload.dropPdf": "Drop your PDF here",
    "upload.browsePdf": "or click to browse (max 5MB)",
    "upload.fileSelected": "File selected: {{fileName}}",
    "upload.submit": "Upload CV",
    "upload.onlyPdf": "Only PDF files are allowed",
    "upload.maxSize": "File size must not exceed 5MB",
    "upload.selectFile": "Please select a file",
    "upload.success": "CV uploaded successfully!",
    "upload.failed": "Failed to upload CV",
    "upload.error": "Error uploading CV",
    "upload.singlePdf": "Please upload only one PDF file.",
    "upload.replacePdf": "Remove the selected PDF before choosing another one.",
    "upload.removeSelectedPdf": "Remove selected PDF",
    "validation.required": "{{label}} is required",
    "validation.nameLetters": "{{label}} can only contain letters and spaces",
    "validation.emailRequired": "Email address is required",
    "validation.emailInvalid": "Enter a valid email address",
    "jobInfo.cardJobDescription": "Job description",
    "jobInfo.cardCvUploaded": "Your CV uploaded.",
    "jobInfo.cardCvDescription": "The system has your profile and can compare it with job requirements automatically.",
    "jobInfo.cardMatchScore": "Match score",
    "jobInfo.cardMatchDescription": "This job is highly compatible with your profile based on skills and experience.",
    "jobInfo.suitMe": "How much does this job suit me?",
    "jobInfo.askAi": "Let's ask AI",
    "jobInfo.compatible": "How compatible am I to this job?",
    "jobInfo.save": "Save",
    "jobInfo.share": "Share",
    "jobInfo.match": "match",
    "jobInfo.loading": "Loading job details...",
    "jobInfo.notFound": "Job not found.",
  },
  VN: {
    "nav.homepage": "Trang chủ",
    "nav.services": "Dịch vụ",
    "nav.team": "Đội ngũ",
    "nav.clients": "Khách hàng",
    "nav.consultation": "Tư vấn",
    "nav.jobSearch": "Tìm việc với AI",
    "footer.contact": "Liên hệ",
    "footer.director": "Giám đốc",
    "footer.address": "Địa chỉ",
    "footer.follow": "Theo dõi HRNEXT.vn tại",
    "footer.copyright": "© 2025. Mọi bản quyền thuộc về HR Next.vn",
    "jobSearch.title": "Tìm việc với AI",
    "jobSearch.subtitle": "Xem danh sách việc làm, lưu vị trí bạn thích và mở trang chi tiết cho từng vai trò.",
    "jobSearch.pageStatus": "Trang {{page}} / {{pageCount}}. Hiển thị tối đa {{jobsPerPage}} việc làm mỗi trang.",
    "jobListing.learnMore": "Xem thêm",
    "jobListing.save": "Lưu",
    "jobListing.share": "Chia sẻ",
    "jobListing.savedAlert": "Đã lưu {{title}}",
    "jobListing.shareAlert": "Chia sẻ {{title}}",
    "upload.cvButton": "Tải CV lên",
    "upload.modalCvTitle": "Tải CV lên",
    "upload.modalPdfTitle": "Tải PDF lên",
    "upload.familyName": "Họ",
    "upload.middleName": "Tên đệm",
    "upload.givenName": "Tên",
    "upload.email": "Địa chỉ email",
    "upload.familyNamePlaceholder": "Nhập họ của bạn",
    "upload.middleNamePlaceholder": "Nhập tên đệm của bạn",
    "upload.givenNamePlaceholder": "Nhập tên của bạn",
    "upload.emailPlaceholder": "Nhập email của bạn",
    "upload.continue": "Tiếp tục",
    "upload.dropPdf": "Thả file PDF tại đây",
    "upload.browsePdf": "hoặc bấm để chọn file (tối đa 5MB)",
    "upload.fileSelected": "File đã chọn: {{fileName}}",
    "upload.submit": "Tải CV lên",
    "upload.onlyPdf": "Chỉ cho phép file PDF",
    "upload.maxSize": "Dung lượng file không được vượt quá 5MB",
    "upload.selectFile": "Vui lòng chọn file",
    "upload.success": "Tải CV lên thành công!",
    "upload.failed": "Tải CV lên thất bại",
    "upload.error": "Lỗi khi tải CV lên",
    "upload.singlePdf": "Vui lòng chỉ tải lên một file PDF.",
    "upload.replacePdf": "Hãy xoá file PDF đã chọn trước khi chọn file khác.",
    "upload.removeSelectedPdf": "Xoá PDF đã chọn",
    "validation.required": "{{label}} là bắt buộc",
    "validation.nameLetters": "{{label}} chỉ được chứa chữ cái và khoảng trắng",
    "validation.emailRequired": "Địa chỉ email là bắt buộc",
    "validation.emailInvalid": "Nhập địa chỉ email hợp lệ",
    "jobInfo.cardJobDescription": "Mô tả công việc",
    "jobInfo.cardCvUploaded": "CV của bạn đã được tải lên.",
    "jobInfo.cardCvDescription": "Hệ thống có hồ sơ của bạn và có thể tự động so sánh với yêu cầu công việc.",
    "jobInfo.cardMatchScore": "Điểm phù hợp",
    "jobInfo.cardMatchDescription": "Công việc này rất phù hợp với hồ sơ của bạn dựa trên kỹ năng và kinh nghiệm.",
    "jobInfo.suitMe": "Công việc này phù hợp với tôi đến mức nào?",
    "jobInfo.askAi": "Hỏi AI",
    "jobInfo.compatible": "Tôi phù hợp với công việc này đến mức nào?",
    "jobInfo.save": "Lưu",
    "jobInfo.share": "Chia sẻ",
    "jobInfo.match": "phù hợp",
    "jobInfo.loading": "Đang tải chi tiết công việc...",
    "jobInfo.notFound": "Không tìm thấy công việc.",
  },
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
    const storedLanguage = window.localStorage.getItem("language");
    if (isLanguage(storedLanguage)) {
      setLanguageState(storedLanguage);
    }
  }, []);

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem("language", nextLanguage);
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
