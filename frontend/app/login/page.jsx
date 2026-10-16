import Link from 'next/link';
import AuthShell from '@/components/auth/AuthShell';
import MagicForm from '@/components/auth/MagicForm';

export const metadata = { title: 'Log in' };

export default async function Login({ searchParams }) {
  const sp = await searchParams;
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in with a magic link, a passkey or Google. No password to remember."
      footer={<>New to SwapS.ng? <Link href="/register">Create an account</Link></>}
    >
      <MagicForm mode="login" reason={sp?.error || ''} />
    </AuthShell>
  );
}
