import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';

export function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await signup(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-white/80 bg-white/85 p-7 shadow-xl shadow-slate-900/10 backdrop-blur">
      <h1 className="text-2xl font-black tracking-tight">Signup</h1>
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" />
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" />
        <button disabled={isSubmitting} className="w-full rounded-lg bg-pink-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-pink-700/20 hover:bg-pink-700 disabled:opacity-60">
          {isSubmitting ? 'Creating account...' : 'Signup'}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-pink-800">
          Login
        </Link>
      </p>
    </div>
  );
}
