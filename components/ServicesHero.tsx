import { Box, Text } from "@mantine/core";
import { useTranslation } from "../contexts/I18nContext";
import styles from "../styles/servicesHero.module.css";

export const ServicesHero = () => {
  const { t } = useTranslation();

  return (
    <Box className={styles.hero}>
      <Box className={styles.overlay} />
      <Box className={styles.content}>
        <Text component="h1" className={styles.title}>
          {t("services.heroLine1")}
          <br />
          {t("services.heroLine2")}
        </Text>
      </Box>
    </Box>
  );
};

export default ServicesHero;
