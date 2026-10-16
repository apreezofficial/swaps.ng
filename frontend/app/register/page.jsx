import Link from 'next/link';
import AuthShell from '@/components/auth/AuthShell';
import MagicForm from '@/components/auth/MagicForm';

export const metadata = { title: 'Create account' };

export default async function Register({ searchParams }) {
  const sp = await searchParams;
  return (
    <AuthShell
      title="Create your account"
      subtitle="Just your name and email. We send a secure link, so there is no password to create."
      footer={<>Already have an account? <Link href="/login">Log in</Link></>}
    >
      <MagicForm mode="register" initialEmail={sp?.email || ''} />
    </AuthShell>
  );
}
