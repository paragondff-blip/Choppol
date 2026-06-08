import { Link } from 'react-router-dom';

export default function Returns() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">Return & Refund Policy</h1>
      
      <div className="prose prose-lg max-w-none text-gray-600 space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">7-Day Return Policy</h2>
          <p>
            At CHOPPOL, we want you to be completely satisfied with your purchase. If for any reason you are not happy with your shoes, you can return them within 7 days of receiving your order for a refund or exchange.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Conditions for Returns</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Shoes must be unworn, undamaged, and strictly in the condition you received them.</li>
            <li>All original tags, packaging, and shoeboxes must be intact and included.</li>
            <li>Do not use the shoebox itself as a shipping carton. Please wrap it before returning.</li>
            <li>Sale or clearance items might have different return policies (noted on the product page).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Refund Process</h2>
          <p>
            Once we receive your returned item and verify its condition, we will process your refund within 3-5 business days. 
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>For mobile banking (bKash/Nagad) payments, refunds are sent to the same account.</li>
            <li>For Cash on Delivery orders, you must provide your mobile banking number during the return request.</li>
            <li>Shipping charges are non-refundable unless we made a mistake with your order.</li>
          </ul>
        </section>

        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Need to initiate a return?</h3>
          <p className="mb-4">Please contact our support team with your Order ID.</p>
          <Link to="/contact" className="inline-flex px-6 py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
