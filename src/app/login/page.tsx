import LoginForm from '@/components/auth/LoginForm';
import { auth } from '@/lib/auth/auth-options';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const session = await auth();

  // Redirect to dashboard if already logged in
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">D&D LazyDM</h1>
          <p className="mt-2 text-sm text-gray-400">Campaign management for dungeon masters</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
