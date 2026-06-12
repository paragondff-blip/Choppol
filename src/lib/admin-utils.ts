import { db } from './firebase';
import { collection, addDoc, doc, setDoc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { ApprovalRequest, MappedUser } from '../types';

export const requestApproval = async (
  user: MappedUser,
  type: ApprovalRequest['type'],
  action: ApprovalRequest['action'],
  targetId: string,
  newData: any
) => {
  const approvalRef = collection(db, 'approvals');
  const request: Omit<ApprovalRequest, 'id'> = {
    type,
    action,
    targetId,
    newData,
    requestBy: {
      uid: user.uid,
      email: user.email || '',
    },
    requestDate: Date.now(),
    status: 'pending'
  };
  return await addDoc(approvalRef, request);
};

export const performAdminAction = async (
  user: MappedUser,
  type: ApprovalRequest['type'],
  action: ApprovalRequest['action'],
  targetId: string,
  newData: any,
  collectionName: string
) => {
  if (user.role === 'superadmin') {
    const docRef = doc(db, collectionName, targetId);
    try {
      if (action === 'delete') {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { ...newData, updatedAt: Date.now() }, { merge: true });
      }
      return { status: 'executed' };
    } catch (err: any) {
      console.error("Firestore Admin Action Error:", err);
      throw err;
    }
  } else if (user.role === 'subadmin') {
    await requestApproval(user, type, action, targetId, newData);
    return { status: 'pending_approval' };
  }
  throw new Error('Unauthorized');
};
