import RegisterForm from '@/components/auth/RegisterForm';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);

  // Redirect to dashboard if already logged in
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">D&D LazyDM</h1>
          <p className="mt-2 text-sm text-gray-600">Create your account to get started</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
