import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../../components/layout/AuthLayout.jsx";
import { Button, Input } from "../../components/ui/Form.jsx";
import { authApi } from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";

export default function Signup() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = "Full name is required.";
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email address.";
    if (form.password.length < 8) next.password = "Password must be at least 8 characters.";
    if (form.password !== form.confirmPassword) next.confirmPassword = "Passwords do not match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await authApi.signup(form);
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
      title="Create your Director account"
      subtitle="Manage events, judges, and rankings from one place."
      footer={
        <p style={{ marginTop: 20, color: "var(--muted)" }}>
          Already have an account? <Link to="/director/login" style={{ color: "var(--accent)", fontWeight: 600 }}>Sign in</Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
        <Input label="Full Name" value={form.name} onChange={(e) => set("name", e.target.value)} error={errors.name} />
        <Input label="Email Address" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} error={errors.email} />
        <Input label="Password" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} error={errors.password} />
        <Input label="Confirm Password" type="password" value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} error={errors.confirmPassword} />
        <Button type="submit" loading={loading} size="lg">Create Account</Button>
      </form>
    </AuthLayout>
  );
}
