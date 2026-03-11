// src/app/contacto/page.tsx
import ContactSection from '@/components/contact/ContactSection';
import { getContact } from '@/lib/api';

export default async function ContactoPage() {
  const contacto = await getContact();

  return (
    <div className="pt-24">
      <ContactSection contacto={contacto} />
    </div>
  );
}

export const metadata = {
  title: 'ContactInfo | Bryan Photography',
  description: 'Ponte en contacto con Bryan Photography',
};

export const revalidate = 60;
