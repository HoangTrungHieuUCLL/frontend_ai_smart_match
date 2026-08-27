import { Box, Text } from "@mantine/core";
import { IconFileUpload, IconFilter, IconBriefcase } from "@tabler/icons-react";
import { useTranslation } from "../contexts/I18nContext";
import styles from "../styles/homeSteps.module.css";

export const HomeSteps = () => {
  const { t } = useTranslation();

  return (
    <Box className={styles.section}>
      <video
        className={styles.video}
        src="/homepage_background_2.mov"
        autoPlay
        loop
        muted
        playsInline
      />
      <Box className={styles.overlay} />

      <Box className={styles.content}>
        <Text component="h2" className={styles.title}>
          {t("home.stepsTitle1")}
          <br />
          {t("home.stepsTitle2Prefix")}
          <span className={styles.gradientText}>{t("home.stepsTitle2Highlight")}</span>
        </Text>

        <Box className={styles.card}>
          <Box className={styles.step}>
            <IconFileUpload size={40} stroke={1.5} className={styles.stepIcon} />
            <Text className={styles.stepText}>{t("home.step1")}</Text>
          </Box>
          <Box className={styles.step}>
            <IconFilter size={40} stroke={1.5} className={styles.stepIcon} />
            <Text className={styles.stepText}>{t("home.step2")}</Text>
          </Box>
          <Box className={styles.step}>
            <IconBriefcase size={40} stroke={1.5} className={styles.stepIcon} />
            <Text className={styles.stepText}>{t("home.step3")}</Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default HomeSteps;
