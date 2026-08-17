import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/pages/auth-page.css";

export default function AuthPage() {
  // One mode value lets the page reuse the same card for both auth forms.
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
      // Display the message created by the shared API client.
      setErrorMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-layout">
        <section className="auth-art">
          <div className="auth-art-content">
            <span>P</span>
            <p>
              One account.
              <br />
              Two ways to park smarter.
            </p>
          </div>
        </section>

        <section className="auth-form-wrap">
          <div className="auth-card">
            <div className="auth-heading">
              <p className="auth-kicker">
                {isSignup ? "Join ParkNGo" : "Welcome back"}
              </p>
              <h1>{isSignup ? "Create your account" : "Log in to continue"}</h1>
              <p className="auth-description">
                Use the same account to find parking or host your own space.
              </p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {isSignup && (
                <label className="auth-field">
                  Full name
                  <input
                    className="auth-input"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                  />
                </label>
              )}
              <label className="auth-field">
                Email
                <input
                  className="auth-input"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>

              <label className="auth-field">
                Password
                <input
                  className="auth-input"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <small>At least 8 characters</small>
              </label>

              {errorMessage && (
                <p className="auth-error app-alert" role="alert">
                  {errorMessage}
                </p>
              )}

              <button
                className="auth-primary-button"
                type="submit"
                disabled={submitting}
              >
                {submitting
                  ? "Please wait…"
                  : isSignup
                    ? "Create account"
                    : "Log in"}
              </button>
            </form>

            <button
              className="auth-toggle-button"
              type="button"
              onClick={toggleMode}
              disabled={submitting}
            >
              <span>
                {isSignup ? "Already have an account?" : "New to ParkNGo?"}
              </span>
              <strong>{isSignup ? "Log in" : "Create an account"}</strong>
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
