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
          let role: any = 'customer';
          let permissions = undefined;
          
          if (firebaseUser.email === 'nahid.mfal.mis@gmail.com') {
            role = 'superadmin';
          }

          if (userSnap.exists()) {
            const data = userSnap.data();
            if (data.role) {
               role = data.role;
            }
            if (data.permissions) {
               permissions = data.permissions;
            }
            
            if (firebaseUser.email === 'nahid.mfal.mis@gmail.com') {
               role = 'superadmin';
               try {
                 await setDoc(userRef, { role: 'superadmin' }, { merge: true });
               } catch (e) {
                 console.warn("Could not update role in firestore.", e);
               }
            }
          } else {
            // New user registration flow
            try {
              const userData = {
                uid: firebaseUser.uid,
                userId: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || '',
                role: firebaseUser.email === 'nahid.mfal.mis@gmail.com' ? 'superadmin' : 'customer',
                createdAt: Date.now(),
              };
              await setDoc(userRef, userData);
              if (firebaseUser.email === 'nahid.mfal.mis@gmail.com') {
                 role = 'superadmin';
              }
            } catch (e) {
              console.warn("Could not create user in firestore.", e);
            }
          }

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            role,
            permissions
          });
        } catch (error) {
          console.error("Error fetching user data:", error);
          if (firebaseUser.email === 'nahid.mfal.mis@gmail.com') {
            setAdmin(true);
            setUser({ uid: firebaseUser.uid, email: firebaseUser.email, role: 'superadmin' });
          } else {
            setUser({ uid: firebaseUser.uid, email: firebaseUser.email, role: 'customer' });
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
