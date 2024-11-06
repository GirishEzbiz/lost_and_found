// pages/verify-otp.js
const VerifyOTP = () => {
  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card p-4 w-50">
        <h2 className="text-center mb-4">Verify OTP</h2>
        <form>
          <div className="mb-3">
            <label htmlFor="otp" className="form-label">
              OTP
            </label>
            <input
              type="text"
              className="form-control"
              id="otp"
              placeholder="Enter OTP"
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Verify OTP
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;
