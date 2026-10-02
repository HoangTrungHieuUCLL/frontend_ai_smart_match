import { useId } from "react";

import styles from "../styles/editorial.module.css";

// [vertical offset, palette colour, stroke width] for each diagonal band.
const BANDS: [number, string, number][] = [
    [-120, "--c5", 130],
    [10, "--c6", 120],
    [140, "--c2", 130],
    [240, "--c3", 60],
    [340, "--c1", 140],
    [470, "--c4", 120],
    [590, "--c5", 130],
    [710, "--c2", 120],
    [830, "--c6", 130],
    [950, "--c1", 130],
];

// Thick blurred bands + film grain, drawn in SVG so the page ships no image.
export function GradientBackdrop() {
    const id = useId().replace(/:/g, "");
    const band = (d: string, color: string, width: number) => (
        <path d={d} fill="none" stroke={`var(${color})`} strokeWidth={width} strokeLinecap="round" />
    );

    return (
        <div className={styles.gradientWrap} aria-hidden="true">
            <svg className={styles.gradient} viewBox="0 0 1440 720" preserveAspectRatio="xMidYMid slice">
                <defs>
                    <filter id={`blur-${id}`} x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="30" />
                    </filter>
                    <filter id={`grain-${id}`}>
                        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
                        <feColorMatrix type="saturate" values="0" />
                    </filter>
                </defs>
                <rect width="1440" height="720" fill="var(--base)" />
                <g filter={`url(#blur-${id})`}>
                    {BANDS.map(([y, color, width]) =>
                        band(`M-200 ${y - 420} C 250 ${y - 60}, 700 ${y - 380}, 1100 ${y + 80} S 1600 ${y + 260}, 1800 ${y + 520}`, color, width),
                    )}
                </g>
                <rect width="1440" height="720" filter={`url(#grain-${id})`} opacity="0.45" style={{ mixBlendMode: "overlay" }} />
            </svg>
        </div>
    );
}

export function ArrowUpRight({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="7" aria-hidden="true">
            <path d="M12 68 L68 12" />
            <path d="M22 12 H68 V58" />
        </svg>
    );
}
