import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, isAuthenticated, ready } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (ready && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async ({ email, password }) => {
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (e) {
      setError(e.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <AuthForm mode="login" onSubmit={handleSubmit} error={error} loading={loading} />
    </div>
  );
}
