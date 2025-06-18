import Link from "next/link";
import Image from "next/image";

const Login = () => {
  return (
    <div className="container px-3 a">
      <div className="pt-4">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9.57 5.92999L3.5 12L9.57 18.07"
            stroke="#19191A"
            strokeWidth="1.5"
            stroke-miterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M20.5 12H3.67"
            stroke="#19191A"
            strokeWidth="1.5"
            stroke-miterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <form>
        <div className="mb-3">
          <h2 className="text-left fw-bold mt-4">Log in</h2>
          <p style={{ color: "#797979" }}>
            Enter the email you registered with.
          </p>
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            placeholder="enter your email"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="mobile" className="form-label">
            Mobile
          </label>
          <input
            type="text"
            className="form-control"
            id="mobile"
            placeholder="enter your mobile"
          />
        </div>

        <div className="mb-3 position-relative">
          <label for="password" className="form-label">
            Password
          </label>
          <div className="password-wrapper">
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="enter password"
            />
            <span
              className="password-icon"
              onclick="togglePasswordVisibility()"
            >
              <Image
                src="https://cdn-icons-png.flaticon.com/512/159/159604.png"
                alt="eye icon"
                width="20"
              />
            </span>
          </div>
        </div>
        <div className="text-end">
          <Link
            href="#"
            className="forgot-password ms-auto"
            style={{ color: "#242760" }}
          >
            Forgot Password
          </Link>
        </div>
        <Link href="/dashboard" className="forgot-password ms-auto">
          <button type="button" className="btn btnlogin mb-3 mt-5 p-3">
            Log in
          </button>
        </Link>
        <div className="d-flex align-items-center">
          <hr className="flex-grow-1 border-dark" />
          <span className="mx-2 text-muted">or Continue with</span>
          <hr className="flex-grow-1 border-dark" />
        </div>
        <button type="button" className="btn btn-google p-3 mt-4">
          <svg
            className="position-absolute left-0"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clip-path="url(#clip0_1_2346)">
              <path
                d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z"
                fill="#4285F4"
              />
              <path
                d="M12.24 24.0008C15.4764 24.0008 18.2058 22.9382 20.1944 21.1039L16.3274 18.1055C15.2516 18.8375 13.8626 19.252 12.2444 19.252C9.11376 19.252 6.45934 17.1399 5.50693 14.3003H1.51648V17.3912C3.55359 21.4434 7.70278 24.0008 12.24 24.0008Z"
                fill="#34A853"
              />
              <path
                d="M5.50253 14.3003C4.99987 12.8099 4.99987 11.1961 5.50253 9.70575V6.61481H1.51649C-0.18551 10.0056 -0.18551 14.0004 1.51649 17.3912L5.50253 14.3003Z"
                fill="#FBBC04"
              />
              <path
                d="M12.24 4.74966C13.9508 4.7232 15.6043 5.36697 16.8433 6.54867L20.2694 3.12262C18.1 1.0855 15.2207 -0.034466 12.24 0.000808666C7.70277 0.000808666 3.55359 2.55822 1.51648 6.61481L5.50252 9.70575C6.45052 6.86173 9.10935 4.74966 12.24 4.74966Z"
                fill="#EA4335"
              />
            </g>
            <defs>
              <clipPath id="clip0_1_2346">
                <rect width="24" height="24" fill="white" />
              </clipPath>
            </defs>
          </svg>
          <span className="ms-5">Sign in with Google</span>
        </button>
      </form>
    </div>
  );
};

export default Login;
