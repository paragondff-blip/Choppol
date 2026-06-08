export default function Shipping() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">Shipping Information</h1>
      
      <div className="space-y-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Delivery Rates & Times</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="py-3 px-4 font-bold text-gray-900">Location</th>
                  <th className="py-3 px-4 font-bold text-gray-900">Delivery Time</th>
                  <th className="py-3 px-4 font-bold text-gray-900">Cost</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 font-medium">Inside Dhaka</td>
                  <td className="py-4 px-4">1-2 Business Days</td>
                  <td className="py-4 px-4">৳60</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 font-medium">Dhaka Suburbs (Savar, Gazipur, etc.)</td>
                  <td className="py-4 px-4">2-3 Business Days</td>
                  <td className="py-4 px-4">৳100</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium">Outside Dhaka (All Bangladesh)</td>
                  <td className="py-4 px-4">3-5 Business Days</td>
                  <td className="py-4 px-4">৳150</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800">
            <strong>Free Shipping:</strong> Enjoy free standard shipping on all orders over ৳5000 anywhere in Bangladesh.
          </div>
        </div>

        <section className="prose prose-lg max-w-none text-gray-600">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Processing</h2>
          <p>
            Orders placed before 2:00 PM BST are generally processed and handed over to our courier partners the same day. Orders placed after 2:00 PM or on weekends/holidays will be processed on the next business day.
          </p>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Couriers We Use</h2>
          <p>
            We partner with reliable courier services including Pathao, Steadfast, and RedX to ensure quick and safe delivery of your premium footwear. You will receive tracking information via SMS and email once your order is dispatched.
          </p>
        </section>
      </div>
    </div>
  );
}
