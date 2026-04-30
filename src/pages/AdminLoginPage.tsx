import { useState } from "react";
import { RoleLoginPage } from "../components/auth/RoleLoginPage";

interface AdminLoginPageProps {
  onBack: () => void;
  onLogin: (username: string, password: string) => Promise<void>;
}

export function AdminLoginPage({ onBack, onLogin }: AdminLoginPageProps) {
  const [values, setValues] = useState({
    username: "jamshidjalolov6767@gmail.com",
    password: "jamshid4884",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  return (
    <RoleLoginPage
      eyebrow="Admin kirishi"
      title="Admin kirishi"
      description="Login va parol orqali kiring."
      contentTitle=""
      contentDescription=""
      submitLabel="Kirish"
      highlights={[]}
      demoHints={[]}
      values={values}
      fields={[
        {
          key: "username",
          label: "Login",
          placeholder: "Email yoki login",
          autoComplete: "username",
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
      onBack={onBack}
      onChange={(field, value) => {
        setError("");
        setValues((current) => ({ ...current, [field]: value }));
      }}
      onSubmit={async () => {
        try {
          setSubmitting(true);
          await onLogin(values.username, values.password);
        } catch (nextError) {
          setError(nextError instanceof Error ? nextError.message : "Kirishda xato yuz berdi.");
        } finally {
          setSubmitting(false);
        }
      }}
    />
  );
}
