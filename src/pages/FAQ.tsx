export default function FAQ() {
  const faqs = [
    {
      q: "How long does delivery take?",
      a: "Standard delivery within Dhaka takes 1-2 business days. Outside Dhaka takes 3-5 business days. Express delivery options are available at checkout."
    },
    {
      q: "Do you offer Cash on Delivery (COD)?",
      a: "Yes, we offer Cash on Delivery all over Bangladesh. You can also pay via bKash, Nagad, or credit/debit cards."
    },
    {
      q: "How can I return an item?",
      a: "You can return items within 7 days of receiving your order. Please visit our Return & Refund portal to initiate a return request. Items must be unworn and in original packaging."
    },
    {
      q: "How do I know my shoe size?",
      a: "We use standard EU sizing. Each product page includes a size guide with foot length measurements in centimeters to help you find the perfect fit."
    },
    {
      q: "How does the referral program work?",
      a: "Share your unique referral code from your Dashboard with friends. When they sign up using your code, they get a 10% discount voucher, and you receive a 5% discount voucher!"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Frequently Asked Questions</h1>
        <p className="text-gray-600">Find answers to common questions about our products, shipping, and returns.</p>
      </div>

      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{faq.q}</h3>
            <p className="text-gray-600 leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
