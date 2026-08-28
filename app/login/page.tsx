"use client";

import {
  AlertCircle,
  ArrowRight,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getApiError, getAuthUser, type AuthUser } from "../api-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(() => {
    if (typeof window === "undefined") return "";
    const reason = new URLSearchParams(window.location.search).get("error");
    if (reason === "admin-required")
      return "This account does not have administrator access.";
    if (reason === "unauthorized")
      return "Please sign in with an administrator account.";
    return "";
  });
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post<AuthUser | { data: AuthUser }>(
        "/api/login",
        { email, password },
      );
      const user = getAuthUser(data);
      const isAdmin =
        user.isAdmin === true || user.role?.toLowerCase() === "admin";
      if (!isAdmin) {
        await api.post("/api/logout").catch(() => undefined);
        setError("This account is not an administrator. Access denied.");
        return;
      }
      router.replace("/dashboard");
    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          "Unable to sign in. Check your details and try again.",
        ),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-art">
        <div className="login-brand">
          <div className="brand-mark">g</div>
          <span>girlyhub</span>
        </div>
        <div className="login-art-copy">
          <p>Store operations</p>
          <h1>
            Make every detail
            <br />
            feel <i>considered.</i>
          </h1>
          <span>One calm place to run your whole store.</span>
        </div>
        <div className="art-sticker">
          <ShieldCheck size={18} /> Admin workspace
        </div>
      </section>
      <section className="login-panel">
        <div className="login-box">
          <div className="login-mobile-brand">
            <div className="brand-mark">g</div>
            <b>girlyhub</b>
          </div>
          <p className="eyebrow">Welcome back</p>
          <h2>Sign in to your workspace</h2>
          <p className="login-subtitle">
            Use your administrator account to continue.
          </p>
          {error && (
            <div className="login-error">
              <AlertCircle size={17} /> <span>{error}</span>
            </div>
          )}
          <form onSubmit={submit}>
            <label>
              Email address
              <div className="input-with-icon">
                <Mail size={17} />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                />
              </div>
            </label>
            <label>
              Password
              <div className="input-with-icon">
                <LockKeyhole size={17} />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                />
              </div>
            </label>
            <button className="login-submit" type="submit" disabled={busy}>
              {busy ? "Checking access..." : "Continue to dashboard"}
              <ArrowRight size={18} />
            </button>
          </form>
          <p className="login-footnote">
            Administrator access only. Your session is secured by the GirlyHub
            backend.
          </p>
        </div>
      </section>
    </main>
  );
}
