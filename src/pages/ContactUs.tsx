import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function ContactUs() {
  const handleMessage = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thank you for your message! Our team will get back to you shortly.");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Contact Us</h1>
        <p className="text-lg text-gray-600">We'd love to hear from you. Please choose the way you'd like to get in touch.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Send us a Message</h2>
          <form onSubmit={handleMessage} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input required type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-black focus:border-black" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input required type="email" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-black focus:border-black" placeholder="john@example.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input required type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-black focus:border-black" placeholder="How can we help?" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea required rows={5} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-black focus:border-black" placeholder="Write your message here..."></textarea>
            </div>
            <button type="submit" className="px-8 py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition w-full md:w-auto">
              Send Message
            </button>
          </form>
        </div>

        <div className="bg-gray-50 p-8 rounded-3xl border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Contact Information</h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-white p-3 rounded-full shadow-sm">
                <MapPin className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Store Address</h3>
                <p className="text-gray-600 mt-1">Level 4, Block B, Bashundhara City Shopping Mall, Panthapath, Dhaka 1215</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-white p-3 rounded-full shadow-sm">
                <Phone className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Phone Number</h3>
                <p className="text-gray-600 mt-1">+880 1711-223344</p>
                <p className="text-gray-600">+880 1922-334455</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-white p-3 rounded-full shadow-sm">
                <Mail className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Email Address</h3>
                <p className="text-gray-600 mt-1">support@choppol.com</p>
                <p className="text-gray-600">wholesale@choppol.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-white p-3 rounded-full shadow-sm">
                <Clock className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Operating Hours</h3>
                <p className="text-gray-600 mt-1">Saturday - Thursday: 10:00 AM - 9:00 PM</p>
                <p className="text-gray-600">Friday: 2:00 PM - 9:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
