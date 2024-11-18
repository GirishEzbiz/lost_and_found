import Link from 'next/link';

const LogCreate = () => {
    return (
        <>
        <div className="container px-3">
            <div className='row pt-3'>
                <div className='col'>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.57 5.92999L3.5 12L9.57 18.07" stroke="#19191A" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M20.5 12H3.67004" stroke="#19191A" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
            </div>
            <div className="row pt-2">
                <div className='col text-center'>
                    <h2 className="text-center fw-bold mt-4">Log in an Create Account</h2>
                    <p style={{ color: '#797979' }}>We will send you a phone number confirmation code..</p>
                </div>
            </div>
        </div>

        <div style={styles.container}>
        <div style={styles.inputSection}>
          <div style={styles.inputGroup}>
            <span style={styles.countryCode}>+91</span>
            <input
              type="number"
              placeholder="Enter phone number"
              style={styles.phoneInput}
              disabled
            />
          </div>
          <p style={styles.terms} className='my-4'>
            By continuing, you agree to Our{" "}
            <a href="#" style={styles.link}>
              terms, conditions and privacy policy
            </a>
            .
          </p>
          <button style={styles.continueButton} disabled>
            Continue
          </button>
        </div>
      </div>
      </>
    );
};

export default LogCreate;

const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      height: "100vh",
      padding: "20px",
      backgroundColor: "#fff",
    },
    inputSection: {
      textAlign: "center",
      marginBottom: "20px",
    },
    inputGroup: {
      display: "flex",
      alignItems: "center",
      border: "1px solid #ccc",
      borderRadius: "10px",
      overflow: "hidden",
      marginBottom: "10px",
      width: "100%",
      maxWidth: "320px",
      backgroundColor: "#f9f9f9",
    },
    countryCode: {
      backgroundColor: "#f1f1f1",
      padding: "10px 15px",
      fontSize: "16px",
      fontWeight: "bold",
      color: "#6c757d",
    },
    phoneInput: {
      flex: 1,
      border: "none",
      outline: "none",
      padding: "10px 15px",
      fontSize: "16px",
      color: "#6c757d",
      backgroundColor: "transparent",
    },
    terms: {
      fontSize: "12px",
      color: "#6c757d",
      maxWidth: "300px",
      margin: "0 auto",
      lineHeight: "1.5",
    },
    link: {
      color: "#007bff",
      textDecoration: "none",
    },
    continueButton: {
      backgroundColor: "#e9ecef",
      color: "#6c757d",
      padding: "10px 20px",
      border: "none",
      borderRadius: "25px",
      fontSize: "16px",
      cursor: "not-allowed",
      width: "100%",
      maxWidth: "320px",
      marginTop: "10px",
    },
  };
