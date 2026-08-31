import { Box, Button, Text } from "@mantine/core";
import styles from "../styles/serviceDetail.module.css";

export type ServiceDetailItem = {
  title: string;
  description: string;
};

type ServiceDetailProps = {
  title: string;
  buttonLabel: string;
  items: ServiceDetailItem[];
};

export const ServiceDetail = ({ title, buttonLabel, items }: ServiceDetailProps) => {
  return (
    <Box className={styles.page}>
      <Text component="h1" className={styles.title}>
        {title}
      </Text>
      <Box className={styles.list}>
        {items.map((item, index) => (
          <Box className={styles.item} key={item.title}>
            <Box className={styles.itemHeader}>
              <Text component="h2" className={styles.itemTitle}>
                {index + 1}. {item.title}
              </Text>
              <Button radius="xl" size="sm" className={styles.button}>
                {buttonLabel}
              </Button>
            </Box>
            <Text className={styles.itemDesc}>. {item.description}</Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ServiceDetail;
