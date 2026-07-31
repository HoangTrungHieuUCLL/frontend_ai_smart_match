import { useEffect, useState } from "react";
import { Box, Button, Group, Text } from "@mantine/core";
import { useTranslation } from "../contexts/I18nContext";

const BROWN = "#774326";
const STORAGE_KEY = "cookieConsent";

export default function CookieConsent() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setVisible(true);
    }
  }, []);

  const respond = (choice: "accepted" | "declined") => {
    localStorage.setItem(STORAGE_KEY, choice);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <Box
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        backgroundColor: "#ffffff",
        borderTop: `1px solid ${BROWN}`,
        boxShadow: "0 -2px 12px rgba(0,0,0,0.08)",
        padding: "16px 24px",
      }}
    >
      <Group justify="space-between" wrap="wrap" gap="md" style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Text size="sm" style={{ flex: 1, minWidth: 220 }}>
          {t("cookie.message")}
        </Text>
        <Group gap="sm">
          <Button variant="outline" color="brown" radius="xl" style={{ color: BROWN, borderColor: BROWN }} onClick={() => respond("declined")}>
            {t("cookie.decline")}
          </Button>
          <Button radius="xl" style={{ backgroundColor: BROWN }} onClick={() => respond("accepted")}>
            {t("cookie.accept")}
          </Button>
        </Group>
      </Group>
    </Box>
  );
}
