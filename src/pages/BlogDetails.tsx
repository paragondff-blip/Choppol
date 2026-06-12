import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User } from 'lucide-react';

export default function BlogDetails() {
  const { id } = useParams<{ id: string }>();

  // Use the same mock data for now
  const posts = [
    {
      id: 1,
      title: "The Anatomy of a Perfect Sneaker",
      excerpt: "Discover what makes a premium sneaker truly comfortable, from the outsole grip to the breathability of the upper mesh.",
      content: "Sneakers have evolved from simple athletic wear to complex pieces of fashion and engineering. The perfect sneaker requires a delicate balance of form and function. \n\nFirstly, consider the outsole. It must provide enough grip for daily use while remaining flexible. A high-quality rubber compound is usually the best choice. Next is the midsole, where cushioning technology like EVA foam or proprietary air/gel systems make a huge difference in comfort.\n\nThe upper material is equally important. Premium leathers offer durability and a sleek look, while modern mesh materials provide unparalleled breathability. A perfect sneaker combines these elements seamlessly.",
      date: "October 12, 2023",
      author: "Jane Doe",
      image: "https://images.unsplash.com/photo-1552346154-21d32810baa3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      category: "Style Guide"
    },
    {
      id: 2,
      title: "How to Care for Full-Grain Leather Shoes",
      excerpt: "Protecting your investment is key. Learn the 5 essential steps to keep your formal leather shoes looking brand new for years.",
      content: "Full-grain leather is the highest quality leather you can buy, and taking care of it ensures your shoes will last for decades.\n\n1. Use shoe trees: Always insert cedar shoe trees when you're not wearing them to maintain their shape and absorb moisture.\n2. Clean regularly: Use a horsehair brush to remove dirt after every wear.\n3. Condition: Leather skin needs to be moisturized. Use a quality leather conditioner every few months.\n4. Polish: Use a cream polish to restore color and a wax polish for a protective shine.\n5. Let them rest: Never wear the same pair of leather shoes two days in a row.",
      date: "November 05, 2023",
      author: "John Smith",
      image: "https://images.unsplash.com/photo-1614252209825-9ec74ca4ac5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      category: "Maintenance"
    },
    {
      id: 3,
      title: "Top 5 Winter Footwear Trends for 2024",
      excerpt: "Stay warm without sacrificing style. Here are the top trends dominating the streets this winter season.",
      content: "Winter 2024 is all about combining rugged utility with refined aesthetics. Here are the top 5 trends we're seeing:\n\n1. The Modern Chelsea Boot: Thicker soles and weather-resistant suede are making Chelsea boots more versatile than ever.\n2. Hiking-Inspired Sneakerboots: Mixing sneaker comfort with boot durability and D-ring lacing systems.\n3. Shearling Details: Internal and external shearling accents provide warmth and texture.\n4. Earth Tones: Deep greens, rich browns, and warm terracottas are replacing basic black.\n5. Tech-Fabric Uppers: GORE-TEX and other waterproof materials are becoming standard on everyday footwear.",
      date: "December 18, 2023",
      author: "Alex Johnson",
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      category: "Fashion"
    }
  ];

  const post = posts.find(p => p.id.toString() === id);

  if (!post) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Article Not Found</h1>
        <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist or has been removed.</p>
        <Link to="/blog" className="inline-flex items-center text-black font-bold hover:underline">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-8">
        <Link to="/blog" className="inline-flex items-center text-gray-500 hover:text-black font-medium transition mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Journal
        </Link>
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <span className="font-bold text-black uppercase tracking-wider bg-gray-100 px-3 py-1 rounded-full">{post.category}</span>
          <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {post.date}</div>
          <div className="flex items-center gap-1"><User className="w-4 h-4" /> {post.author}</div>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">{post.title}</h1>
        <p className="text-xl text-gray-600 italic border-l-4 border-gray-200 pl-4">{post.excerpt}</p>
      </div>

      <div className="w-full aspect-video md:aspect-[21/9] bg-gray-100 mb-12 rounded-3xl overflow-hidden">
        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
      </div>

      <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed space-y-6">
        {post.content.split('\n\n').map((paragraph, idx) => (
          <p key={idx}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
