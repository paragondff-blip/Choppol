import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { CheckCircle, XCircle, Clock, Eye, AlertCircle } from 'lucide-react';
import { ApprovalRequest } from '../../types';

export default function AdminApprovals() {
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'approvals'), where('status', '==', 'pending'), orderBy('requestDate', 'desc'));
      const snap = await getDocs(q);
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() } as ApprovalRequest)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (request: ApprovalRequest) => {
    try {
      const collectionName = request.type === 'product' ? 'products' : 
                            request.type === 'page' ? 'pages' : 
                            request.type === 'footer' ? 'settings' : 'settings';
      
      const docId = request.targetId;
      const targetRef = doc(db, collectionName, docId);

      if (request.action === 'delete') {
        await deleteDoc(targetRef);
      } else {
        await setDoc(targetRef, { ...request.newData, updatedAt: Date.now() }, { merge: true });
      }

      // Mark as approved
      await updateDoc(doc(db, 'approvals', request.id), {
        status: 'approved',
        reviewDate: Date.now()
      });

      alert('Saved');
      setSelectedRequest(null);
      fetchRequests();
    } catch (err) {
      console.error(err);
      alert('Error approving request');
    }
  };

  const handleReject = async (request: ApprovalRequest) => {
    const reason = prompt('Reason for rejection:');
    if (reason === null) return;

    try {
      await updateDoc(doc(db, 'approvals', request.id), {
        status: 'rejected',
        reason,
        reviewDate: Date.now()
      });
      alert('Rejected');
      setSelectedRequest(null);
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Loading pending requests...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Approval Queue</h2>

      {requests.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl p-12 text-center border border-dashed border-gray-200">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4 opacity-20" />
          <p className="text-gray-500 font-medium">No pending approval requests.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl mr-4">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 capitalize">{request.action} {request.type}</h3>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded uppercase">{request.targetId}</span>
                  </div>
                  <p className="text-sm text-gray-500">Requested by <span className="font-medium text-gray-700">{request.requestBy.email}</span> • {new Date(request.requestDate).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setSelectedRequest(request)}
                  className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  title="View Changes"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleApprove(request)}
                  className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                  title="Approve"
                >
                  <CheckCircle className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleReject(request)}
                  className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                  title="Reject"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Review Changes</h3>
              <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-gray-100 rounded-lg"><Eye className="w-5 h-5 text-gray-400 rotate-180" /></button>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Request Details</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Type:</p>
                    <p className="font-bold text-gray-900 capitalize">{selectedRequest.type}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Action:</p>
                    <p className="font-bold text-gray-900 capitalize">{selectedRequest.action}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Data Changes</p>
                <pre className="p-4 bg-gray-900 text-green-400 rounded-xl text-xs overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(selectedRequest.newData, null, 2)}
                </pre>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <button onClick={() => setSelectedRequest(null)} className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200">Close</button>
                <button onClick={() => handleReject(selectedRequest)} className="px-6 py-2 bg-red-100 text-red-700 font-medium rounded-lg hover:bg-red-200">Reject</button>
                <button onClick={() => handleApprove(selectedRequest)} className="px-6 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800">Approve & Publish</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
