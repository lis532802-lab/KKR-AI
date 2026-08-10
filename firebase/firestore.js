import { 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy, 
    serverTimestamp,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { db } from "./firebase-config.js";

const CHATS_COLLECTION = "kkr_chats";

export const createChatSession = async (userId, title = "New Conversation") => {
    const docRef = await addDoc(collection(db, CHATS_COLLECTION), {
        userId,
        title,
        pinned: false,
        favorite: false,
        messages: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });
    return docRef.id;
};

export const getUserChats = async (userId) => {
    const q = query(
        collection(db, CHATS_COLLECTION),
        where("userId", "==", userId)
    );
    const querySnapshot = await getDocs(q);
    const chats = [];
    querySnapshot.forEach((doc) => {
        chats.push({ id: doc.id, ...doc.data() });
    });
    return chats.sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
};

export const saveChatMessages = async (chatId, messages, title) => {
    const chatRef = doc(db, CHATS_COLLECTION, chatId);
    const updatePayload = {
        messages,
        updatedAt: serverTimestamp()
    };
    if (title) updatePayload.title = title;
    await updateDoc(chatRef, updatePayload);
};

export const togglePinChat = async (chatId, status) => {
    await updateDoc(doc(db, CHATS_COLLECTION, chatId), { pinned: !status });
};

export const deleteChatSession = async (chatId) => {
    await deleteDoc(doc(db, CHATS_COLLECTION, chatId));
};
