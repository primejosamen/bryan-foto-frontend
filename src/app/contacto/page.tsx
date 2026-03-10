// src/app/contacto/page.tsx
import ContactSection from '@/components/ContactSection';
import { getContacto } from '@/lib/strapi';

export default async function ContactoPage() {
  const contacto = await getContacto();

  return (
    <div className="pt-24">
      <ContactSection contacto={contacto} />
    </div>
  );
}

export const metadata = {
  title: 'Contacto | Bryan Photography',
  description: 'Ponte en contacto con Bryan Photography',
};

export const revalidate = 60;
