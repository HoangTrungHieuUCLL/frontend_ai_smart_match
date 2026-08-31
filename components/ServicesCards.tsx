import { Box, Button, Text } from "@mantine/core";
import { useTranslation } from "../contexts/I18nContext";
import styles from "../styles/servicesCards.module.css";

export const ServicesCards = () => {
  const { t } = useTranslation();

  const cards = [
    { title: t("services.card1Title"), desc: t("services.card1Desc") },
    { title: t("services.card2Title"), desc: t("services.card2Desc") },
    { title: t("services.card3Title"), desc: t("services.card3Desc") },
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
              <Button radius="md" size="md" className={styles.button}>
                {t("services.learnMore")}
              </Button>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ServicesCards;
