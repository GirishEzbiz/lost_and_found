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
import Link from "next/link";
import { Cookie } from "express-session";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const adminToken = Cookies.get("adminToken");

  useEffect(() => {
    if (adminToken) {
      router.push("/admin");
    }
  }, [adminToken]);

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
      const response = await axios.post("/api/admin-login", {
        email,
        password,
      });

      if (response.status === 200) {
        let seetting = await fetch("/api/admin/setting")
        const data = await seetting.json()
        Cookies.set("Page-limit", data?.records_per_page);

        localStorage.setItem("adminToken", response.data.data.token);
        localStorage.setItem("user_kind", "at");
        router.push("/admin");
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
      width: "100%", // Changed from 100vw to 100%
      background: "linear-gradient(to right, #d69acc, #a22191)",
      display: "flex",
      overflow: "hidden", // Prevents scroll from appearing
      justifyContent: "center",
      alignItems: "center",
      padding: "20px",
      overflow: "hidden", // Prevents scroll from appearing
    }}
  >
    <div style={{ width: "100%", maxWidth: "400px" }}>
      <Card className="shadow-lg rounded-4">
        <Card.Body className="p-4">
          <div className="text-center mb-4">
            <FaLock size={28} className="    mb-2" style={{color:"#a22191"}} />
            <h3 className="fw-bold">Admin Login</h3>
            <p className="text-muted small mb-0">
              Welcome back! Please sign in to continue.
            </p>
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
  
            <div className="d-grid">
              <Button variant="primary" type="submit" disabled={loading} style={{background:"#a22191",border:"none",color:"white"}}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  </div>
  
  );
};

export default AdminLogin;
