import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Login } from "../components/Login";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (token) {
      router.replace("/job-search-with-ai");
    }
  }, []);

  return <Login />;
}