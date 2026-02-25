import { useToastStore } from "@/stores/toastStore";
import BaseToast from "./BaseToast";
import styles from "./BaseToastContainer.module.scss";

const BaseToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <BaseToast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default BaseToastContainer;
