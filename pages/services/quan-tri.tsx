import { ServiceDetail } from "../../components/ServiceDetail";
import { useTranslation } from "../../contexts/I18nContext";

export default function QuanTriDetail() {
  const { t } = useTranslation();

  return (
    <ServiceDetail
      title={t("services.card1Title")}
      buttonLabel={t("servicesQuanTri.bookButton")}
      items={[
        { title: t("servicesQuanTri.item1Title"), description: t("servicesQuanTri.item1Desc") },
        { title: t("servicesQuanTri.item2Title"), description: t("servicesQuanTri.item2Desc") },
        { title: t("servicesQuanTri.item3Title"), description: t("servicesQuanTri.item3Desc") },
        { title: t("servicesQuanTri.item4Title"), description: t("servicesQuanTri.item4Desc") },
      ]}
    />
  );
}
