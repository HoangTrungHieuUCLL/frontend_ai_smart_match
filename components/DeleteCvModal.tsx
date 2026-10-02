import { Modal } from "@mantine/core";
import { IconFileTypePdf, IconTrash } from "@tabler/icons-react";

import { useTranslation } from "../contexts/I18nContext";
import styles from "../styles/editorial.module.css";
import { modalClassNames } from "./CVUploadModal";

type Props = {
    opened: boolean;
    filename: string | null | undefined;
    deleting: boolean;
    onCancel: () => void;
    onConfirm: () => void;
};

export default function DeleteCvModal({ opened, filename, deleting, onCancel, onConfirm }: Props) {
    const { t } = useTranslation();

    return (
        <Modal
            opened={opened}
            onClose={() => {
                if (!deleting) onCancel();
            }}
            title={t("profile.deleteCv")}
            centered
            size="sm"
            radius={0}
            classNames={{ ...modalClassNames, header: `${styles.modalHeader} ${styles.modalHeaderDanger}` }}
            closeButtonProps={{ "aria-label": t("common.close") }}
        >
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className={styles.dangerTitle}>{t("profile.deleteCvQuestion")}</div>

                {filename && (
                    <div className={styles.fileRow}>
                        <IconFileTypePdf size={20} />
                        <span className={styles.fileName}>{filename}</span>
                    </div>
                )}

                <p className={styles.dropzoneHint} style={{ margin: 0, lineHeight: 1.6 }}>
                    {t("profile.deleteCvConsequences")}
                </p>

                <div style={{ display: "flex", gap: 10 }}>
                    <button type="button" className={styles.chip} style={{ flex: 1, height: 44 }} disabled={deleting} onClick={onCancel}>
                        {t("common.cancel")}
                    </button>
                    <button
                        type="button"
                        className={`${styles.chip} ${styles.dangerButton}`}
                        style={{ flex: 1, height: 44 }}
                        disabled={deleting}
                        aria-busy={deleting}
                        onClick={onConfirm}
                    >
                        <IconTrash size={16} />
                        {deleting ? t("cvSummary.working") : t("common.delete")}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
