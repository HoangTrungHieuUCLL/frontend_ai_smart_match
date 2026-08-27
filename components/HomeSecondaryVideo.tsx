import { Box } from "@mantine/core";
import styles from "../styles/homeSecondaryVideo.module.css";

export const HomeSecondaryVideo = () => {
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
    </Box>
  );
};

export default HomeSecondaryVideo;
