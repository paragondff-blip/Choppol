import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { db, auth } from '../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { LogOut, Tag, User, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        }

        const vouchersRef = collection(db, 'vouchers');
        const q = query(vouchersRef, where('ownerId', '==', user.uid));
        const vSnap = await getDocs(q);
        const vData = vSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setVouchers(vData);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  if (loading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="font-bold text-gray-900">{userData?.displayName || user?.email}</h3>
            <p className="text-sm text-gray-500 truncate">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        <div className="flex-1 space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-black" /> Your Vouchers & Referral
            </h3>
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <p className="text-sm text-gray-600 mb-2">Share your referral code with friends and both get discounts!</p>
              <div className="flex items-center gap-4">
                <code className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-bold text-black text-lg">
                  {userData?.referralCode || 'N/A'}
                </code>
                <button className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800">
                  Copy Code
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {vouchers.length === 0 ? (
                <p className="text-sm text-gray-500 col-span-2">No active vouchers right now.</p>
              ) : (
                vouchers.map(v => (
                  <div key={v.id} className={`p-4 rounded-xl border ${v.isUsed ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-green-50 border-green-200'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{v.discountPercentage}% OFF</h4>
                        <p className="text-sm text-gray-500 font-mono mt-1">{v.code}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${v.isUsed ? 'bg-gray-200 text-gray-600' : 'bg-green-200 text-green-800'}`}>
                        {v.isUsed ? 'USED' : 'ACTIVE'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-black" /> Order History
            </h3>
            <p className="text-sm text-gray-500 pb-4">You have no recent orders.</p>
            {/* Real app would map over actual orders */}
          </div>
        </div>
      </div>
    </div>
  );
}
