import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase.ts";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  college: string;
  degree: string;
  branch: string;
  skills: string[];
  targetRole: string;
  createdAt?: any;
  updatedAt?: any;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  profileCompletion: number;
  login: (email: string, pass: string, remember: boolean) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function calculateProfileCompletion(p: UserProfile | null): number {
  if (!p) return 0;
  let count = 0;
  const total = 7;
  
  if (p.name && p.name.trim() !== "") count++;
  if (p.photoURL && p.photoURL.trim() !== "") count++;
  if (p.college && p.college.trim() !== "") count++;
  if (p.degree && p.degree.trim() !== "") count++;
  if (p.branch && p.branch.trim() !== "") count++;
  if (p.skills && p.skills.length > 0) count++;
  if (p.targetRole && p.targetRole.trim() !== "") count++;

  return Math.round((count / total) * 100);
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [profileCompletion, setProfileCompletion] = useState<number>(0);

  const fetchProfile = async (uid: string, fallbackEmail?: string, fallbackName?: string) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        setProfile(data);
        setProfileCompletion(calculateProfileCompletion(data));
      } else {
        // Create initial default profile
        const newProfile: UserProfile = {
          uid,
          name: fallbackName || fallbackEmail?.split("@")[0] || "User",
          email: fallbackEmail || "",
          photoURL: "",
          college: "",
          degree: "",
          branch: "",
          skills: [],
          targetRole: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        try {
          await setDoc(docRef, newProfile);
        } catch (setErr) {
          console.warn("Could not save new profile document to Firestore (offline/unreachable):", setErr);
        }
        setProfile(newProfile);
        setProfileCompletion(calculateProfileCompletion(newProfile));
      }
    } catch (err) {
      console.warn("Error loading profile, falling back to local memory state:", err);
      // Create local fallback profile to allow normal applet operation while offline
      const fallbackProfile: UserProfile = {
        uid,
        name: fallbackName || fallbackEmail?.split("@")[0] || "Pilot",
        email: fallbackEmail || "",
        photoURL: "",
        college: "",
        degree: "",
        branch: "",
        skills: [],
        targetRole: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProfile(fallbackProfile);
      setProfileCompletion(calculateProfileCompletion(fallbackProfile));
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.uid);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.uid, currentUser.email || "", currentUser.displayName || "");
      } else {
        setProfile(null);
        setProfileCompletion(0);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string, remember: boolean) => {
    const persistenceMode = remember ? browserLocalPersistence : browserSessionPersistence;
    await setPersistence(auth, persistenceMode);
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const register = async (email: string, pass: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const u = userCredential.user;
    
    // Create direct profile
    const newProfile: UserProfile = {
      uid: u.uid,
      name: name,
      email: email,
      photoURL: "",
      college: "",
      degree: "",
      branch: "",
      skills: [],
      targetRole: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, "users", u.uid), newProfile);
    setProfile(newProfile);
    setProfileCompletion(calculateProfileCompletion(newProfile));
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const loginWithGoogle = async () => {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const u = userCredential.user;
    await fetchProfile(u.uid, u.email || "", u.displayName || "");
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error("No authenticated user");
    const docRef = doc(db, "users", user.uid);
    const updatedFields = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    try {
      await updateDoc(docRef, updatedFields);
    } catch (err) {
      console.warn("Could not save profile updates to Firestore (offline/unreachable):", err);
    }
    
    // Also sync standard Auth display name if possible
    if (data.name && data.name !== user.displayName) {
      try {
        await updateProfile(user, { displayName: data.name });
      } catch (err) {
        console.warn("Failed to sync firebase display name", err);
      }
    }

    // Refresh profile in-state
    setProfile((prev) => {
      if (!prev) return null;
      const merged = { ...prev, ...updatedFields };
      setProfileCompletion(calculateProfileCompletion(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        profileCompletion,
        login,
        register,
        logout,
        resetPassword,
        loginWithGoogle,
        updateProfileData,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
