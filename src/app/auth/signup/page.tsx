import type { Metadata } from 'next';
import SignUpForm from './SignUpForm';

export const metadata: Metadata = { title: 'Skapa konto | Kvadratodling' };

export default function SignUpPage() {
  return <SignUpForm />;
}
