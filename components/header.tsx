import {Button, Group, Image, Text} from "@mantine/core";

export const Header = () => {
    return (
        <Group justify="space-between" p="sm" style={{ borderBottom: "1px solid #d0e4f7" }}>
            <Image src={"/logo.png"} alt={"logo"} h={48} w={"auto"}/>

            <Group gap="xl">
                <Text fw={300} c="gray.7">DASHBOARD</Text>
                <Text fw={300} c="gray.7">RESEARCH</Text>
                <Text fw={300} c="gray.7">MEDIA</Text>
                <Button fw={300}>PARTICIPATE</Button>
            </Group>
        </Group>
    );
}

export default Header;