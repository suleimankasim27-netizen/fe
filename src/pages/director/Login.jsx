import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../../components/layout/AuthLayout.jsx";
import { Button, Input } from "../../components/ui/Form.jsx";
import { authApi } from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authApi.login(form);
      login(data.token, data.director);
      navigate("/director/dashboard");
    } catch (err) {
      toast.push(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your Director workspace."
      footer={
        <p style={{ marginTop: 20, color: "var(--muted)" }}>
          Don't have an account?{" "}
          <Link to="/director/signup" style={{ color: "var(--accent)", fontWeight: 600 }}>
            Create one
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
        <Input
          label="Email Address"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <Button type="submit" loading={loading} size="lg">
          Sign In
        </Button>
      </form>
    </AuthLayout>
  );
}
