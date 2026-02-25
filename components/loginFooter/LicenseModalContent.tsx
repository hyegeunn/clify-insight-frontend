import styles from "@/pages/login/LoginView.module.scss";

const LicenseModalContent = () => {
  return (
    <div className={styles.modalContent}>
      <section className={styles.modalSection}>
        <h4 className={styles.modalSectionTitle}>Fluent UI System Icons</h4>
        <p className={styles.modalText}>© 2020 Microsoft Corporation</p>
        <p className={styles.modalText}>Licensed under the MIT License</p>
        <p className={styles.modalText}>
          <a
            href="https://github.com/microsoft/fluentui-system-icons"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.modalLink}
          >
            https://github.com/microsoft/fluentui-system-icons
          </a>
        </p>
      </section>

      <section className={styles.modalSection}>
        <h4 className={styles.modalSectionTitle}>Material Icons</h4>
        <p className={styles.modalText}>© 2014 Google LLC</p>
        <p className={styles.modalText}>
          Licensed under the Apache License, Version 2.0
        </p>
        <p className={styles.modalText}>
          <a
            href="https://fonts.google.com/icons"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.modalLink}
          >
            https://fonts.google.com/icons
          </a>
        </p>
      </section>

      <section className={styles.modalSection}>
        <h4 className={styles.modalSectionTitle}>Pretendard Font</h4>
        <p className={styles.modalText}>
          © 2021 Kil Hyung Lee — SIL Open Font License 1.1
        </p>
        <p className={styles.modalText}>
          <a
            href="https://github.com/orioncactus/pretendard"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.modalLink}
          >
            https://github.com/orioncactus/pretendard
          </a>
        </p>
      </section>

      <section className={styles.modalSection}>
        <h4 className={styles.modalSectionTitle}>Download File Icon Animation (Lottie)</h4>
        <p className={styles.modalText}>
          © Kohinoor Film
        </p>
        <p className={styles.modalText}>
          Licensed under the Lottie Simple License
        </p>
        <p className={styles.modalText}>
          <a
            href="https://lottiefiles.com/free-animation/download-file-icon-animation-GHEG8JuYoD"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.modalLink}
          >
            https://lottiefiles.com/free-animation/download-file-icon-animation-GHEG8JuYoD
          </a>
        </p>
      </section>
    </div>
  );
};

export default LicenseModalContent;
