import { useState } from 'react';
import api from "../lib/api/client";
import { useRouter } from 'next/router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [org, setOrg] = useState('default-org');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.post(
        '/auth/token',
        new URLSearchParams({ username: email, password }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      const token = res.data?.access_token;
      if (!token) throw new Error('Token missing');
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', token);
        localStorage.setItem('org_slug', org || 'default-org');
      }
      router.push('/');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-80">
        <h1 className="text-xl mb-4">Login</h1>
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 mb-2 w-full"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 mb-4 w-full"
        />
        <input
          type="text"
          placeholder="Organization Slug"
          value={org}
          onChange={(e) => setOrg(e.target.value)}
          className="border p-2 mb-4 w-full"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">Login</button>
      </form>
    </div>
  );
}
