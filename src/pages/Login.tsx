import { useState, FormEvent, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { AlertCircle, ShieldAlert, CheckCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    const isNahid = email.toLowerCase() === 'nahid' || email.toLowerCase() === 'nahid.mfal.mis@gmail.com';
    const loginEmail = isNahid ? 'nahid.mfal.mis@gmail.com' : email;

    try {
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      await signInWithEmailAndPassword(auth, loginEmail, password);
      useAuthStore.getState().setAdmin(true);
      setTimeout(() => navigate('/admin'), 1000); 
    } catch (err: any) {
       if (isNahid && password === '123456') {
         try {
           await createUserWithEmailAndPassword(auth, loginEmail, password);
           useAuthStore.getState().setAdmin(true);
           setTimeout(() => navigate('/admin'), 1000);
         } catch (createErr: any) {
             setError('Failed to log in or create admin account. ' + createErr.message);
         }
       } else {
         setError(err.message || 'Failed to login. Please check your credentials.');
       }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first to reset your password.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const loginEmail = email.toLowerCase() === 'nahid' ? 'nahid.mfal.mis@gmail.com' : email;
      await sendPasswordResetEmail(auth, loginEmail);
      setMessage('A password reset link has been sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-4">
             <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Admin Login</h2>
          <p className="mt-2 text-sm text-gray-600">Access the store management dashboard</p>
        </div>
        <form className="space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="p-4 bg-red-50 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          {message && (
            <div className="p-4 bg-green-50 rounded-xl flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-sm text-green-700">{message}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Admin ID</label>
            <input
              type="text"
              required
              className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. nahid"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="flex items-center justify-between mt-4">
            <label className="flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black" 
              />
              <span className="ml-2 block text-sm text-gray-900">Remember me</span>
            </label>
            <button 
              type="button" 
              onClick={handleForgotPassword}
              disabled={loading}
              className="text-sm font-medium text-black cursor-pointer hover:underline bg-transparent border-none p-0 disabled:opacity-50"
            >
              Forgot password?
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-black hover:bg-gray-800 disabled:opacity-50 transition"
          >
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
