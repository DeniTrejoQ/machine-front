"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, LogIn } from "lucide-react";

import { api, setToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await api.login({ email, password });
      setToken(response.access_token);
      router.replace("/");
    } catch (exc) {
      setError(exc instanceof Error ? exc.message : "No se pudo iniciar sesion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-brand">
          <div className="login-mark">
            <Lock size={24} />
          </div>
          <p className="eyebrow">Acceso interno</p>
          <h1>ELEMENT ELITE FLEET</h1>
          <p className="muted">Plataforma empresarial para analisis de abandono y retencion.</p>
        </div>
        <form className="login-form" onSubmit={submit}>
          <label>
            Email corporativo
            <input autoComplete="email" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            Contrasena
            <input
              autoComplete="current-password"
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <button className="button" disabled={loading} type="submit">
            <LogIn size={18} />
            Iniciar sesion
          </button>
          {error && <p className="status error">{error}</p>}
        </form>
      </section>
    </main>
  );
}
