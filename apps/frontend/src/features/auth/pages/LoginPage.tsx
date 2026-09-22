import { Navigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import { useAuthStore } from '../store/auth.store';
import { ENV } from '@/lib/env';

export function LoginPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-700 mb-2">
              {ENV.APP_NAME}
            </h1>
            <p className="text-gray-600 text-sm">
              Ingresa a tu cuenta para continuar
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}