import { useTranslation } from "../../contexts/I18nContext";
import ServiceDetailLayout from "../../components/ServiceDetailLayout";

export default function HrConsultingPage() {
  const { t } = useTranslation();

  return (
    <ServiceDetailLayout
      title={t("services.hr.title")}
      items={[
        { title: t("services.hr.item1.title"), body: t("services.hr.item1.body") },
        { title: t("services.hr.item2.title"), body: t("services.hr.item2.body") },
        { title: t("services.hr.item3.title"), body: t("services.hr.item3.body") },
      ]}
    />
  );
}
