import {Button, Group, Image, Text, Select, Avatar, Modal, Stack, TextInput, PasswordInput} from "@mantine/core";
import { useRouter } from "next/router";
import { Language, useTranslation } from "../contexts/I18nContext";
import styles from "../styles/header.module.css";
import {useEffect, useState} from "react";
import Login from "./Login";

export const Header = () => {
    const router = useRouter();
    const { language, setLanguage, t } = useTranslation();
    const [loginOpened, setLoginOpened] = useState(false);
    const [loggedInUsername, setLoggedInUsername] = useState<string>("");

    const navItems = [
        { label: t("nav.homepage"), href: "/" },
        { label: t("nav.services"), href: "#" },
        { label: t("nav.team"), href: "#" },
        { label: t("nav.clients"), href: "#" },
        { label: t("nav.consultation"), href: "#" }
    ];

    const handleNavClick = (href: string) => {
        if (href !== "#") {
            router.push(href);
        }
    };

    const handleJobSearchClick = () => {
        router.push("/job-search-with-ai");
    };

    useEffect(() => {
        const username = localStorage.getItem("username");

        if (username != null) {
            setLoggedInUsername(username);
        }
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

                {loggedInUsername ? (
                    <Text c="black">Hello, {loggedInUsername}!</Text>
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
                    w={65}
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
                <Login />
            </Modal>
        </Group>
    );
}

export default Header;
