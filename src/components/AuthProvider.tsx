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
          
          if (firebaseUser.email === 'nahid.mfal.mis@gmail.com') {
            role = 'admin';
          }

          if (userSnap.exists()) {
            if (userSnap.data().role) {
               role = userSnap.data().role;
            }
            if (firebaseUser.email === 'nahid.mfal.mis@gmail.com') {
               role = 'admin';
               try {
                 await setDoc(userRef, { role: 'admin' }, { merge: true });
               } catch (e) {
                 console.warn("Could not update role in firestore, proceeding with local admin setup.", e);
               }
            }
          } else {
            // New user registration flow
            try {
              await setDoc(userRef, {
                userId: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || '',
                role: firebaseUser.email === 'nahid.mfal.mis@gmail.com' ? 'customer' : 'customer', // Rule only allows creating 'customer' initially
                createdAt: Date.now(),
              });
              if (firebaseUser.email === 'nahid.mfal.mis@gmail.com') {
                 // The rule might prevent us from updating to admin immediately without Firebase custom claims, but we store it locally.
                 role = 'admin';
              }
            } catch (e) {
              console.warn("Could not create user in firestore.", e);
            }
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
          if (firebaseUser.email === 'nahid.mfal.mis@gmail.com') {
            setAdmin(true);
            setUser({ uid: firebaseUser.uid, email: firebaseUser.email, role: 'admin' });
          } else {
            setUser({ uid: firebaseUser.uid, email: firebaseUser.email });
          }
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
