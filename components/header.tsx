import {Button, Group, Image, Text, Select, Avatar} from "@mantine/core";
import { useState } from "react";
import { useRouter } from "next/router";

export const Header = () => {
    const router = useRouter();
    const [language, setLanguage] = useState<string | null>("EN");

    const navItems = [
        { label: "Homepage", href: "/" },
        { label: "Our services", href: "#" },
        { label: "Our team", href: "#" },
        { label: "Our clients", href: "#" },
        { label: "Consultation", href: "#" }
    ];

    const handleNavClick = (href: string) => {
        if (href !== "#") {
            router.push(href);
        }
    };

    const handleJobSearchClick = () => {
        router.push("/job-search-with-ai");
    };

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
                h={45} 
                w="auto"
                style={{ flexShrink: 0 }}
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
                    style={{ 
                        backgroundColor: "#774326", 
                        borderRadius: "20px",
                        whiteSpace: "nowrap"
                    }}
                    onClick={handleJobSearchClick}
                >
                    Job search with AI
                </Button>

                {/* User Avatar */}
                <Avatar 
                    name="U"
                    size={36}
                    radius="xl"
                    style={{ cursor: "pointer", flexShrink: 0 }}
                    color="brown"
                />

                {/* Language Selector */}
                <Select
                    value={language}
                    onChange={setLanguage}
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
        </Group>
    );
}

export default Header;