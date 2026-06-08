import { useState, FormEvent } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { AlertCircle, ShieldAlert } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (isAdminMode) {
      const isNahid = email.toLowerCase() === 'nahid';
      if (isNahid && password === '123456') {
        const loginEmail = 'nahid.mfal.mis@gmail.com';
        try {
          await signInWithEmailAndPassword(auth, loginEmail, password);
          setTimeout(() => navigate('/admin'), 1000); 
        } catch (err: any) {
           if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
             try {
               await createUserWithEmailAndPassword(auth, loginEmail, password);
               setTimeout(() => navigate('/admin'), 1000);
             } catch (createErr: any) {
               const isOpNotAllowed = createErr?.code === 'auth/operation-not-allowed' || 
                                      createErr?.code === 'operation-not-allowed' || 
                                      createErr?.message?.includes('operation-not-allowed') || 
                                      createErr?.toString()?.includes('operation-not-allowed');
               if (isOpNotAllowed) {
                 setError('Firebase Email/Password details are disabled in Firebase Console. Logging in via Demo Mode...');
                 useAuthStore.getState().setAdmin(true);
                 useAuthStore.getState().setUser({ uid: 'admin_mock', email: loginEmail, role: 'admin' });
                 setTimeout(() => navigate('/admin'), 2000);
               } else {
                 setError('Failed to initialize admin account. ' + createErr.message);
               }
             }
           } else if (err.code === 'auth/operation-not-allowed' || err.message?.includes('operation-not-allowed') || err?.toString()?.includes('operation-not-allowed')) {
               setError('Firebase Email/Password is disabled. Please enable it in Firebase Console. Logging in via Demo Mode...');
               useAuthStore.getState().setAdmin(true);
               useAuthStore.getState().setUser({ uid: 'admin_mock', email: loginEmail, role: 'admin' });
               setTimeout(() => navigate('/admin'), 2500);
           } else {
             setError(err.message || 'Failed to login');
           }
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setError('Invalid Admin Credentials');
      }
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setTimeout(() => navigate('/dashboard'), 1000); 
    } catch (err: any) {
      const isOpNotAllowed = err?.code === 'auth/operation-not-allowed' || 
                             err?.code === 'operation-not-allowed' || 
                             err?.message?.includes('operation-not-allowed') || 
                             err?.toString()?.includes('operation-not-allowed');
      if (isOpNotAllowed) {
        setError('Firebase Email/Password details are disabled in Firebase Console. Logging in via Demo Customer Mode...');
        useAuthStore.getState().setAdmin(false);
        const displayNameString = email ? email.split('@')[0] : 'Customer';
        useAuthStore.getState().setUser({ uid: 'customer_mock_' + Math.random().toString(36).substring(2, 6), email: email, displayName: displayNameString, role: 'customer' });
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        setError(err.message || 'Failed to login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to login with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button 
                onClick={() => { setIsAdminMode(false); setError(''); setEmail(''); setPassword(''); }}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${!isAdminMode ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-black'}`}
              >
                Customer
              </button>
              <button 
                onClick={() => { setIsAdminMode(true); setError(''); setEmail(''); setPassword(''); }}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${isAdminMode ? 'bg-black text-white shadow' : 'text-gray-500 hover:text-black'}`}
              >
                Admin
              </button>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">{isAdminMode ? 'Admin Portal' : 'Welcome Back'}</h2>
          <p className="mt-2 text-sm text-gray-600">{isAdminMode ? 'Log in to manage your store' : 'Please sign in to your account'}</p>
        </div>
        <form className="space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="p-4 bg-red-50 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <div>
            {!isAdminMode && <label className="block text-sm font-medium text-gray-700">Email Address</label>}
            <input
              type={isAdminMode ? "text" : "email"}
              required
              className={`${!isAdminMode ? 'mt-1' : ''} block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:outline-none`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={!isAdminMode ? "you@example.com" : ""}
            />
          </div>
          <div>
            {!isAdminMode && <label className="block text-sm font-medium text-gray-700">Password</label>}
            <input
              type="password"
              required
              className={`${!isAdminMode ? 'mt-1' : ''} block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:outline-none`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={!isAdminMode ? "••••••••" : ""}
            />
          </div>
          {!isAdminMode && (
            <div className="flex items-center justify-between mt-4">
              <label className="flex items-center">
                <input type="checkbox" className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black" />
                <span className="ml-2 block text-sm text-gray-900">Remember me</span>
              </label>
              <span className="text-sm font-medium text-black cursor-pointer hover:underline">Forgot password?</span>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-black hover:bg-gray-800 disabled:opacity-50 transition"
          >
            {loading ? 'Signing in...' : (isAdminMode ? 'Login as Admin' : 'Sign In')}
          </button>
        </form>

        {!isAdminMode && (
          <>
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Sign in with Google
                </button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-black hover:underline">Sign up</Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
