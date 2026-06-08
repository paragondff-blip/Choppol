import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold tracking-tighter text-white">CHOPPOL</h3>
            <p className="text-sm">
              Premium footwear destination offering the latest in sneakers, formal shoes, and comfortable everyday wear.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/shop" className="hover:text-white transition-colors">Shop All</Link></li>
              <li><Link to="/p/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/track-order" className="hover:text-white transition-colors">Track Order</Link></li>
              <li><Link to="/p/shipping" className="hover:text-white transition-colors">Shipping Info</Link></li>
              <li><Link to="/p/returns" className="hover:text-white transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/p/faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Info</h4>
            <p className="text-sm">
              <span className="block font-medium text-white mb-1">Store Address:</span>
              Level 4, Block B, Bashundhara City Shopping Mall, Panthapath, Dhaka 1215
            </p>
            <p className="text-sm mt-3">
              <span className="block font-medium text-white mb-1">Phone:</span>
              +880 1711-223344
            </p>
            <p className="text-sm mt-3">
              <span className="block font-medium text-white mb-1">Email:</span>
              support@choppol.com
            </p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm">&copy; {new Date().getFullYear()} CHOPPOL. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0 text-sm">
            <Link to="/p/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/p/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
