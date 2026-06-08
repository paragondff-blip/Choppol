import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import DynamicPage from './pages/DynamicPage';

import AboutUs from './pages/AboutUs';
import Blog from './pages/Blog';
import TrackOrder from './pages/TrackOrder';
import Wishlist from './pages/Wishlist';
import Shipping from './pages/Shipping';
import Returns from './pages/Returns';
import FAQ from './pages/FAQ';
import ContactUs from './pages/ContactUs';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="product/:id" element={<ProductDetails />} />
          <Route path="cart" element={<Cart />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="admin" element={<AdminDashboard />} />
          
          {/* Information Links */}
          <Route path="about" element={<AboutUs />} />
          <Route path="blog" element={<Blog />} />
          <Route path="track-order" element={<TrackOrder />} />
          <Route path="shipping" element={<Shipping />} />
          <Route path="returns" element={<Returns />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="contact" element={<ContactUs />} />
          <Route path="p/:slug" element={<DynamicPage />} />
          
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </Router>
  );
}
