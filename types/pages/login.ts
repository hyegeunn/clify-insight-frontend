import type { ChangeEvent, FormEvent } from "react";

export type LoginFieldName = "email" | "password";

export type LoginFieldErrors = Record<LoginFieldName | "api", string>;

export type LoginErrorKey = keyof LoginFieldErrors;

export type LoginCredentials = {
  email: string;
  password: string;
  saveId: boolean;
  autoLogin: boolean;
};

export type LoginViewHandlers = {
  onEmailChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onEmailBlur: () => void;
  onPasswordBlur: () => void;
  onSaveIdChange: (checked: boolean) => void;
  onAutoLoginChange: (checked: boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onForgotPasswordClick: () => void;
};

export type LoginViewProps = LoginCredentials &
  LoginViewHandlers & {
    fieldErrors: LoginFieldErrors;
  };
