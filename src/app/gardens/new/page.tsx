import type { Metadata } from 'next';
import NewGardenForm from './NewGardenForm';

export const metadata: Metadata = { title: 'Ny odling | Kvadratodling' };

export default function NewGardenPage() {
  return <NewGardenForm />;
}
