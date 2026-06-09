import type { ButtonHTMLAttributes, CSSProperties } from "react";
import { Button, Group, Text } from "@mantine/core";
import { IconBrandLinkedin } from "@tabler/icons-react";

const LINKEDIN_BLUE = "#0A66C2";

type LinkedInImportButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "style"> & {
    label?: string;
    style?: CSSProperties;
};

export default function LinkedInImportButton({
                                                 label = "Import from LinkedIn",
                                                 style,
                                                 ...props
                                             }: LinkedInImportButtonProps) {
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
                    {label}
                </Text>
            </Group>
        </Button>
    );
}
