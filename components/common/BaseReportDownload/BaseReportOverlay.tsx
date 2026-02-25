import Lottie from "lottie-react";
import reportDownloadAnimation from "@/assets/animations/report_download.json";
import styles from "./BaseReportOverlay.module.scss";

const BaseReportOverlay = () => {
  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.animationWrapper}>
          <Lottie
            animationData={reportDownloadAnimation}
            loop={true}
            className={styles.animation}
          />
        </div>
        <div className={styles.textWrapper}>
          <p className={styles.text}>리포트 생성 중</p>
          <p className={styles.subText}>잠시만 기다려 주세요</p>
        </div>
      </div>
    </div>
  );
};

export default BaseReportOverlay;
