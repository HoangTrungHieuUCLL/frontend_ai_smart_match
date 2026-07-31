import { useTranslation } from "../../contexts/I18nContext";
import ServiceDetailLayout from "../../components/ServiceDetailLayout";

export default function FinanceAccountingPage() {
  const { t } = useTranslation();

  return (
    <ServiceDetailLayout
      title={t("services.finance.title")}
      items={[
        { title: t("services.finance.item1.title"), body: t("services.finance.item1.body") },
        { title: t("services.finance.item2.title"), body: t("services.finance.item2.body") },
        { title: t("services.finance.item3.title"), body: t("services.finance.item3.body") },
      ]}
    />
  );
}
