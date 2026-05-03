import { useState } from "react";
import { RoleLoginPage } from "../components/auth/RoleLoginPage";
import { BarberFormPayload } from "../types";

interface BarberRegisterPageProps {
  onBack: () => void;
  onOpenLogin: () => void;
  onRegister: (payload: BarberFormPayload) => Promise<void>;
}

export function BarberRegisterPage({
  onBack,
  onOpenLogin,
  onRegister,
}: BarberRegisterPageProps) {
  const [values, setValues] = useState({
    fullName: "",
    specialty: "",
    yearsExp: "1",
    username: "",
    password: "",
    bio: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  return (
    <RoleLoginPage
      eyebrow="Barber ro'yxati"
      title="Yangi barber hisobini ochish"
      description="Barber ro'yxatdan o'tgach o'z navbatlarini qabul qilish va boshqarish paneliga kiradi."
      contentTitle="Barber sifatida ro'yxatdan o'ting"
      contentDescription="Asosiy ma'lumotlarni kiriting. Hisob ochilgach barber panel darhol ishlaydi."
      submitLabel="Barber hisobini yaratish"
      highlights={[
        {
          title: "Darhol ishga tayyor",
          description: "Profil yaratilgach login qilmasdan barber panel ochiladi.",
        },
        {
          title: "Bronlarni qabul qiladi",
          description: "Yangi so'rovlar barber panelga realtime ko'rinishda tushadi.",
        },
        {
          title: "Admin bilan bir xil baza",
          description: "Qo'shilgan barber darhol admin paneldagi ro'yxatda ham paydo bo'ladi.",
        },
      ]}
      demoHints={["Username noyob bo'lishi kerak", "Parol kamida 4 ta belgi bo'lsin"]}
      values={values}
      fields={[
        {
          key: "fullName",
          label: "To'liq ism",
          placeholder: "Masalan, Jamshid Sobirov",
          autoComplete: "name",
        },
        {
          key: "specialty",
          label: "Mutaxassisligi",
          placeholder: "Fade va line-up",
        },
        {
          key: "yearsExp",
          label: "Tajriba yili",
          placeholder: "1",
        },
        {
          key: "username",
          label: "Username",
          placeholder: "jamshid",
          autoComplete: "username",
        },
        {
          key: "password",
          label: "Parol",
          placeholder: "Parol yarating",
          type: "password",
          autoComplete: "new-password",
        },
        {
          key: "bio",
          label: "Qisqa bio",
          placeholder: "Barber haqida qisqacha",
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
          await onRegister({
            fullName: values.fullName,
            specialty: values.specialty,
            photoUrl: "",
            rating: 4.8,
            yearsExp: Number(values.yearsExp) || 0,
            username: values.username,
            password: values.password,
            bio: values.bio,
          });
        } catch (nextError) {
          setError(nextError instanceof Error ? nextError.message : "Ro'yxatdan o'tishda xato yuz berdi.");
        } finally {
          setSubmitting(false);
        }
      }}
    />
  );
}
