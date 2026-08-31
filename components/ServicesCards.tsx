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
      <Box className={styles.grid}>
        {cards.map((card) => (
          <Box className={styles.card} key={card.title}>
            <Text component="h3" className={styles.title}>
              {card.title}
            </Text>
            <Text className={styles.desc}>{card.desc}</Text>
            <Button variant="outline" radius="xl" size="sm" className={styles.button}>
              {t("services.learnMore")}
            </Button>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ServicesCards;
