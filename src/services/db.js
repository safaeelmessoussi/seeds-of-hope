import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
    writeBatch,
    query,
    where
} from "firebase/firestore";
import { db, auth } from "../firebase";

// Helper to get collection reference
const getColl = (name) => collection(db, name);

export const dbService = {
    // Fetch all documents from a collection
    getAll: async (collectionName) => {
        try {
            const querySnapshot = await getDocs(getColl(collectionName));
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error(`Error fetching ${collectionName}: `, error);
            throw error;
        }
    },

    // Add a new document
    add: async (collectionName, data) => {
        try {
            const docRef = await addDoc(getColl(collectionName), data);
            return { id: docRef.id, ...data };
        } catch (error) {
            console.error(`Error adding to ${collectionName}: `, error);
            throw error;
        }
    },

    // Update a document
    update: async (collectionName, id, data) => {
        try {
            const docRef = doc(db, collectionName, id);
            await updateDoc(docRef, data);
            return { id, ...data };
        } catch (error) {
            console.error(`Error updating ${collectionName}/${id}:`, error);
            throw error;
        }
    },

    // Soft Delete: Move to trash then delete
    remove: async (collectionName, id) => {
        try {
            const docRef = doc(db, collectionName, id);
            const snapshot = await getDoc(docRef);

            if (!snapshot.exists()) {
                throw new Error("Document does not exist");
            }

            const data = snapshot.data();
            const batch = writeBatch(db);

            // 1. Add to Trash
            const trashRef = doc(collection(db, "trash"));
            batch.set(trashRef, {
                source: collectionName,
                originalId: id,
                originalData: data,
                deletedAt: new Date().toISOString(),
                deletedBy: auth.currentUser ? auth.currentUser.uid : "system"
            });

            // 2. Delete from Source
            batch.delete(docRef);

            await batch.commit();
            return true;
        } catch (error) {
            console.error(`Error removing ${collectionName}/${id}:`, error);
            throw error;
        }
    },

    // Hard Delete (for cleaning trash)
    hardDelete: async (collectionName, id) => {
        try {
            await deleteDoc(doc(db, collectionName, id));
            return true;
        } catch (error) {
            console.error(`Error hard deleting ${collectionName}/${id}:`, error);
            throw error;
        }
    },

    // Restore from Trash
    restore: async (trashId) => {
        try {
            // 1. Get Trash Item
            const trashRef = doc(db, "trash", trashId);
            const trashSnap = await getDoc(trashRef);

            if (!trashSnap.exists()) {
                throw new Error("Trash item not found");
            }

            const { source, originalData } = trashSnap.data();

            // 2. Add back to Source (New ID)
            await addDoc(collection(db, source), originalData);

            // 3. Remove from Trash
            await deleteDoc(trashRef);

            return true;
        } catch (error) {
            console.error(`Error restoring trash item ${trashId}:`, error);
            throw error;
        }
    },

    // Batch Add (for Series)
    addBatch: async (collectionName, items) => {
        try {
            const batch = writeBatch(db);
            const newIds = [];

            items.forEach(item => {
                const docRef = doc(collection(db, collectionName));
                batch.set(docRef, item);
                newIds.push(docRef.id);
            });

            await batch.commit();
            return newIds;
        } catch (error) {
            console.error(`Error batch adding to ${collectionName}:`, error);
            throw error;
        }
    },

    // Delete Series (Future or All)
    deleteSeries: async (collectionName, seriesId, fromDate = null) => {
        try {
            // Query events with this seriesId
            const q = fromDate
                ? query(collection(db, collectionName), where("seriesId", "==", seriesId), where("start", ">=", fromDate))
                : query(collection(db, collectionName), where("seriesId", "==", seriesId));

            const snapshot = await getDocs(q);
            const batch = writeBatch(db);

            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });

            await batch.commit();
        } catch (error) {
            console.error(`Error deleting series ${seriesId}:`, error);
            throw error;
        }
    },

    // Get Student History (Grades)
    getStudentHistory: async (studentId) => {
        try {
            const q = query(collection(db, 'grades'), where('studentId', '==', studentId));
            const snapshot = await getDocs(q);
            const grades = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Sort: School Year DESC, Semester ASC
            return grades.sort((a, b) => {
                // Parse years like "2025-2026"
                const yearA = parseInt(a.schoolYear.split('-')[0]);
                const yearB = parseInt(b.schoolYear.split('-')[0]);

                if (yearA !== yearB) return yearB - yearA; // Newest year first
                return a.semester - b.semester; // Semester 1 before 2
            });
        } catch (error) {
            console.error(`Error fetching history for student ${studentId}:`, error);
            throw error;
        }
    }
};
