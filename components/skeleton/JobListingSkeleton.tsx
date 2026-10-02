import { Skeleton } from "@mantine/core";

import styles from "../../styles/editorial.module.css";

const JobListingSkeleton: React.FC = () => (
    <li className={styles.row} aria-hidden="true" style={{ cursor: "default" }}>
        <Skeleton height={12} width={20} radius={0} />
        <div>
            <Skeleton height={18} width="60%" radius={0} />
            <Skeleton height={12} width="35%" radius={0} mt={8} />
            <Skeleton height={20} width="50%" radius={0} mt={14} />
        </div>
        <Skeleton height={12} width={80} radius={0} />
        <Skeleton height={34} width={72} radius={0} />
        <Skeleton height={36} width={140} radius={0} />
    </li>
);

export default JobListingSkeleton;
