import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  loginMethod?: "email" | "google";
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  updateProfile: (data: { name: string; photoUrl?: string }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Try to find if user already exists to keep ID consistent
    const savedUserStr = localStorage.getItem(`user_${email}`);
    let mockUser: User;

    if (savedUserStr) {
      mockUser = JSON.parse(savedUserStr);
    } else {
      mockUser = {
        id: Date.now().toString(),
        name: email.split("@")[0],
        email,
      };
      localStorage.setItem(`user_${email}`, JSON.stringify(mockUser));
    }

    setUser(mockUser);
    localStorage.setItem("currentUser", JSON.stringify(mockUser));
  };

  const register = async (name: string, email: string, password: string) => {
    const mockUser: User = {
      id: Date.now().toString(),
      name,
      email,
    };
    setUser(mockUser);
    localStorage.setItem(`user_${email}`, JSON.stringify(mockUser));
    localStorage.setItem("currentUser", JSON.stringify(mockUser));
  };

  const loginWithGoogle = async () => {
    const email = "googleuser@example.com";
    const savedUserStr = localStorage.getItem(`user_${email}`);
    let mockUser: User;

    if (savedUserStr) {
      mockUser = JSON.parse(savedUserStr);
    } else {
      mockUser = {
        id: Date.now().toString(),
        name: "Google User",
        email: email,
        photoUrl: "https://example.com/photo.jpg",
        loginMethod: "google",
      };
      localStorage.setItem(`user_${email}`, JSON.stringify(mockUser));
    }

    setUser(mockUser);
    localStorage.setItem("currentUser", JSON.stringify(mockUser));
  };

  const updateProfile = async (data: { name: string; photoUrl?: string }) => {
    if (user) {
      const updatedUser: User = {
        ...user,
        name: data.name,
        photoUrl: data.photoUrl,
      };
      setUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentWorkspace");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        loginWithGoogle,
        updateProfile,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}