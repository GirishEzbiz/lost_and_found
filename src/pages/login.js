import Link from "next/link";

const Login = () => {
  return (
    <div class="login-container">
      <div class="text-start mb-4">
        <h4>Log in</h4>
        <p>Enter the email you registered with.</p>
      </div>

      <form>
        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input type="email" class="form-control" id="email" placeholder="enter your email" />
        </div>

        <div class="mb-3">
          <label for="mobile" class="form-label">Mobile</label>
          <input type="text" class="form-control" id="mobile" placeholder="enter your mobile" />
        </div>

        <div class="mb-3 position-relative">
          <label for="password" class="form-label">Password</label>
          <input type="password" class="form-control" id="password" placeholder="enter password" />
          <a href="#" class="forgot-password">Forgot Password</a>
        </div>

        <button type="button" class="btn btn-login mb-3">Log in</button>

        <div class="text-center mb-3">
          <span>or Continue with</span>
        </div>

        <button type="button" class="btn btn-google">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png" alt="Google Logo" />
          Sign in with Google
        </button>
      </form>
    </div>

  );
};

export default Login;
