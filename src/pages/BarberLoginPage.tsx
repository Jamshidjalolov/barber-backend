import { useState } from "react";
import { RoleLoginPage } from "../components/auth/RoleLoginPage";

interface BarberLoginPageProps {
  onBack: () => void;
  onOpenRegister: () => void;
  onLogin: (username: string, password: string) => Promise<void>;
}

export function BarberLoginPage({
  onBack,
  onOpenRegister,
  onLogin,
}: BarberLoginPageProps) {
  const [values, setValues] = useState({
    username: "jamshid",
    password: "cut123",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  return (
    <RoleLoginPage
      eyebrow="Barber kirishi"
      title="Kunlik ish oqimini boshqarish"
      description="Barber panelida so'rovlarni qabul qilasiz, rad etasiz, sabab yozasiz va xizmat jarayonini realtime ko'rinishda yuritasiz."
      contentTitle="Barber sifatida kiring"
      contentDescription="Username va parol orqali kirib, o'zingizga biriktirilgan navbatlarni boshqara olasiz."
      submitLabel="Barber paneliga kirish"
      highlights={[
        {
          title: "Qabul qilish va rad etish",
          description: "Har bir so'rov bo'yicha aniq action bor, rad etishda sabab yoziladi.",
        },
        {
          title: "Jonli jadval",
          description: "Kutilayotgan, qabul qilingan va tugagan navbatlar bitta joyda turadi.",
        },
        {
          title: "Telegram-ready oqim",
          description: "Backend orqali qabul va rad holatlari keyin botga ham yuboriladi.",
        },
      ]}
      demoHints={["Demo: jamshid / cut123", "Yana: diyor / fade456", "Yana: kamol / style789"]}
      values={values}
      fields={[
        {
          key: "username",
          label: "Username",
          placeholder: "Masalan, jamshid",
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
      secondaryActionLabel="Barber sifatida ro'yxatdan o'tish"
      onSecondaryAction={onOpenRegister}
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
