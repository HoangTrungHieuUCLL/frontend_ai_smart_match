import type { ButtonHTMLAttributes, CSSProperties } from "react";
import { Button, Group, Text } from "@mantine/core";
import { IconBrandLinkedin } from "@tabler/icons-react";
import { useTranslation } from "../contexts/I18nContext";

const LINKEDIN_BLUE = "#0A66C2";

type LinkedInImportButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "style"> & {
    label?: string;
    style?: CSSProperties;
};

export default function LinkedInImportButton({
                                                 label,
                                                 style,
                                                 ...props
                                             }: LinkedInImportButtonProps) {
    const { t } = useTranslation();
    const resolvedLabel = label ?? t("upload.importFromLinkedin");

    return (
        <Button
            fullWidth
            radius="md"
            h={42}
            style={{
                backgroundColor: LINKEDIN_BLUE,
                borderColor: LINKEDIN_BLUE,
                color: "#ffffff",
                ...style,
            }}
            {...props}
        >
            <Group justify="center" gap="xs" wrap="nowrap">
                <IconBrandLinkedin size={22} aria-hidden="true" />
                <Text component="span" fw={700} size="sm" c="#ffffff">
                    {resolvedLabel}
                </Text>
            </Group>
        </Button>
    );
}
