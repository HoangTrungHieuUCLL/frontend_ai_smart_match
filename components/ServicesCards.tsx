import { Box, Button, Text } from "@mantine/core";
import { useRouter } from "next/router";
import { useTranslation } from "../contexts/I18nContext";
import styles from "../styles/servicesCards.module.css";

export const ServicesCards = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const cards = [
    { title: t("services.card1Title"), desc: t("services.card1Desc"), href: "/services/quan-tri" },
    { title: t("services.card2Title"), desc: t("services.card2Desc"), href: null },
    { title: t("services.card3Title"), desc: t("services.card3Desc"), href: null },
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
                onClick={card.href ? () => router.push(card.href!) : undefined}
              >
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
