import { Burger, Drawer, Image, Menu, Modal, Popover } from "@mantine/core";
import { IconArrowUpRight, IconChevronDown } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { useTranslation } from "../contexts/I18nContext";
import styles from "../styles/header.module.css";
import Login from "./Login";

export const Header = () => {
    const router = useRouter();
    const { language, setLanguage, t } = useTranslation();
    const [loginOpened, setLoginOpened] = useState(false);
    const [loggedInEmail, setLoggedInEmail] = useState<string>("");
    const [loggedInRole, setLoggedInRole] = useState<string>("");
    const [accountOpened, setAccountOpened] = useState(false);
    const [menuOpened, setMenuOpened] = useState(false);

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

    const go = (href: string) => {
        setAccountOpened(false);
        setMenuOpened(false);
        router.push(href);
    };

    const handleLogout = async () => {
        localStorage.removeItem("profile_id");
        localStorage.removeItem("access_token");
        localStorage.removeItem("email");
        setLoggedInEmail("");
        setLoggedInRole("");
        setAccountOpened(false);
        setMenuOpened(false);
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

    useEffect(() => {
        const close = () => setMenuOpened(false);
        router.events.on("routeChangeStart", close);
        return () => router.events.off("routeChangeStart", close);
    }, [router.events]);

    const isActive = (href: string) =>
        href === "/" ? router.pathname === "/" : router.pathname.startsWith(href);

    const navLink = (href: string, label: string) => (
        <Link key={href} href={href} className={styles.navLink} aria-current={isActive(href) ? "page" : undefined}>
            {label}
        </Link>
    );

    const navLinks = (
        <>
            {navLink("/", t("nav.homepage"))}
            <span className={styles.navGroup}>
                {navLink("/services", t("nav.services"))}
                <Menu shadow="md" width={260} position="bottom-start" radius={0}>
                    <Menu.Target>
                        <button type="button" className={styles.chevron} aria-label={t("nav.services")}>
                            <IconChevronDown size={14} />
                        </button>
                    </Menu.Target>
                    <Menu.Dropdown className={styles.dropdown}>
                        {serviceItems.map((label) => (
                            <Menu.Item key={label} className={styles.dropdownItem} onClick={() => go("/services")}>
                                {label}
                            </Menu.Item>
                        ))}
                    </Menu.Dropdown>
                </Menu>
            </span>
            {navLink("/team", t("nav.team"))}
            <span className={`${styles.navLink} ${styles.navDisabled}`} aria-disabled="true">
                {t("nav.library")}
            </span>
        </>
    );

    const languageSwitch = (
        <div className={styles.language} role="group" aria-label="Language">
            {(["VN", "EN"] as const).map((code) => (
                <button
                    key={code}
                    type="button"
                    className={styles.languageButton}
                    aria-pressed={language === code}
                    onClick={() => setLanguage(code)}
                >
                    {code === "VN" ? "VI" : "EN"}
                </button>
            ))}
        </div>
    );

    const accountActions = (
        <>
            <button type="button" className={styles.menuButton} onClick={() => go("/profile")}>
                {t("nav.myProfile")}
            </button>
            {loggedInRole === "admin" && (
                <button type="button" className={styles.menuButton} onClick={() => go("/executive-view")}>
                    {t("nav.executiveView")}
                </button>
            )}
            <button type="button" className={`${styles.menuButton} ${styles.menuButtonSolid}`} onClick={handleLogout}>
                {t("profile.logOut")}
            </button>
        </>
    );

    return (
        <header className={styles.header}>
            <Link href="/" className={styles.logo} aria-label="HRNEXT">
                <Image src="/logo-hr-nextvn.svg" alt="HRNEXT logo" h={56} w="auto" />
            </Link>

            <nav className={styles.nav} aria-label="Main">
                {navLinks}
            </nav>

            <div className={styles.actions}>
                <Link href="/job-search-with-ai" className={styles.cta}>
                    {t("nav.jobSearch")}
                    <IconArrowUpRight size={16} />
                </Link>

                {loggedInEmail ? (
                    <Popover opened={accountOpened} onChange={setAccountOpened} position="bottom-end" offset={8} radius={0} shadow="md">
                        <Popover.Target>
                            <button
                                type="button"
                                className={styles.account}
                                aria-expanded={accountOpened}
                                onClick={() => setAccountOpened((opened) => !opened)}
                            >
                                <span className={styles.avatar}>{loggedInEmail.slice(0, 1).toUpperCase()}</span>
                                <span className={styles.accountEmail}>{loggedInEmail}</span>
                                <IconChevronDown size={14} />
                            </button>
                        </Popover.Target>
                        <Popover.Dropdown className={styles.dropdown}>
                            <div className={styles.menuStack}>{accountActions}</div>
                        </Popover.Dropdown>
                    </Popover>
                ) : (
                    <button type="button" className={styles.login} onClick={() => setLoginOpened(true)}>
                        {t("nav.login")}
                    </button>
                )}

                {languageSwitch}
            </div>

            <Burger
                className={styles.burger}
                opened={menuOpened}
                onClick={() => setMenuOpened((opened) => !opened)}
                size="sm"
                color="var(--ink)"
                aria-label={t("nav.menu")}
            />

            <Drawer
                opened={menuOpened}
                onClose={() => setMenuOpened(false)}
                position="right"
                size="100%"
                radius={0}
                padding="lg"
                closeButtonProps={{ "aria-label": t("common.close") }}
                styles={{ content: { background: "var(--paper)" }, header: { background: "var(--paper)" } }}
            >
                <div className={styles.mobileMenu}>
                    <nav className={styles.mobileNav} aria-label="Main">
                        {navLinks}
                    </nav>
                    <Link href="/job-search-with-ai" className={styles.cta}>
                        {t("nav.jobSearch")}
                        <IconArrowUpRight size={16} />
                    </Link>
                    {loggedInEmail ? (
                        <div className={styles.menuStack}>
                            <span className={styles.accountEmail}>{loggedInEmail}</span>
                            {accountActions}
                        </div>
                    ) : (
                        <button
                            type="button"
                            className={styles.login}
                            onClick={() => {
                                setMenuOpened(false);
                                setLoginOpened(true);
                            }}
                        >
                            {t("nav.login")}
                        </button>
                    )}
                    {languageSwitch}
                </div>
            </Drawer>

            <Modal
                opened={loginOpened}
                onClose={() => setLoginOpened(false)}
                centered
                withCloseButton={false}
                radius={0}
                padding="lg"
                size={450}
            >
                <Login
                    onSuccess={(email: string) => {
                        setLoggedInEmail(email);
                        setLoginOpened(false);
                    }}
                    onClose={() => setLoginOpened(false)}
                />
            </Modal>
        </header>
    );
};

export default Header;
