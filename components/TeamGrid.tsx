import { Box, Text } from "@mantine/core";
import styles from "../styles/team.module.css";

const TEAM_MEMBERS = [
  { name: "Windy Phạm", role: "Founder", photo: "/windy-pham.png" },
  { name: "An Bùi", role: "Co - Founder", photo: "/an-bui.png" },
  { name: "Hằng Bùi", role: "Co - Founder", photo: "/hang-bui.png" },
  { name: "Hương Đỗ", role: "Co - Founder", photo: "/huong-do.png" },
  { name: "Hiền Trần", role: "Co - Founder", photo: "/hien-tran.png" },
  { name: "Khánh Nguyễn", role: "Co - Founder", photo: "/khanh-nguyen.png" },
];

export const TeamGrid = () => {
  return (
    <Box className={styles.section}>
      <Box className={styles.grid}>
        {TEAM_MEMBERS.map((member) => (
          <Box className={styles.member} key={member.name}>
            <Box className={styles.photoCard}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={member.photo} alt={member.name} className={styles.photo} />
            </Box>
            <Text className={styles.name}>{member.name}</Text>
            <Text className={styles.role}>{member.role}</Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default TeamGrid;
