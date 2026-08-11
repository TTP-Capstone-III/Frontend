import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login, signup } = useAuth();

  const isSignup = mode === "signup"; // Reuse one form for login and signup.

  function toggleMode() {
    setMode(isSignup ? "login" : "signup");
    setErrorMessage("");
    setPassword("");
  }

  async function handleSubmit(event) {
    event.preventDefault(); // Submit through React without reloading the page.
    setErrorMessage("");
    setSubmitting(true); // Disable the buttons while the request is running.

    try {
      if (isSignup) {
        await signup({
          name,
          email,
          password,
        });
      } else {
        await login({
          email,
          password,
        });
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <h1>{isSignup ? "Create account" : "Log in"}</h1>

      <form onSubmit={handleSubmit}>
        {isSignup && (
          <label>
            Name
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>
        )}
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        {errorMessage && <p role="alert">{errorMessage}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? "Please wait..." : isSignup ? "Sign up" : "Log in"}
        </button>
      </form>

      <button type="button" onClick={toggleMode} disabled={submitting}>
        {isSignup
          ? "Already have an account? Log in"
          : "Need an account? Sign up"}
      </button>
    </main>
  );
}
