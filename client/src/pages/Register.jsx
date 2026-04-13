import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register, isAuthenticated, ready } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (ready && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async ({ username, email, password }) => {
    setError('');
    setLoading(true);
    try {
      await register(username, email, password);
      navigate('/', { replace: true });
    } catch (e) {
      const msg =
        e.response?.data?.errors?.[0]?.msg ||
        e.response?.data?.message ||
        'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <AuthForm mode="register" onSubmit={handleSubmit} error={error} loading={loading} />
    </div>
  );
}
