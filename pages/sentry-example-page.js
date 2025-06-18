import { useState, useEffect } from "react";

class SentryExampleFrontendError extends Error {
  constructor(message) {
    super(message);
    this.name = "SentryExampleFrontendError";
  }
}

export default function SentryExamplePage() {
  const [error, setError] = useState(false);

  useEffect(() => {
    if (error) {
      throw new SentryExampleFrontendError(
        "This is a test error from the frontend!"
      );
    }
  }, [error]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Sentry Example Page</h1>
      <button
        onClick={() => setError(true)}
        style={{
          padding: "10px 20px",
          marginTop: "20px",
          background: "#ff4d4f",
          color: "#fff",
        }}
      >
        Throw Error
      </button>
    </div>
  );
}
