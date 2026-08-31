import { useState } from "react";
import { Box, Button, Modal, Text } from "@mantine/core";
import { useTranslation } from "../contexts/I18nContext";
import { ServiceDetail } from "./ServiceDetail";
import styles from "../styles/servicesCards.module.css";

export const ServicesCards = () => {
  const { t } = useTranslation();
  const [quanTriOpened, setQuanTriOpened] = useState(false);
  const [taiChinhOpened, setTaiChinhOpened] = useState(false);
  const [nhanSuOpened, setNhanSuOpened] = useState(false);

  const cards = [
    { title: t("services.card1Title"), desc: t("services.card1Desc"), onLearnMore: () => setQuanTriOpened(true) },
    { title: t("services.card2Title"), desc: t("services.card2Desc"), onLearnMore: () => setTaiChinhOpened(true) },
    { title: t("services.card3Title"), desc: t("services.card3Desc"), onLearnMore: () => setNhanSuOpened(true) },
  ];

  return (
    <Box className={styles.section}>
      <Text component="h2" className={styles.heading}>
        {t("services.sectionTitle")}
      </Text>
      <hr className={styles.headingDivider} />
      <Box className={styles.list}>
        {cards.map((card) => (
          <Box className={styles.row} key={card.title}>
            <Text component="h3" className={styles.title}>
              {card.title}
            </Text>
            <Box>
              <Text className={styles.desc}>{card.desc}</Text>
              <Button
                radius="md"
                size="md"
                className={styles.button}
                onClick={card.onLearnMore ?? undefined}
              >
                {t("services.learnMore")}
              </Button>
            </Box>
          </Box>
        ))}
      </Box>

      <Modal
        opened={quanTriOpened}
        onClose={() => setQuanTriOpened(false)}
        size="xl"
        radius="lg"
        padding={0}
        withCloseButton
      >
        <ServiceDetail
          title={t("services.card1Title")}
          buttonLabel={t("services.bookButton")}
          items={[
            { title: t("servicesQuanTri.item1Title"), description: t("servicesQuanTri.item1Desc") },
            { title: t("servicesQuanTri.item2Title"), description: t("servicesQuanTri.item2Desc") },
            { title: t("servicesQuanTri.item3Title"), description: t("servicesQuanTri.item3Desc") },
            { title: t("servicesQuanTri.item4Title"), description: t("servicesQuanTri.item4Desc") },
          ]}
        />
      </Modal>

      <Modal
        opened={taiChinhOpened}
        onClose={() => setTaiChinhOpened(false)}
        size="xl"
        radius="lg"
        padding={0}
        withCloseButton
      >
        <ServiceDetail
          title={t("services.card2Title")}
          buttonLabel={t("services.bookButton")}
          items={[
            { title: t("servicesTaiChinh.item1Title"), description: t("servicesTaiChinh.item1Desc") },
            { title: t("servicesTaiChinh.item2Title"), description: t("servicesTaiChinh.item2Desc") },
            { title: t("servicesTaiChinh.item3Title"), description: t("servicesTaiChinh.item3Desc") },
          ]}
        />
      </Modal>

      <Modal
        opened={nhanSuOpened}
        onClose={() => setNhanSuOpened(false)}
        size="xl"
        radius="lg"
        padding={0}
        withCloseButton
      >
        <ServiceDetail
          title={t("services.card3Title")}
          buttonLabel={t("services.bookButton")}
          items={[
            { title: t("servicesNhanSu.item1Title"), description: t("servicesNhanSu.item1Desc") },
            { title: t("servicesNhanSu.item2Title"), description: t("servicesNhanSu.item2Desc") },
            { title: t("servicesNhanSu.item3Title"), description: t("servicesNhanSu.item3Desc") },
          ]}
        />
      </Modal>
    </Box>
  );
};

export default ServicesCards;
