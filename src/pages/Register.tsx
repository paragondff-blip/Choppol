import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
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
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

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

          // Give referrer a 5% discount voucher
          const referrerVoucherId = doc(collection(db, 'vouchers')).id;
          await setDoc(doc(db, 'vouchers', referrerVoucherId), {
            code: `REF-5-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
            discountPercentage: 5,
            ownerId: referredByUid,
            isUsed: false,
            createdAt: Date.now()
          });

          // Give new user a 10% discount voucher
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
        referralCode: newReferralCode,
        referredBy: referredByUid,
        createdAt: Date.now(),
      });

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
