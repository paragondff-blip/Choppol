import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function Footer() {
  const [data, setData] = useState({
    storeName: 'CHOPPOL',
    aboutText: 'Premium footwear destination offering the latest in sneakers, formal shoes, and comfortable everyday wear.',
    contact: {
      address: 'Level 4, Block B, Bashundhara City Shopping Mall, Panthapath, Dhaka 1215',
      phone: '+880 1711-223344',
      email: 'support@choppol.com'
    },
    quickLinks: [
      { label: 'Shop All', url: '/shop' },
      { label: 'About Us', url: '/p/about' },
      { label: 'Contact Us', url: '/contact' },
      { label: 'Blog', url: '/blog' }
    ],
    customerService: [
      { label: 'Track Order', url: '/track-order' },
      { label: 'Shipping Info', url: '/p/shipping' },
      { label: 'Returns & Refunds', url: '/p/returns' },
      { label: 'FAQ', url: '/p/faq' }
    ]
  });

  useEffect(() => {
    const fetchFooter = async () => {
      try {
        const docRef = doc(db, 'settings', 'footer');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setData(docSnap.data() as any);
        }
      } catch (err) {
        console.error("Footer fetch error:", err);
      }
    };
    fetchFooter();
  }, []);

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold tracking-tighter text-white">{data.storeName}</h3>
            <p className="text-sm">
              {data.aboutText}
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {data.quickLinks.map((link, idx) => (
                <li key={idx}><Link to={link.url} className="hover:text-white transition-colors">{link.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              {data.customerService.map((link, idx) => (
                <li key={idx}><Link to={link.url} className="hover:text-white transition-colors">{link.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Info</h4>
            <p className="text-sm">
              <span className="block font-medium text-white mb-1">Store Address:</span>
              {data.contact.address}
            </p>
            <p className="text-sm mt-3">
              <span className="block font-medium text-white mb-1">Phone:</span>
              {data.contact.phone}
            </p>
            <p className="text-sm mt-3">
              <span className="block font-medium text-white mb-1">Email:</span>
              {data.contact.email}
            </p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm">&copy; {new Date().getFullYear()} {data.storeName}. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0 text-sm">
            <Link to="/p/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/p/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
