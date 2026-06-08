export default function Blog() {
  const posts = [
    {
      id: 1,
      title: "The Anatomy of a Perfect Sneaker",
      excerpt: "Discover what makes a premium sneaker truly comfortable, from the outsole grip to the breathability of the upper mesh.",
      date: "October 12, 2023",
      image: "https://images.unsplash.com/photo-1552346154-21d32810baa3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      category: "Style Guide"
    },
    {
      id: 2,
      title: "How to Care for Full-Grain Leather Shoes",
      excerpt: "Protecting your investment is key. Learn the 5 essential steps to keep your formal leather shoes looking brand new for years.",
      date: "November 05, 2023",
      image: "https://images.unsplash.com/photo-1614252209825-9ec74ca4ac5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      category: "Maintenance"
    },
    {
      id: 3,
      title: "Top 5 Winter Footwear Trends for 2024",
      excerpt: "Stay warm without sacrificing style. Here are the top trends dominating the streets this winter season.",
      date: "December 18, 2023",
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      category: "Fashion"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">CHOPPOL Journal</h1>
        <p className="text-lg text-gray-600">Style guides, maintenance tips, and the latest news in footwear fashion.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map(post => (
          <article key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
            <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
              <img src={post.image} alt={post.title} className="w-full h-full object-cover hover:scale-105 transition duration-500" />
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-3 text-sm">
                <span className="font-bold text-black uppercase tracking-wider">{post.category}</span>
                <span className="text-gray-500">{post.date}</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h2>
              <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
              <button className="text-black font-bold hover:underline">Read Article &rarr;</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
