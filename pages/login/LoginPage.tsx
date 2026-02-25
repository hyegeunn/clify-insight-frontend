import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LoginView from "./LoginView";
import type { LoginCredentials, LoginFieldErrors } from "@/types/pages/login";
import { useFormErrors } from "@/hooks";
import { login } from "@/api/endpoints/auth";
import { BaseModal, BaseButton } from "@/components/common";

const SAVED_EMAIL_KEY = "savedEmail";

const INITIAL_CREDENTIALS: LoginCredentials = {
  email: "",
  password: "",
  saveId: false,
  autoLogin: false,
};

const INITIAL_FIELD_ERRORS: LoginFieldErrors = {
  email: "",
  password: "",
  api: "",
};

const LoginPage = () => {
  const { t } = useTranslation("pages/login");
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<LoginCredentials>(() => {
    const savedEmail = localStorage.getItem(SAVED_EMAIL_KEY);
    return {
      ...INITIAL_CREDENTIALS,
      email: savedEmail || "",
      saveId: !!savedEmail,
    };
  });

  const {
    errors: fieldErrors,
    setError: setFieldError,
    clearError: clearFieldError,
  } = useFormErrors<LoginFieldErrors>(INITIAL_FIELD_ERRORS);

  const [isPasswordResetModalOpen, setIsPasswordResetModalOpen] = useState(false);

  const handleEmailBlur = () => {
    if (!credentials.email) {
      setFieldError("email", t("error.emailRequired"));
      return;
    }

    clearFieldError("email");
  };

  const handlePasswordBlur = () => {
    if (!credentials.password) {
      setFieldError("password", t("error.passwordRequired"));
      return;
    }

    clearFieldError("password");
  };

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    setCredentials((prev) => ({
      ...prev,
      email: value,
    }));
    clearFieldError("api");
    clearFieldError("email");
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    setCredentials((prev) => ({
      ...prev,
      password: value,
    }));
    clearFieldError("api");
    clearFieldError("password");
  };

  const handleSaveIdChange = (checked: boolean) => {
    setCredentials((prev) => ({
      ...prev,
      saveId: checked,
    }));
    
    if (!checked) {
      localStorage.removeItem(SAVED_EMAIL_KEY);
    }
  };

  const handleAutoLoginChange = (checked: boolean) => {
    setCredentials((prev) => ({
      ...prev,
      autoLogin: checked,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    let hasError = false;

    if (!credentials.email) {
      setFieldError("email", t("error.emailRequired"));
      hasError = true;
    } else {
      clearFieldError("email");
    }

    if (!credentials.password) {
      setFieldError("password", t("error.passwordRequired"));
      hasError = true;
    } else {
      clearFieldError("password");
    }

    if (hasError) {
      return;
    }

    clearFieldError("api");

    try {
      const response = await login({
        username: credentials.email, 
        password: credentials.password,
      });

      if (credentials.saveId && credentials.email) {
        localStorage.setItem(SAVED_EMAIL_KEY, credentials.email);
      } else if (!credentials.saveId) {
        localStorage.removeItem(SAVED_EMAIL_KEY);
      }

      if (response.success && response.data) {
        const { token, user, company } = response.data;

        localStorage.setItem("accessToken", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("company", JSON.stringify(company));

        navigate("/home", { replace: true });
      } else {
        throw new Error(response.message || t("error.loginFailed"));
      }
    } catch (error: any) {
      const errorMessage = t("error.invalidCredentials");
      setFieldError("api", errorMessage);
    }
  };

  const handleForgotPasswordClick = () => {
    setIsPasswordResetModalOpen(true);
  };

  const handleClosePasswordResetModal = () => {
    setIsPasswordResetModalOpen(false);
  };

  return (
    <>
      <LoginView
        email={credentials.email}
        password={credentials.password}
        saveId={credentials.saveId}
        autoLogin={credentials.autoLogin}
        fieldErrors={fieldErrors}
        onEmailChange={handleEmailChange}
        onPasswordChange={handlePasswordChange}
        onEmailBlur={handleEmailBlur}
        onPasswordBlur={handlePasswordBlur}
        onSaveIdChange={handleSaveIdChange}
        onAutoLoginChange={handleAutoLoginChange}
        onSubmit={handleSubmit}
        onForgotPasswordClick={handleForgotPasswordClick}
      />
      <BaseModal
        isOpen={isPasswordResetModalOpen}
        onClose={handleClosePasswordResetModal}
        title=""
        width={330}
      >
        <div style={{ padding: "24px", textAlign: "center" }}>
          <p style={{ marginBottom: "24px", fontSize: "20px", fontWeight: 600, lineHeight: "140%" }}>
            {t("error.contactAdmin")}
          </p>
          <BaseButton
            type="button"
            variant="primary"
            size="medium"
            onClick={handleClosePasswordResetModal}
            style={{ width: "100%" }}
          >
            {t("button.confirm")}
          </BaseButton>
        </div>
      </BaseModal>
    </>
  );
};

export default LoginPage;
