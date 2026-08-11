import { createContext, useContext, useState, useEffect } from "react";
import apiRequest from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the logged-in user from the session cookie when the app starts.
  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const currentUser = await apiRequest("/api/auth/me");
        setUser(currentUser);
      } catch {
        setUser(null); // An unsuccessful session check leaves the user logged out.
      } finally {
        setLoading(false); // Allow routes to render after the session check finishes.
      }
    }

    loadCurrentUser();
  }, []);
  //The empty array means the effect is connected to the provider’s initial mounting, not every state update.
  //Without it, changing user could run the request again and create an unnecessary loop.

  async function login(credentials) {
    const loggedInUser = await apiRequest("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
    setUser(loggedInUser); // Update protected routes without refreshing the page.
    return loggedInUser;
  }

  async function signup(details) {
    const newUser = await apiRequest("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(details),
    });
    setUser(newUser); // Signup also starts an authenticated session.
    return newUser;
  }

  async function logout() {
    await apiRequest("/api/auth/logout", {
      method: "POST",
    });
    setUser(null); // Remove the user after the backend clears the cookie.
  }

  // Share authentication state and actions with every nested component.
  return (
    //.Provider comes from the object returned by createContext()
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
