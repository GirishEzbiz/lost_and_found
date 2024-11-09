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

      <form>
        <div class="mb-3">
          <label for="email" class="form-label">
            Email
          </label>
          <input
            type="email"
            class="form-control"
            id="email"
            placeholder="enter your email"
          />
        </div>

        <div class="mb-3">
          <label for="mobile" class="form-label">
            Mobile
          </label>
          <input
            type="text"
            class="form-control"
            id="mobile"
            placeholder="enter your mobile"
          />
        </div>

        <div class="mb-3 position-relative">
          <label for="password" class="form-label">
            Password
          </label>
          <input
            type="password"
            class="form-control"
            id="password"
            placeholder="enter password"
          />
        </div>
        <div className="text-end">
          <a
            href="#"
            class="forgot-password ms-auto"
            style={{ color: "#242760" }}
          >
            Forgot Password
          </a>
        </div>
        <button type="button" class="btn btn-login mb-3 mt-5 p-3">
          Log in
        </button>
        <div class="text-center mb-3">
          <span>or Continue with</span>
        </div>
        <button type="button" class="btn btn-google p-3">
          <img
            src="https://w7.pngwing.com/pngs/63/1016/png-transparent-google-logo-google-logo-g-suite-chrome-text-logo-chrome.png"
            alt="Google Logo"
          />
          Sign in with Google
        </button>
      </form>
    </div>
  );
};

export default Login;
