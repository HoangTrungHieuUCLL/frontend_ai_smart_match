import { useTranslation } from "../../contexts/I18nContext";
import ServiceDetailLayout from "../../components/ServiceDetailLayout";

export default function BusinessLegalConsultingPage() {
  const { t } = useTranslation();

  return (
    <ServiceDetailLayout
      title={t("services.legal.title")}
      items={[
        { title: t("services.legal.item1.title"), body: t("services.legal.item1.body") },
        { title: t("services.legal.item2.title"), body: t("services.legal.item2.body") },
        { title: t("services.legal.item3.title"), body: t("services.legal.item3.body") },
        { title: t("services.legal.item4.title"), body: t("services.legal.item4.body") },
      ]}
    />
  );
}
