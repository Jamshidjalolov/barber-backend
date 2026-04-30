import { useState } from "react";
import { RoleLoginPage } from "../components/auth/RoleLoginPage";

interface CustomerLoginPageProps {
  onBack?: () => void;
  onOpenRegister: () => void;
  onLogin: (phone: string, password: string) => Promise<void>;
}

export function CustomerLoginPage({
  onBack,
  onOpenRegister,
  onLogin,
}: CustomerLoginPageProps) {
  const [values, setValues] = useState({
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  return (
    <RoleLoginPage
      eyebrow="Kirish"
      title="Kirish"
      description="Telefon raqam va parol orqali kiring."
      contentTitle=""
      contentDescription=""
      submitLabel="Kirish"
      highlights={[]}
      demoHints={[]}
      values={values}
      fields={[
        {
          key: "phone",
          label: "Telefon raqam",
          placeholder: "Telefon raqam",
          autoComplete: "tel",
        },
        {
          key: "password",
          label: "Parol",
          placeholder: "Parolni kiriting",
          type: "password",
          autoComplete: "current-password",
        },
      ]}
      error={error}
      isSubmitting={submitting}
      secondaryActionLabel="Ro'yxatdan o'tish"
      onSecondaryAction={onOpenRegister}
      onBack={onBack}
      onChange={(field, value) => {
        setError("");
        setValues((current) => ({ ...current, [field]: value }));
      }}
      onSubmit={async () => {
        try {
          setSubmitting(true);
          await onLogin(values.phone, values.password);
        } catch (nextError) {
          setError(nextError instanceof Error ? nextError.message : "Kirishda xato yuz berdi.");
        } finally {
          setSubmitting(false);
        }
      }}
    />
  );
}
