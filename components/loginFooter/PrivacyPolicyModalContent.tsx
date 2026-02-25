import styles from "@/pages/login/LoginView.module.scss";

const PrivacyPolicyModalContent = () => {
  return (
    <div className={styles.modalContent}>
      <section className={styles.modalSection}>
        <h4 className={styles.modalSectionTitle}>제1조 처리 목적</h4>
        <p className={styles.modalText}>
          회사는 제휴 기업 임직원의 마음 케어 지원과 조직 단위 통계 분석, 서비스 이용 현황 제공을 위해 필요한 최소한의 개인정보를 처리합니다.
        </p>
      </section>

      <section className={styles.modalSection}>
        <h4 className={styles.modalSectionTitle}>
          제2조 처리 항목
        </h4>
        <p className={styles.modalText}>
          1. HR 담당자 계정 관리
        </p>
        <p className={styles.modalText}>
          - 이름, 이메일, 소속 부서, 연락처, 로그인 기록
        </p>
        <p className={styles.modalText}>
          2. 임직원 서비스 이용 분석(비식별/집계)
        </p>
        <p className={styles.modalText}>
          - 사번, 소속 조직 정보(본부 &gt; 부서 &gt; 팀), 서비스 이용 이력(심리상담/검사/마음 체크/루틴/셀프케어 등)
        </p>
        <p className={styles.modalText}>
          ※ 상담 내용, 테스트 세부 점수, 음성/영상 데이터 등 개인 민감 정보는 HR에게 제공되지 않습니다.
        </p>
      </section>

      <section className={styles.modalSection}>
        <h4 className={styles.modalSectionTitle}>
          제3조 데이터 제공 방식 (가장 중요)
        </h4>
        <p className={styles.modalText}>
          1. 회사는 임직원 정보를 비식별화 및 통계화하여 조직 단위로만 제공합니다.
        </p>
        <p className={styles.modalText}>
          2. HR 담당자는 개별 구성원의 민감 정보, 상태 점수, 상담 기록을 열람할 수 없습니다.
        </p>
      </section>

      <section className={styles.modalSection}>
        <h4 className={styles.modalSectionTitle}>
          제4조 보유 및 파기
        </h4>
        <p className={styles.modalText}>
          1. 데이터는 기업 계약 기간 동안 보유·이용되며, 계약 종료 후 관련 법령에 따라 파기됩니다.
        </p>
      </section>

      <section className={styles.modalSection}>
        <h4 className={styles.modalSectionTitle}>
          제5조 안전성 확보 조치
        </h4>
        <ul className={styles.modalList}>
          <li>데이터 암호화 및 접근 통제</li>
          <li>관리자 계정 권한 구분</li>
          <li>접근 기록 저장 및 모니터링</li>
          <li>외부 반출 및 무단 전송 방지 체계 운영</li>
        </ul>
      </section>

      <section className={styles.modalSection}>
        <h4 className={styles.modalSectionTitle}>
          제6조 이용자(HR)의 책임
        </h4>
        <p className={styles.modalText}>
          1. HR 담당자는 서비스 내 정보를 조직 관리 목적 외의 용도로 사용할 수 없습니다.
        </p>
        <p className={styles.modalText}>
          2. HR 담당자의 관리 소홀로 발생한 유출·오남용에 대해 회사는 책임을 지지 않습니다.
        </p>
      </section>

      <section className={styles.modalSection}>
        <h4 className={styles.modalSectionTitle}>
          제7조 문의처
        </h4>
        <p className={styles.modalText}>
          support@clify.co.kr
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicyModalContent;
