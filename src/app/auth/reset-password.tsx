import { Redirect } from "expo-router";
import ResetPasswordForm from "@/modules/auth/ResetPasswordForm";
import { useAuth } from "@/contexte/AuthContext";

export default function ResetPasswordScreen() {
  const { user } = useAuth();
  if (user) return <Redirect href="/tabs" />;
  return <ResetPasswordForm />;
}
