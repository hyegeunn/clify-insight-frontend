import styles from "@/pages/login/LoginView.module.scss";

const TermsModalContent = () => {
  return (
    <div className={styles.modalContent}>
      <section className={styles.modalSection}>
        <h4 className={styles.modalSectionTitle}>제1조 목적</h4>
        <p className={styles.modalText}>
        본 약관은 (주)유쾌한프로젝트(이하 "회사")가 제공하는 클라이피 인사이트 웹 서비스(이하 "서비스")를
        기업 HR 담당자 및 관리자가 이용함에 있어 필요한 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.
        </p>
      </section>

      <section className={styles.modalSection}>
        <h4 className={styles.modalSectionTitle}>제2조 정의</h4>
        <p className={styles.modalText}>
          1. "서비스"란 제휴 기업 임직원의 마음 케어 이용 현황, 조직 단위 리포트, 솔루션 이용 통계를 열람할 수 있는 관리자용 웹 서비스를 말합니다.
        </p>
        <p className={styles.modalText}>
          2. "이용자"란 제휴 기업으로부터 권한을 부여받아 본 서비스를 사용하는 HR 담당자 및 관리자 계정을 의미합니다.
        </p>
        <p className={styles.modalText}>
          3. "조직 리포트"란 본부 &gt; 부서 &gt; 팀 단위로 집계된 통계형/비식별 정보 데이터를 의미합니다.
        </p>
      </section>

      <section className={styles.modalSection}>
        <h4 className={styles.modalSectionTitle}>
          제3조 계정 및 접근 권한
        </h4>
        <p className={styles.modalText}>
          1. 서비스 로그인은 회사가 발급한 이메일 계정과 지정 비밀번호(강력 암호 기준)를 사용합니다.
        </p>
        <p className={styles.modalText}>
          2. 이용자는 계정 정보를 제3자와 공유하거나 양도할 수 없으며, 계정 관리 책임은 이용자에게 있습니다.
        </p>
        <p className={styles.modalText}>
          3. 이용자는 회사가 부여한 권한 범위 내에서만 데이터를 열람·활용해야 합니다.
        </p>
      </section>

      <section className={styles.modalSection}>
        <h4 className={styles.modalSectionTitle}>제4조 서비스 제공 범위</h4>
        <p className={styles.modalText}>
          1. 회사는 조직 단위 통계 정보 및 이용 현황 데이터를 제공합니다.
        </p>
        <p className={styles.modalText}>
          2. 서비스에서 제공되는 데이터는 임직원의 개인 정보가 아닌 비식별/집계 정보입니다.
        </p>
        <p className={styles.modalText}>
          3. 회사는 서비스 개선 및 안정적 운영을 위해 필요한 경우 시스템 업데이트 또는 변경을 수행할 수 있습니다.
        </p>
      </section>

      <section className={styles.modalSection}>
        <h4 className={styles.modalSectionTitle}>
          제5조 금지 사항
        </h4>
        <p className={styles.modalText}>
          1. 이용자는 서비스 내 데이터를 임직원에 대한 평가, 인사 불이익, 차별 등의 목적으로 활용할 수 없습니다.
        </p>
        <p className={styles.modalText}>
          2. 서비스에서 열람한 데이터의 무단 다운로드, 복사, 외부 전달, 2차 가공 배포는 금지됩니다.
        </p>
        <p className={styles.modalText}>
          3. 위반으로 발생한 모든 책임은 이용자 및 소속 기업에 귀속되며, 회사는 책임을 지지 않습니다.
        </p>
      </section>

      <section className={styles.modalSection}>
        <h4 className={styles.modalSectionTitle}>
          제6조 개인정보 및 데이터 보호
        </h4>
        <p className={styles.modalText}>
          1. 회사는 개인정보처리방침에 따라 임직원 정보를 보호합니다.
        </p>
        <p className={styles.modalText}>
          2. 이용자에게는 개인 상담 내용, 민감 정보, 개인별 점수 등 개인 식별이 가능한 정보는 제공되지 않습니다.
        </p>
        <p className={styles.modalText}>
          3. 회사는 데이터 암호화, 접근 제어, 전송 통제 등 안전성 확보 조치를 시행합니다.
        </p>
      </section>

      <section className={styles.modalSection}>
        <h4 className={styles.modalSectionTitle}>제7조 계약 및 이용 종료</h4>
        <p className={styles.modalText}>
          1. 서비스 이용 권한은 제휴 계약 기간 동안만 유효합니다.
        </p>
        <p className={styles.modalText}>
          2. 계약 종료 시 서비스 접근 권한은 즉시 철회되며, 관련 데이터는 개인정보처리방침에 따라 파기됩니다.
        </p>
      </section>

      <section className={styles.modalSection}>
        <h4 className={styles.modalSectionTitle}>제8조 면책</h4>
        <p className={styles.modalText}>
          1. 회사는 이용자가 서비스를 해석·활용하는 과정에서 발생하는 결과에 대해 책임을 지지 않습니다.
        </p>
        <p className={styles.modalText}>
          2. 이용자의 계정 관리 소홀로 발생한 정보 유출에 대해 회사는 책임을 지지 않습니다.
        </p>
      </section>

      <section className={styles.modalSection}>
        <h4 className={styles.modalSectionTitle}>제9조 준거법 및 분쟁 해결</h4>
        <p className={styles.modalText}>
         본 약관은 대한민국 법령을 따르며, 분쟁 발생 시 회사 본점 소재지를 관할하는 법원을 제1심 법원으로 합니다.
        </p>
      </section>
    </div>
  );
};

export default TermsModalContent;
