import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { Mail, Trash, CheckCircle } from 'lucide-react';

export default function AdminMessages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'messages', id), { status: 'read' });
      fetchMessages();
    } catch (err) {
      console.error(err);
      alert("Failed to update message status.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      await deleteDoc(doc(db, 'messages', id));
      fetchMessages();
    } catch (err) {
      console.error(err);
      alert("Failed to delete message.");
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contact Messages</h2>
          <p className="text-sm text-gray-500">View and manage messages sent from the Contact Us page.</p>
        </div>
      </div>

      <div className="space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`p-6 rounded-2xl border ${msg.status === 'unread' ? 'bg-white border-blue-100 shadow-sm' : 'bg-gray-50 border-gray-100'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${msg.status === 'unread' ? 'bg-blue-50 text-blue-500' : 'bg-gray-200 text-gray-500'}`}>
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{msg.name}</h3>
                  <p className="text-sm text-gray-500">{msg.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                 {msg.status === 'unread' && (
                   <button onClick={() => handleMarkRead(msg.id)} title="Mark as Read" className="p-2 text-green-500 hover:bg-green-50 bg-white border border-gray-100 rounded-lg transition"><CheckCircle className="w-4 h-4" /></button>
                 )}
                 <button onClick={() => handleDelete(msg.id)} title="Delete Message" className="p-2 text-red-500 hover:bg-red-50 bg-white border border-gray-100 rounded-lg transition"><Trash className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="pl-14">
              <h4 className="font-bold text-gray-900 mb-1">{msg.subject}</h4>
              <p className="text-gray-700 whitespace-pre-wrap text-sm">{msg.message}</p>
              <p className="text-xs text-gray-400 mt-4">{new Date(msg.createdAt).toLocaleString()}</p>
            </div>
          </div>
        ))}

        {loading && <div className="p-8 text-center text-gray-500">Loading messages...</div>}
        {!loading && messages.length === 0 && (
          <div className="p-12 text-center text-gray-500">No messages found.</div>
        )}
      </div>
    </div>
  );
}
