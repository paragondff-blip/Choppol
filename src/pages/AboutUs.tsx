import { Link } from 'react-router-dom';

export default function AboutUs() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">About CHOPPOL</h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          Welcome to CHOPPOL, your number one source for all things footwear. We're dedicated to providing you the very best of shoes, with an emphasis on premium quality, modern aesthetics, and unparalleled comfort.
        </p>
        <img 
          src="https://images.unsplash.com/photo-1556906781-9a412961c28c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
          alt="About Us"
          className="rounded-2xl shadow-xl w-full object-cover h-[400px]"
        />
        <div className="text-left space-y-6 pt-8">
          <h2 className="text-2xl font-bold text-gray-900">Our Story</h2>
          <p className="text-gray-600 leading-relaxed">
            Founded in Dhaka, Bangladesh, CHOPPOL has come a long way from its beginnings. When we first started out, our passion for "Walk Your Style" drove us to start our own premium brand.
            We now serve customers all over Bangladesh, and are thrilled that we're able to turn our passion into a leading footwear e-commerce platform.
          </p>
          <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed">
            Our mission is simple: To empower your journey with every step. Whether you are running a marathon, attending a formal meeting, or enjoying a casual evening, CHOPPOL ensures you do it in style and comfort.
          </p>
        </div>
        <div className="pt-8">
          <Link to="/shop" className="inline-flex items-center px-8 py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition">
            Explore Our Collection
          </Link>
        </div>
      </div>
    </div>
  );
}
