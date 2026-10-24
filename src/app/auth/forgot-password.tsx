import { Redirect } from "expo-router";
import ForgotPasswordForm from "@/modules/auth/ForgotPasswordForm";
import { useAuth } from "@/contexte/AuthContext";

export default function ForgotPasswordScreen() {
  const { user } = useAuth();
  if (user) return <Redirect href="/tabs" />;
  return <ForgotPasswordForm />;
}
