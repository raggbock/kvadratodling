import type { Metadata } from 'next';
import ForgotPasswordForm from './ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Glömt lösenord | Kvadratodling',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
