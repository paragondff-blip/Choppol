import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

// Fallback components
import AboutUs from './AboutUs';
import Shipping from './Shipping';
import Returns from './Returns';
import FAQ from './FAQ';

export default function DynamicPage() {
  const { slug } = useParams<{ slug: string }>();
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      try {
        if (!slug) return;
        
        let docRef = doc(db, 'pages', slug);
        let docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          const q = query(collection(db, 'pages'), where('slug', '==', slug));
          const querySnap = await getDocs(q);
          if (!querySnap.empty) {
            docSnap = querySnap.docs[0];
          }
        }

        if (docSnap.exists()) {
          setPageData(docSnap.data());
        } else {
          setPageData(null);
        }
      } catch (err) {
        console.error("Error fetching page:", err);
        setPageData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex justify-center mt-20 min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  // If no override from DB, show fallbacks for default pages
  if (!pageData) {
    if (slug === 'about') return <AboutUs />;
    if (slug === 'shipping') return <Shipping />;
    if (slug === 'returns') return <Returns />;
    if (slug === 'faq') return <FAQ />;

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center min-h-[50vh] flex flex-col items-center justify-center">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">404</h1>
        <p className="text-lg text-gray-600 mb-8">Page not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-8">{pageData.title}</h1>
      <div 
        className="prose prose-lg max-w-none text-gray-700" 
        dangerouslySetInnerHTML={{ __html: pageData.content?.replace(/\n/g, '<br />') }} 
      />
    </div>
  );
}

