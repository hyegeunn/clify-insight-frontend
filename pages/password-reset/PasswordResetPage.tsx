import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import PasswordResetView from "./PasswordResetView";
import type {
  PasswordResetState,
  PasswordResetSubmitHandler,
  PasswordResetInputHandler,
} from "@/types/pages/password-reset";

const INITIAL_STATE: PasswordResetState = {
  email: "",
  password: "",
  passwordConfirm: "",
  isEmailSent: false,
};

const PasswordResetPage = () => {
  const [state, setState] = useState<PasswordResetState>(INITIAL_STATE);

  const setField = (field: keyof PasswordResetState, value: string) => {
    setState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEmailChange: PasswordResetInputHandler = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setField("email", event.target.value);
  };

  const handlePasswordChange: PasswordResetInputHandler = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setField("password", event.target.value);
  };

  const handlePasswordConfirmChange: PasswordResetInputHandler = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setField("passwordConfirm", event.target.value);
  };

  const handleSendEmail: PasswordResetSubmitHandler = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    // TODO:: API 호출
    setState((prev) => ({
      ...prev,
      isEmailSent: true,
    }));
  };

  const handleSubmit: PasswordResetSubmitHandler = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    // TODO:: API 호출
  };

  return (
    <PasswordResetView
      email={state.email}
      password={state.password}
      passwordConfirm={state.passwordConfirm}
      isEmailSent={state.isEmailSent}
      onEmailChange={handleEmailChange}
      onPasswordChange={handlePasswordChange}
      onPasswordConfirmChange={handlePasswordConfirmChange}
      onSendEmail={handleSendEmail}
      onSubmit={handleSubmit}
    />
  );
};

export default PasswordResetPage;
