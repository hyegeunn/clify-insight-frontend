import { useState } from "react";
import BaseModal from "@/components/common/BaseModal";
import TermsModalContent from "./TermsModalContent";
import PrivacyPolicyModalContent from "./PrivacyPolicyModalContent";
import LicenseModalContent from "./LicenseModalContent";
import styles from "@/pages/login/LoginView.module.scss";

const AuthFooter = () => {
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [licenseModalOpen, setLicenseModalOpen] = useState(false);

  return (
    <>
      <div className={styles.footerWrapper}>
        <div className={styles.footerLinks}>
          <button
            type="button"
            className={styles.footerLink}
            onClick={() => setTermsModalOpen(true)}
          >
            이용약관
          </button>
          <span className={styles.separator}>|</span>
          <button
            type="button"
            className={styles.footerLink}
            onClick={() => setPrivacyModalOpen(true)}
          >
            개인정보처리방침
          </button>
          <span className={styles.separator}>|</span>
          <button
            type="button"
            className={styles.footerLink}
            onClick={() => setLicenseModalOpen(true)}
          >
            오픈소스 라이선스
          </button>
        </div>
        <div className={styles.copyright}>
          © 2025 Clify. All rights reserved.
        </div>
      </div>

      {/* 이용약관 모달 */}
      <BaseModal
        isOpen={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        title="이용약관"
        width={600}
        headerPadding="24px 24px 0 24px"
        contentPadding="24px"
        footerBorder={false}
        content={<TermsModalContent />}
      />

      {/* 개인정보처리방침 모달 */}
      <BaseModal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
        title="개인정보처리방침"
        width={600}
        headerPadding="24px 24px 0 24px"
        contentPadding="24px"
        footerBorder={false}
        content={<PrivacyPolicyModalContent />}
      />

      {/* 오픈소스 라이선스 모달 */}
      <BaseModal
        isOpen={licenseModalOpen}
        onClose={() => setLicenseModalOpen(false)}
        title="오픈소스 라이선스"
        width={430}
        headerPadding="24px 24px 0 24px"
        contentPadding="24px"
        footerBorder={false}
        content={<LicenseModalContent />}
      />
    </>
  );
};

export default AuthFooter;
