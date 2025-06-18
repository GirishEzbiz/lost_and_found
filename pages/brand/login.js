import React, { useEffect, useState } from "react";
import {
  Form,
  Button,
  Alert,
  Container,
  Row,
  Col,
  Card,
} from "react-bootstrap";
import axios from "axios";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { FaLock } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const brandToken = Cookies.get("brandToken");

  useEffect(() => {
    if (brandToken) {
      router.push("/brand");
    }
  }, [brandToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!password.trim()) {
      setError("Password is required.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("/api/brand-login", {
        email,
        password,
      });

      if (response.status === 200) {
        localStorage.setItem("adminToken", response.data.data.token);
        localStorage.setItem("user_kind", "bt");
        router.push("/brand");
      }
    } catch (err) {
      console.error(err);
      setError("Invalid email or password.");
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #d69acc, #a22191)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <Container className="container-fluid">
        <Row className="justify-content-center align-items-center">
          {/* Optional Left Illustration Column */}
          <Col md={6} className="d-none d-md-flex justify-content-center">
            <img
              src="/assets/brandlogin.png"
              alt="Login Illustration"
              style={{ width: "80%", maxWidth: "400px" }}
            />
          </Col>

          {/* Login Form */}
          <Col md={6} lg={5}>
            <Card className="shadow-lg rounded-4">
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <Image
                    src="/assets/new_qritagya_logo.png"
                    width={"160"}
                    height={"40"}
                  />
                  <h3 className="fw-bold pt-1">Brand Login</h3>
                  <p className="text-muted mb-0">Welcome back! Please login.</p>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-2" controlId="formPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </Form.Group>

                  {/* Forgot Password */}
                  <div className="text-end mb-3">
                    <Link
                      href="/brand/forgot-password"
                      className="text-decoration-none"
                      style={{ color: "#a22191" }}
                    >
                      Forgot Password?
                    </Link>
                  </div>

                  <div className="d-grid">
                    <Button variant="" type="submit" disabled={loading} style={{ backgroundColor: "#A22191", color: "#fff" }}>
                      {loading ? "Logging in..." : "Login"}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminLogin;
