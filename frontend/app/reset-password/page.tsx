import type { Metadata } from "next"
import ResetPasswordClient from "./reset-password-client"

export const metadata: Metadata = {
  title: "Reset Password • Apra Nova",
  description: "Reset your Apra Nova account password",
}

export default function ResetPasswordPage() {
  return <ResetPasswordClient />
}
