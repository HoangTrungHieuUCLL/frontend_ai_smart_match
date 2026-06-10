import {Avatar, Button, Group, Image, Text, Select, Modal, Popover, Stack} from "@mantine/core";
import { useRouter } from "next/router";
import { Language, useTranslation } from "../contexts/I18nContext";
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

    const navItems = [
        { label: t("nav.homepage"), href: "/" },
        { label: t("nav.services"), href: "#" },
        { label: t("nav.team"), href: "#" },
        { label: t("nav.clients"), href: "#" },
        { label: t("nav.consultation"), href: "#" }
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
        localStorage.removeItem("access_token");
        localStorage.removeItem("email");
        setLoggedInEmail("");
        setLoggedInRole("");
        setLogoutOpened(false);
        window.dispatchEvent(new Event("auth-change"));
        await router.push("/");
    };

    // useEffect(() => {
    //     const email = localStorage.getItem("email");

    //     if (email != null) {
    //         setLoggedInEmail(email);
    //     }
    // }, []);
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
                src={"/logo.png"} 
                alt={"HRNEXT logo"} 
                h={70} 
                w="auto"
                style={{ flexShrink: 0, minWidth: 120 }}
            />

            {/* Navigation Items */}
            <Group gap="lg" justify="center" style={{ flex: 1, minWidth: 0 }}>
                {navItems.map((item) => (
                    <Text 
                        key={item.label}
                        fw={400} 
                        c="gray.8"
                        size="sm"
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
                    fw={500}
                    size="sm"
                    px="md"
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
                                <Button
                                    radius="xl"
                                    size="sm"
                                    w={MENU_BUTTON_WIDTH}
                                    variant="outline"
                                    color={BROWN}
                                    onClick={() => {
                                        setLogoutOpened(false);
                                        router.push("/job-search-with-ai");
                                    }}
                                >
                                    Edit job list
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
                <Select
                    value={language}
                    onChange={(value) => {
                        if (value === "EN" || value === "VN") {
                            setLanguage(value as Language);
                        }
                    }}
                    data={[
                        { value: "EN", label: "EN" },
                        { value: "VN", label: "VN" }
                    ]}
                    w={70}
                    size="sm"
                    clearable={false}
                    searchable={false}
                    style={{ flexShrink: 0 }}
                />
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
