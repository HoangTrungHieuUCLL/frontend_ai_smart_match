import "@mantine/core/styles.css";
import Head from "next/head";
import { MantineProvider, Box } from "@mantine/core";
import { theme } from "../theme";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { I18nProvider } from "../contexts/I18nContext";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import "../styles/tokens.css";
import { plexMono } from "../utils/fonts";

export default function App({ Component, pageProps }: any) {
  return (
    <MantineProvider theme={theme}>
      <Notifications position="bottom-right"  />
      <Head>
        <title>HRNEXT.vn</title>
        {/* On :root (not a wrapper class) so portalled modals and drawers get the font too. */}
        <style>{`:root { --font-plex-mono: ${plexMono.style.fontFamily}; }`}</style>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
        <link rel="icon" type="image/png" sizes="128x128" href="/logo.png" />
        <link rel="icon" type="image/png" sizes="64x64" href="/logo.png" />
        <link rel="shortcut icon" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo.png" />
      </Head>
      <I18nProvider>
        <Box style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <Header />
          <Box style={{ flex: 1 }}>
            <Component {...pageProps} />
          </Box>
          <Footer />
        </Box>
      </I18nProvider>
    </MantineProvider>
  );
}
