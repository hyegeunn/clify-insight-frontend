import { useTranslation } from "react-i18next";
import { BaseInput, BaseButton } from "@/components/common";
import AuthFooter from "@/components/loginFooter/AuthFooter";
import type { PasswordResetViewProps } from "@/types/pages/password-reset";
import styles from "./PasswordResetView.module.scss";

const PasswordResetView = ({
  email,
  password,
  passwordConfirm,
  isEmailSent,
  onEmailChange,
  onPasswordChange,
  onPasswordConfirmChange,
  onSendEmail,
  onSubmit,
}: PasswordResetViewProps) => {
  const { t } = useTranslation("pages/passwordReset");
  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.resetSection}>
          <div className={styles.headerWrapper}>
            <h1 className={styles.title}>{t("title")}</h1>
            <p className={styles.description}>
              {!isEmailSent
                ? t("description.emailStep")
                : t("description.passwordStep")}
            </p>
          </div>

          <form
            onSubmit={isEmailSent ? onSubmit : onSendEmail}
            className={styles.formWrapper}
            noValidate
          >
            <div className={styles.inputsWrapper}>
              {!isEmailSent ? (
                <BaseInput
                  type="email"
                  value={email}
                  onChange={onEmailChange}
                  placeholder={t("placeholder.email")}
                  autoComplete="email"
                />
              ) : (
                <>
                  <BaseInput
                    type="password"
                    value={password}
                    onChange={onPasswordChange}
                    placeholder={t("placeholder.password")}
                    autoComplete="new-password"
                  />
                  <BaseInput
                    type="password"
                    value={passwordConfirm}
                    onChange={onPasswordConfirmChange}
                    placeholder={t("placeholder.passwordConfirm")}
                    autoComplete="new-password"
                  />
                </>
              )}
            </div>

            <div className={styles.buttonWrapper}>
              <BaseButton type="submit" variant="primary" size="large">
                {!isEmailSent ? t("button.sendEmail") : t("button.complete")}
              </BaseButton>
            </div>
          </form>
        </div>

        <AuthFooter />
      </div>
    </div>
  );
};

export default PasswordResetView;
