import { IBM_Plex_Mono } from "next/font/google";

// Mapped to --font-plex-mono in _app; the Vietnamese subset is required for diacritics.
export const plexMono = IBM_Plex_Mono({
    subsets: ["latin", "vietnamese"],
    weight: ["400", "500", "600", "700"],
});
