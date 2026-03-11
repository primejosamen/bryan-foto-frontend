import ContactSection from '@/components/contact/ContactSection';
import { getContact } from '@/lib/api';

export default async function ContactoPage() {
  const contacto = await getContact();

  return <ContactSection contacto={contacto} />;
}

export const metadata = {
  title: 'Contact | Bryan Photography',
  description: 'Ponte en contacto con Bryan Photography',
};

export const revalidate = 60;