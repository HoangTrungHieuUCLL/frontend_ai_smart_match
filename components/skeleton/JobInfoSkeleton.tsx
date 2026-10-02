import { Skeleton } from "@mantine/core";

import styles from "../../styles/editorial.module.css";

const JobInfoSkeleton = () => (
    <div className={styles.page} aria-busy="true">
        <section className={styles.hero} style={{ background: "var(--base)" }}>
            <div className={styles.heroInner} style={{ paddingBottom: 40 }}>
                <Skeleton height={14} width={140} />
                <Skeleton height={14} width={260} mt={40} />
                <Skeleton height={64} width="70%" mt={16} />
                <Skeleton height={64} width="45%" mt={12} />
            </div>
        </section>
        <div className={styles.body}>
            <div className={styles.detailLayout}>
                <div>
                    {Array.from({ length: 3 }, (_, i) => (
                        <div key={i} className={styles.section}>
                            <Skeleton height={14} width={200} />
                            <Skeleton height={14} mt={18} />
                            <Skeleton height={14} mt={10} width="92%" />
                            <Skeleton height={14} mt={10} width="80%" />
                        </div>
                    ))}
                </div>
                <Skeleton height={360} />
            </div>
        </div>
    </div>
);

export default JobInfoSkeleton;
