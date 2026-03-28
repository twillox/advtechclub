export { default } from "./pages/Login";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // ✅ DEFINE response HERE
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      // ✅ NOW SAFE TO USE
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      console.error(err);
      alert("Login failed ❌");
    }
  };
  useEffect(() => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  if (storedUser) {
    setUser(storedUser);
  }
}, []); // ✅ ONLY RUNS ONCE

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1220] text-white">
      <form
        onSubmit={handleLogin}
        className="bg-[#111827] p-8 rounded-2xl w-[300px] space-y-4"
      >
        <h1 className="text-xl font-bold">Login</h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 rounded bg-gray-800"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 rounded bg-gray-800"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-indigo-500 py-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
}
