import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Form, Button, Spinner, Alert, Row, Col } from "react-bootstrap";
import axios from "axios";
import Cookies from "js-cookie";
 

const UsersForm = ({ userId, }) => {
 
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const router = useRouter();

  const [tokenData,setTokenData]= useState();


 
  function decodeJWT(token) {
    try {
      const base64Url = token.split(".")[1]; // Get the payload part of the JWT
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/"); // Replace URL-safe characters
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload); // Return the parsed JSON payload
    } catch (error) {
      console.error({
          message: "Error decoding JWT",
          stack: error.stack,
          function: "decodeJWT"
      });
      return null; // Return null if decoding fails
  }
  
  }

  useEffect(()=>{
    setTokenData(decodeJWT(Cookies.get('adminToken')))
  },[])

  useEffect(() => {


    if (userId) {
      const fetchUser = async () => {
        setLoading(true);
        try {
          const { data } = await axios.get(`/api/admin/admin`, {
            params: { id: userId },
          });
          setName(data.name || "");
          setEmail(data.email || "");
          setMobile(data.mobile || "");
          setRole(data.role || "");
          setStatus(data.status || "");
        } catch (err) {
          console.log("error fetching user data", error);
          setError("Failed to fetch user data.");
      }
       finally {
          setLoading(false);
        }
      };
      fetchUser();
    }
  }, [userId]);

  // console.log("adminId",tokenData.id);
  const validateFields = () => {
    const errors = {};
    if (!name.trim()) errors.name = "Name is required.";
    if (!email.trim()) errors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email))
      errors.email = "Invalid email format.";
    if (!password.trim() && !userId)
      errors.password = "Password is required for new users.";
    if (!mobile.trim()) errors.mobile = "Mobile number is required.";
    else if (!/^\d{10}$/.test(mobile))
      errors.mobile = "Mobile number must be 10 digits.";
    if (!role.trim()) errors.role = "Role is required.";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    setError(null);

    const errors = validateFields();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    const userData = {
      name,
      email,
      password: password || undefined,
      mobile,
      role,
      created_by:tokenData.id,
      status:Number(status),
    };

    setLoading(true);
    try {
      const endpoint = userId
        ? `/api/admin/admin?id=${userId}`
        : "/api/admin/admin";
      const method = userId ? "put" : "post";

      await axios({
        method,
        url: endpoint,
        data: userData,
      });

      router.push("/admin/users");
    } catch (err) {
      console.log("error occoured while saveing the user", err);
      const message =
          err.response?.data?.message ||
          "An error occurred while saving the user.";
      setError(message);
  }
   finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>
              Name <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              isInvalid={!!validationErrors.name}
            />
            {validationErrors.name && (
              <Form.Control.Feedback type="invalid">
                {validationErrors.name}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>
              Email <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isInvalid={!!validationErrors.email}
            />
            {validationErrors.email && (
              <Form.Control.Feedback type="invalid">
                {validationErrors.email}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>
              Password {!userId && <span className="text-danger">*</span>}
            </Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              isInvalid={!!validationErrors.password}
            />
            {validationErrors.password && (
              <Form.Control.Feedback type="invalid">
                {validationErrors.password}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>
              Mobile <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              isInvalid={!!validationErrors.mobile}
            />
            {validationErrors.mobile && (
              <Form.Control.Feedback type="invalid">
                {validationErrors.mobile}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>
              Role <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              isInvalid={!!validationErrors.role}
            >
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </Form.Select>
            {validationErrors.role && (
              <Form.Control.Feedback type="invalid">
                {validationErrors.role}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="1">Active</option>
              <option value="2">Inactive</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
      <Button variant="primary" type="submit" disabled={loading}>
        {loading ? <Spinner animation="border" size="sm" /> : "Save User"}
      </Button>
    </Form>
  );
};

export default UsersForm;
