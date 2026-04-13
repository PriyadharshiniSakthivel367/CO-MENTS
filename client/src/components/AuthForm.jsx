import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function AuthForm({ mode, onSubmit, error, loading }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'register') {
      await onSubmit({ username, email, password });
    } else {
      await onSubmit({ email, password });
    }
  };

  const isRegister = mode === 'register';

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-thread-border bg-thread-card p-8 shadow-xl">
      <h1 className="text-2xl font-bold text-white">
        {isRegister ? 'Create account' : 'Welcome back'}
      </h1>
      <p className="mt-2 text-sm text-thread-muted">
        {isRegister ? 'Join the discussion.' : 'Log in to post and vote.'}
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {isRegister && (
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300">
              Username
            </label>
            <input
              id="username"
              autoComplete="username"
              className="mt-1 w-full rounded-lg border border-thread-border bg-thread-bg px-3 py-2 text-white placeholder:text-gray-500 focus:border-thread-accent focus:outline-none focus:ring-1 focus:ring-thread-accent"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={2}
            />
          </div>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="mt-1 w-full rounded-lg border border-thread-border bg-thread-bg px-3 py-2 text-white placeholder:text-gray-500 focus:border-thread-accent focus:outline-none focus:ring-1 focus:ring-thread-accent"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            className="mt-1 w-full rounded-lg border border-thread-border bg-thread-bg px-3 py-2 text-white placeholder:text-gray-500 focus:border-thread-accent focus:outline-none focus:ring-1 focus:ring-thread-accent"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        {error && (
          <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-thread-accent py-2.5 font-semibold text-white hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Please wait…' : isRegister ? 'Sign up' : 'Log in'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-thread-muted">
        {isRegister ? (
          <>
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-thread-up hover:underline">
              Log in
            </Link>
          </>
        ) : (
          <>
            New here?{' '}
            <Link to="/register" className="font-medium text-thread-up hover:underline">
              Create an account
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
