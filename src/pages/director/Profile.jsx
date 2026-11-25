import { useState } from "react";
import { authApi } from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { Card } from "../../components/ui/Display.jsx";
import { Button, Input } from "../../components/ui/Form.jsx";

export default function Profile() {
  const { director, setDirector } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(director?.name || "");
  const [loading, setLoading] = useState(false);

  async function save(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authApi.updateMe({ name });
      setDirector(data.director);
      toast.push("Profile updated.");
    } catch (err) {
      toast.push(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="page-title">Profile</h1>
      <p className="page-sub">Director account details.</p>
      <Card style={{ maxWidth: 480, marginTop: 16 }}>
        <form onSubmit={save} style={{ display: "grid", gap: 12 }}>
          <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" value={director?.email || ""} disabled />
          <Button type="submit" loading={loading}>
            Save
          </Button>
        </form>
      </Card>
    </div>
  );
}
