// pages/login.js
import Link from "next/link";

const Login = () => {
  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card p-4 w-50">
        <h2 className="text-center mb-4">Login</h2>
        <form>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              placeholder="Enter email"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              placeholder="Enter password"
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Login
          </button>
        </form>
        <div className="mt-3 text-center">
          <Link href="/forgot-password">
            <a className="text-decoration-none">Forgot Password?</a>
          </Link>
        </div>
        <div className="mt-2 text-center">
          Don't have an account?{" "}
          <Link href="/signup">
            <a>Sign Up</a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
