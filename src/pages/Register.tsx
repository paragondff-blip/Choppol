import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { AlertCircle } from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let user: any = null;
      let isNewUser = false;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        user = userCredential.user;
        isNewUser = true;
      } catch (authErr: any) {
        if (authErr.code === 'auth/email-already-in-use') {
           const signinCred = await signInWithEmailAndPassword(auth, email, password);
           user = signinCred.user;
           
           const docSnap = await getDoc(doc(db, 'users', user.uid));
           if (docSnap.exists() && docSnap.data().status === 'blocked') {
             await auth.signOut();
             throw new Error('Your account is blocked. You cannot register again.');
           }
           if (docSnap.exists()) {
             throw new Error('Account already exists. Please log in.');
           }
           isNewUser = true; // They existed in Auth but not Firestore, act as new user
        } else {
           throw authErr;
        }
      }

      if (isNewUser) {
        // Generate a unique referral code for this new user
        const newReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase() + user.uid.substring(0, 3).toUpperCase();

        // Handle applied referral code if provided
        let referredByUid = null;
        if (referralCode) {
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('referralCode', '==', referralCode));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const referrerDoc = querySnapshot.docs[0];
            referredByUid = referrerDoc.id;

            const referrerVoucherId = doc(collection(db, 'vouchers')).id;
            await setDoc(doc(db, 'vouchers', referrerVoucherId), {
              code: `REF-5-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
              discountPercentage: 5,
              ownerId: referredByUid,
              isUsed: false,
              createdAt: Date.now()
            });

            const newVoucherId = doc(collection(db, 'vouchers')).id;
            await setDoc(doc(db, 'vouchers', newVoucherId), {
              code: `NEW-10-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
              discountPercentage: 10,
              ownerId: user.uid,
              isUsed: false,
              createdAt: Date.now()
            });
          }
        }

        // Create user document
        await setDoc(doc(db, 'users', user.uid), {
          userId: user.uid,
          email: user.email,
          displayName: name,
          role: 'customer',
          status: 'active',
          referralCode: newReferralCode,
          referredBy: referredByUid,
          createdAt: Date.now(),
        });
      }

      navigate('/dashboard');
    } catch (err: any) {
      const isOpNotAllowed = err?.code === 'auth/operation-not-allowed' || 
                             err?.code === 'operation-not-allowed' || 
                             err?.message?.includes('operation-not-allowed') || 
                             err?.toString()?.includes('operation-not-allowed');
      if (isOpNotAllowed) {
        setError('Firebase Email/Password registration is disabled in Firebase Console. Registering via Demo Customer Mode...');
        const mockUid = 'customer_mock_' + Math.random().toString(36).substring(2, 6);
        useAuthStore.getState().setAdmin(false);
        useAuthStore.getState().setUser({ uid: mockUid, email: email, displayName: name || email.split('@')[0], role: 'customer' });
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        setError(err.message || 'Failed to register account');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    try {
      const cred = await signInWithPopup(auth, provider);
      const user = cred.user;
      
      const userDocRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists() && docSnap.data().status === 'blocked') {
         await auth.signOut();
         throw new Error('Your account is blocked. You cannot register again.');
      }
      
      if (!docSnap.exists()) {
        const newReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase() + user.uid.substring(0, 3).toUpperCase();
        await setDoc(userDocRef, {
          userId: user.uid,
          email: user.email,
          displayName: user.displayName || name || 'Customer',
          role: 'customer',
          status: 'active',
          referralCode: newReferralCode,
          referredBy: null,
          createdAt: Date.now(),
        });
      }

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to register with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Create an Account</h2>
          <p className="mt-2 text-sm text-gray-600">Join CHOPPOL for premium footwear</p>
        </div>
        <form className="space-y-5" onSubmit={handleRegister}>
          {error && (
            <div className="p-4 bg-red-50 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              required
              className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              required
              className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Referral Code (Optional)</label>
            <input
              type="text"
              className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:outline-none placeholder-gray-400"
              placeholder="Enter to get 10% off"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-black hover:bg-gray-800 disabled:opacity-50 transition"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

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
              onClick={handleGoogleRegister}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Sign up with Google
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-black hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
