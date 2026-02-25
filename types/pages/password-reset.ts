import type { ChangeEvent, FormEvent } from "react";

export type PasswordResetMode = "request" | "confirm";

export interface PasswordResetState extends Record<string, unknown> {
  email: string;
  password: string;
  passwordConfirm: string;
  isEmailSent: boolean;
}

export type PasswordResetInputHandler = (
  event: ChangeEvent<HTMLInputElement>,
) => void;

export type PasswordResetSubmitHandler = (
  event: FormEvent<HTMLFormElement>,
) => void;

export interface PasswordResetViewProps extends Record<string, unknown> {
  email: string;
  password: string;
  passwordConfirm: string;
  isEmailSent: boolean;
  onEmailChange: PasswordResetInputHandler;
  onPasswordChange: PasswordResetInputHandler;
  onPasswordConfirmChange: PasswordResetInputHandler;
  onSendEmail: PasswordResetSubmitHandler;
  onSubmit: PasswordResetSubmitHandler;
}
