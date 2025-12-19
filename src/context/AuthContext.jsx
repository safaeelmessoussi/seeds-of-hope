import { createContext, useContext, useEffect, useState } from "react";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut
} from "firebase/auth";
import { auth } from "../firebase";
import { dbService } from "../services/db";

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    function logout() {
        return signOut(auth);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    // Fetch all users to find the matching profile
                    // In a larger app, use a query: where('email', '==', email)
                    const users = await dbService.getAll("users");
                    const appUser = users.find(u => u.email === firebaseUser.email);

                    if (appUser) {
                        setCurrentUser({
                            ...firebaseUser,
                            role: appUser.role, // 'super-admin', 'admin', 'teacher', 'student'
                            branchId: appUser.branchId
                        });
                    } else {
                        // Fallback: Default to 'student' or 'teacher' or just plain user if not found?
                        // For admins, they MUST be in the users collection.
                        console.warn("User logged in but not found in 'users' collection.");
                        setCurrentUser(firebaseUser);
                    }
                } catch (e) {
                    console.error("Error fetching user role", e);
                    setCurrentUser(firebaseUser);
                }
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
