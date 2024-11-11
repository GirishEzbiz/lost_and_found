// pages/signup.js
import Link from "next/link";

const Signup = () => {
  return (
    <div className="container px-3">
      <div className="pt-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.57 5.92999L3.5 12L9.57 18.07" stroke="#19191A" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M20.5 12H3.67" stroke="#19191A" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <form>
        <div className="mb-3">
          <h2 className="text-left fw-bold mt-4">Sign up</h2>
          <p className="mb-3" style={{ color: '#474C59' }}>Enter your email, we will text you a <br /> verification code.</p>
          <label htmlFor="email" className="form-label">
            Full Name
          </label>
          <input
            type="text"
            className="form-control"
            id="name"
            placeholder="enter your name"
          />
          <label htmlFor="email" className="form-label mt-3">
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
          <label for="password" class="form-label">Password</label>
          <div class="password-wrapper">
            <input type="password" id="password" class="form-control" placeholder="enter password" />
            <span class="password-icon" onclick="togglePasswordVisibility()">
              <img src="https://cdn-icons-png.flaticon.com/512/159/159604.png" alt="eye icon" width="20" />
            </span>
          </div>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="termsCheckbox" />
          <label class="form-check-label" for="termsCheckbox">
            By registering you accept our <a href="#" class="text-decoration-none" style={{ color: '#4B56E3' }}>Terms of Use</a> and <a href="#" class="text-decoration-none" style={{ color: '#4B56E3' }}>Privacy Policy</a>.
          </label>
        </div>
        <button type="button" className="btn btnlogin mb-3 mt-4 p-3">
          Continue
        </button>
      </form>
    </div>
  );
};

export default Signup;
