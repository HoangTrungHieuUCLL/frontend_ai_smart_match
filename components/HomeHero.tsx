import { Avatar, Box, Button, Stack, Text } from "@mantine/core";
import { useRouter } from "next/router";
import { IconRobot, IconUser } from "@tabler/icons-react";
import { useTranslation } from "../contexts/I18nContext";
import styles from "../styles/homeHero.module.css";

export const HomeHero = () => {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <>
    <Box className={styles.hero}>
      <video
        className={styles.video}
        src="/homepage_background_1.mov"
        autoPlay
        loop
        muted
        playsInline
      />
      <Box className={styles.overlay} />

      <Box className={styles.content}>
        <Stack gap={0} className={styles.textColumn}>
          <Text component="h1" className={styles.heroTitle}>
            {t("home.heroLine1")}
            <br />
            {t("home.heroLine2")}
            <br />
            {t("home.heroLine3")}
          </Text>
          <Button
            variant="outline"
            radius="xl"
            size="md"
            className={styles.ctaButton}
            onClick={() => router.push("/job-search-with-ai")}
          >
            {t("home.heroCta")}
          </Button>
        </Stack>

        <Box className={styles.chatCard}>
          <Box className={`${styles.chatRow} ${styles.chatRowEnd}`}>
            <Box className={styles.userBubble}>
              <Text size="sm" c="gray.1">
                {t("home.chatQuestion")}
              </Text>
            </Box>
            <Avatar radius="xl" size={44} color="gray">
              <IconUser size={22} />
            </Avatar>
          </Box>

          <Box className={styles.chatRow}>
            <Avatar radius="xl" size={44} color="orange" variant="light">
              <IconRobot size={24} />
            </Avatar>
            <Box className={styles.botBubble}>
              <Text size="sm" c="gray.1" style={{ whiteSpace: "pre-line" }}>
                {t("home.chatGreeting")}
              </Text>
              <Box component="ul" className={styles.bulletList}>
                <li>{t("home.chatStrength1")}</li>
                <li>{t("home.chatStrength2")}</li>
              </Box>
              <Text size="sm" c="gray.1" mt="sm">
                {t("home.chatGapIntro")}
              </Text>
              <Box component="ul" className={styles.bulletList}>
                <li>{t("home.chatGap1")}</li>
                <li>{t("home.chatGap2")}</li>
              </Box>
            </Box>
          </Box>
        </Box>
        <Box className={styles.introSection}>
          <video
            className={styles.introVideo}
            src="/homepage_intro_video.mp4"
            autoPlay
            loop
            muted
            playsInline
          />
        </Box>
      </Box>
    </Box>
    </>
  );
};

export default HomeHero;
