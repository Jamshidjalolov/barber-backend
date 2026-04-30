import { useState } from "react";
import { RoleLoginPage } from "../components/auth/RoleLoginPage";

interface CustomerRegisterPageProps {
  onBack: () => void;
  onOpenLogin: () => void;
  onRegister: (fullName: string, phone: string, password: string) => Promise<void>;
}

export function CustomerRegisterPage({
  onBack,
  onOpenLogin,
  onRegister,
}: CustomerRegisterPageProps) {
  const [values, setValues] = useState({
    fullName: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  return (
    <RoleLoginPage
      eyebrow="Ro'yxatdan o'tish"
      title="Ro'yxatdan o'tish"
      description="Ism, telefon raqam va parolni kiriting."
      contentTitle=""
      contentDescription=""
      submitLabel="Ro'yxatdan o'tish"
      highlights={[]}
      demoHints={[]}
      values={values}
      fields={[
        {
          key: "fullName",
          label: "To'liq ism",
          placeholder: "To'liq ism",
          autoComplete: "name",
        },
        {
          key: "phone",
          label: "Telefon raqam",
          placeholder: "Telefon raqam",
          autoComplete: "tel",
        },
        {
          key: "password",
          label: "Parol",
          placeholder: "Parol yarating",
          type: "password",
          autoComplete: "new-password",
        },
      ]}
      error={error}
      isSubmitting={submitting}
      secondaryActionLabel="Hisobim bor, kiraman"
      onSecondaryAction={onOpenLogin}
      onBack={onBack}
      onChange={(field, value) => {
        setError("");
        setValues((current) => ({ ...current, [field]: value }));
      }}
      onSubmit={async () => {
        try {
          setSubmitting(true);
          await onRegister(values.fullName, values.phone, values.password);
        } catch (nextError) {
          setError(nextError instanceof Error ? nextError.message : "Ro'yxatdan o'tishda xato yuz berdi.");
        } finally {
          setSubmitting(false);
        }
      }}
    />
  );
}
