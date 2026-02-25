import { useTranslation } from "react-i18next";
import { BaseInput, BaseButton, BaseCheckbox, BaseIcon } from "@/components/common";
import AuthFooter from "@/components/loginFooter/AuthFooter";
import type { LoginViewProps } from "@/types/pages/login";
import styles from "./LoginView.module.scss";
import clifyLogo from "../../assets/images/clify_logo.svg";

const LoginView = ({
  email,
  password,
  saveId,
  fieldErrors,
  onEmailChange,
  onPasswordChange,
  onEmailBlur,
  onPasswordBlur,
  onSaveIdChange,
  onSubmit,
  onForgotPasswordClick,
}: LoginViewProps) => {
  const { t } = useTranslation("pages/login");
  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.loginSection}>
          <div className={styles.logoWrapper}>
            <img src={clifyLogo} alt="Clify Logo" />
          </div>

          <form onSubmit={onSubmit} className={styles.formWrapper} noValidate>
            <div className={styles.inputsWrapper}>
              {fieldErrors.api && (
                <div className={styles.apiError}>
                  <BaseIcon name="alert" size={16} color="currentColor" />
                  <span>{fieldErrors.api}</span>
                </div>
              )}

              <BaseInput
                type="email"
                value={email}
                onChange={onEmailChange}
                onBlur={onEmailBlur}
                placeholder={t("placeholder.email")}
                autoComplete="email"
                error={fieldErrors.email}
              />

              <BaseInput
                type="password"
                value={password}
                onChange={onPasswordChange}
                onBlur={onPasswordBlur}
                placeholder={t("placeholder.password")}
                autoComplete="current-password"
                error={fieldErrors.password}
              />

              <BaseCheckbox
                id="saveId"
                label={t("label.saveId")}
                checked={saveId}
                onChange={(event) => onSaveIdChange(event.target.checked)}
                size={18}
              />
            </div>

            <div className={styles.buttonWrapper}>
              <BaseButton
                type="submit"
                variant="primary"
                size="large"
                hoverBackgroundColor="#52976D"
              >
                {t("button.login")}
              </BaseButton>
            </div>

            <div className={styles.forgotPassword}>
              <button
                type="button"
                onClick={onForgotPasswordClick}
                className={styles.forgotPasswordLink}
              >
                {t("button.forgotPassword")}
              </button>
            </div>
          </form>
        </div>

        <AuthFooter />
      </div>
    </div>
  );
};

export default LoginView;
