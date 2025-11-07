import Layout from "../components/Layout";
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Layout element={<LoginForm />} />
    </div>
  );
}
