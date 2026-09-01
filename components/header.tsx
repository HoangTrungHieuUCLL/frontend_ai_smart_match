import {Avatar, Button, Group, Image, Text, Modal, Popover, Stack, Menu} from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useTranslation } from "../contexts/I18nContext";
import styles from "../styles/header.module.css";
import {useEffect, useState} from "react";
import Login from "./Login";

const BROWN = "#774326";
const MENU_BUTTON_WIDTH = 160;

export const Header = () => {
    const router = useRouter();
    const { language, setLanguage, t } = useTranslation();
    const [loginOpened, setLoginOpened] = useState(false);
    const [loggedInEmail, setLoggedInEmail] = useState<string>("");
    const [loggedInRole, setLoggedInRole] = useState<string>("");
    const [logoutOpened, setLogoutOpened] = useState(false);

    const leftNavItems = [
        { label: t("nav.homepage"), href: "/" },
    ];
    const rightNavItems = [
        { label: t("nav.team"), href: "/team" },
        { label: t("nav.library"), href: "#" }
    ];
    const serviceItems = [
        t("nav.servicesHr"),
        t("nav.servicesManagement"),
        t("nav.servicesFinance"),
    ];
    const syncAuth = () => {
        const email = localStorage.getItem("email");
        const token = localStorage.getItem("access_token");
        setLoggedInEmail(email ?? "");
        try {
            const payload = token ? JSON.parse(atob(token.split(".")[0])) : null;
            setLoggedInRole(payload?.role ?? "");
        } catch {
            setLoggedInRole("");
        }
    };
    const handleNavClick = (href: string) => {
        if (href !== "#") {
            router.push(href);
        }
    };

    const handleJobSearchClick = () => {
        router.push("/job-search-with-ai");
    };

    const handleLogout = async () => {
        localStorage.removeItem("profile_id");
        localStorage.removeItem("access_token");
        localStorage.removeItem("email");
        setLoggedInEmail("");
        setLoggedInRole("");
        setLogoutOpened(false);
        window.dispatchEvent(new Event("auth-change"));
        await router.push("/");
    };

    useEffect(() => {
        syncAuth();

        window.addEventListener("storage", syncAuth);
        window.addEventListener("auth-change", syncAuth);

        return () => {
            window.removeEventListener("storage", syncAuth);
            window.removeEventListener("auth-change", syncAuth);
        };
    }, []);
    return (
        <Group 
            justify="space-between" 
            align="center"
            px="lg" 
            py="md" 
            wrap="nowrap"
            style={{ borderBottom: "1px solid #e0e0e0", backgroundColor: "#ffffff" }}
        >
            {/* Logo */}
            <Image 
                src={"/logo-hr-nextvn.svg"}
                alt={"HRNEXT logo"} 
                h={70} 
                w="auto"
                style={{ flexShrink: 0, minWidth: 120 }}
            />

            {/* Navigation Items */}
            <Group gap="lg" justify="center" style={{ flex: 1, minWidth: 0 }}>
                {leftNavItems.map((item) => (
                    <Text
                        key={item.label}
                        fw={router.pathname === item.href ? 700 : 400}
                        c={router.pathname === item.href ? "#1a1a1a" : BROWN}
                        size="md"
                        style={{
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                            transition: "color 0.2s"
                        }}
                        onClick={() => handleNavClick(item.href)}
                        className="nav-item"
                    >
                        {item.label}
                    </Text>
                ))}

                <Group gap={4} wrap="nowrap" className="nav-item">
                    <Text
                        fw={router.pathname === "/services" ? 700 : 400}
                        c={router.pathname === "/services" ? "#1a1a1a" : BROWN}
                        size="md"
                        style={{ cursor: "pointer", whiteSpace: "nowrap" }}
                        onClick={() => router.push("/services")}
                    >
                        {t("nav.services")}
                    </Text>
                    <Menu shadow="md" width={240} position="bottom-start" withinPortal={false}>
                        <Menu.Target>
                            <IconChevronDown size={14} color={BROWN} style={{ cursor: "pointer" }} />
                        </Menu.Target>
                        <Menu.Dropdown>
                            {serviceItems.map((label) => (
                                <Menu.Item key={label}>{label}</Menu.Item>
                            ))}
                        </Menu.Dropdown>
                    </Menu>
                </Group>

                {rightNavItems.map((item) => (
                    <Text
                        key={item.label}
                        fw={router.pathname === item.href ? 700 : 400}
                        c={router.pathname === item.href ? "#1a1a1a" : BROWN}
                        size="md"
                        style={{
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                            transition: "color 0.2s"
                        }}
                        onClick={() => handleNavClick(item.href)}
                        className="nav-item"
                    >
                        {item.label}
                    </Text>
                ))}
            </Group>

            {/* Right Section: Button, User, Language */}
            <Group gap="md" align="center" style={{ flexShrink: 0 }}>
                <Button
                    fw={600}
                    size="md"
                    px="lg"
                    radius="xl"
                    style={{
                        backgroundColor: "#774326",
                        whiteSpace: "nowrap"
                    }}
                    onClick={handleJobSearchClick}
                >
                    {t("nav.jobSearch")}
                </Button>

                {loggedInEmail ? (
                    <Popover
                        opened={logoutOpened}
                        onChange={setLogoutOpened}
                        position="bottom"
                        offset={12}
                        withinPortal={false}
                        shadow="md"
                    >
                        <Popover.Target>
                            <Button
                                variant="subtle"
                                radius="xl"
                                px={6}
                                leftSection={
                                    <Avatar
                                        radius="xl"
                                        styles={{
                                            root: {
                                                backgroundColor: "#f4dfc6",
                                                color: BROWN,
                                            },
                                        }}
                                    >
                                        {loggedInEmail.slice(0, 1).toUpperCase()}
                                    </Avatar>
                                }
                                style={{
                                    color: "#111",
                                }}
                                onClick={() => setLogoutOpened((opened) => !opened)}
                            >
                                <Text
                                    c="black"
                                    className={styles.adminGreeting}
                                >
                                    Hello, {loggedInEmail}!
                                </Text>
                            </Button>
                        </Popover.Target>
                        <Popover.Dropdown className={styles.logoutPopover}>
                            <Stack align="center" gap={8}>
                                <Button
                                    radius="xl"
                                    size="sm"
                                    w={MENU_BUTTON_WIDTH}
                                    variant="outline"
                                    color={BROWN}
                                    onClick={() => {
                                        setLogoutOpened(false);
                                        router.push("/profile");
                                    }}
                                >
                                    My profile
                                </Button>
                                {loggedInRole === "admin" && (
                                    <Button
                                        radius="xl"
                                        size="sm"
                                        w={MENU_BUTTON_WIDTH}
                                        variant="outline"
                                        color={BROWN}
                                        onClick={() => {
                                            setLogoutOpened(false);
                                            router.push("/executive-view");
                                        }}
                                    >
                                        Executive view
                                    </Button>
                                )}
                                <Button
                                    radius="xl"
                                    size="sm"
                                    w={MENU_BUTTON_WIDTH}
                                    className={styles.logoutButton}
                                    onClick={handleLogout}
                                >
                                    Log out
                                </Button>
                            </Stack>
                        </Popover.Dropdown>
                    </Popover>
                ) : (
                    // Log in button
                    <Button
                        className={styles.loginButton}
                        fw={500}
                        size="sm"
                        radius="xl"
                        onClick={() => setLoginOpened(true)}
                    >
                        {t("nav.login")}
                    </Button>
                )}

                {/* Language Selector */}
                <Group gap={6} wrap="nowrap" style={{ flexShrink: 0 }}>
                    <Text
                        size="md"
                        fw={language === "VN" ? 700 : 400}
                        c={language === "VN" ? "#1a1a1a" : BROWN}
                        style={{ cursor: "pointer" }}
                        onClick={() => setLanguage("VN")}
                    >
                        VI
                    </Text>
                    <Text size="md" c={BROWN}>|</Text>
                    <Text
                        size="md"
                        fw={language === "EN" ? 700 : 400}
                        c={language === "EN" ? "#1a1a1a" : BROWN}
                        style={{ cursor: "pointer" }}
                        onClick={() => setLanguage("EN")}
                    >
                        EN
                    </Text>
                </Group>
            </Group>

            <Modal
                opened={loginOpened}
                onClose={() => setLoginOpened(false)}
                centered
                withCloseButton={false}
                radius="lg"
                padding="lg"
                size={450}
            >
                <Login onSuccess={(email: string) => {
                        setLoggedInEmail(email);
                        setLoginOpened(false);
                    }} 
                    onClose={() => setLoginOpened(false)}
                />
            </Modal>
        </Group>
    );
}

export default Header;
