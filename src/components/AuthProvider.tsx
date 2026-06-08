import { useEffect, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function AuthProvider({ children }: { children: ReactNode }) {
  const { setUser, setAdmin, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch or create user document
        const userRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          let role = 'customer';
          if (userSnap.exists()) {
            role = userSnap.data().role;
          } else {
            // New user registration flow
            // Note: In real app, the Register form would handle this with referral logic.
            // This acts as a fallback for social logins.
            await setDoc(userRef, {
              userId: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || '',
              role: 'customer',
              createdAt: Date.now(),
            });
          }

          // Force admin role if matches criteria
          if (firebaseUser.email === 'nahid.mfal.mis@gmail.com') {
            role = 'admin';
            // update doc quietly if needed
            await setDoc(userRef, { role: 'admin' }, { merge: true });
          }

          setAdmin(role === 'admin');
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            role,
          });
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser({ uid: firebaseUser.uid, email: firebaseUser.email });
        }
      } else {
        const currentUser = useAuthStore.getState().user;
        if (currentUser?.uid !== 'admin_mock' && !currentUser?.uid?.startsWith('customer_mock_')) {
          setUser(null);
          setAdmin(false);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setAdmin, setLoading]);

  return <>{children}</>;
}
