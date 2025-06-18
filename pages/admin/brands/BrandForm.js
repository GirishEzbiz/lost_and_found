import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Form, Button, Spinner, Alert, Row, Col, InputGroup } from "react-bootstrap";
import axios from "axios";
import Cookies from "js-cookie";
import { MdEmail, MdPhoneAndroid, MdAttachMoney, MdLocationOn, MdCloudUpload, MdBusiness, MdBuild, MdPayment, MdInfo, } from "react-icons/md";

import { FaTags } from "react-icons/fa"



const BrandForm = ({ brandId }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [isWelcomeMessage, setIsWelcomeMessage] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [paymentOption, setPaymentOption] = useState(1);
  const [serviceStartDate, setServiceStartDate] = useState("");
  const [serviceEndDate, setServiceEndDate] = useState("");
  const [subscriptionPaymentOption, setSubscriptionPaymentOption] = useState(1);
  const [enableAlerts, setEnableAlerts] = useState(0);
  const [imageError, setImageError] = useState("");

  // const [subscriptionStartDate, setSubscriptionStartDate] = useState("");
  // const [subscriptionEndDate, setSubscriptionEndDate] = useState("");
  const [pricePerCode, setPricePerCode] = useState("");
  const router = useRouter();

  const [tokenData, setTokenData] = useState();

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
      console.log("error fetching token", error);
      return null; // Return null if decoding fails
    }
  }

  useEffect(() => {
    setTokenData(decodeJWT(Cookies.get("adminToken")));
  }, []);



  // kkKK
  useEffect(() => {
    if (brandId) {
      const fetchBrand = async () => {
        setLoading(true);
        try {
          const { data } = await axios.get(`/api/admin/brands`, {
            params: { id: brandId },
          });
          setName(data.name || "");
          setEmail(data.email || "");
          setMobile(data.mobile || "");
          setAddress(data.address || "");
          setIsWelcomeMessage(data.welcome_message || "");
          setPaymentOption(data?.payment_option);
          setServiceStartDate(
            data.service_from
              ? new Date(data.service_from).toISOString().split("T")[0]
              : ""
          );

          setServiceEndDate(
            data.service_to
              ? new Date(data.service_to).toISOString().split("T")[0]
              : ""
          );

          setSubscriptionPaymentOption(data.subscription_payment_option);

          // setSubscriptionStartDate(
          //   data.subscription_from
          //     ? new Date(data.subscription_from).toISOString().split("T")[0]
          //     : ""
          // );
          // setSubscriptionEndDate(
          //   data.subscription_to
          //     ? new Date(data.subscription_to).toISOString().split("T")[0]
          //     : ""
          // );
          setPricePerCode(data.price_per_code)
          setEnableAlerts(data.alert_subscription_end || 0);
        } catch (err) {
          console.log("error fetching brands", err);
          setError("Failed to fetch brand data.");
        } finally {
          setLoading(false);
        }
      };
      fetchBrand();
    }
  }, [brandId]);

  const validateFields = () => {
    const errors = {};

    if (!name.trim()) errors.name = "Name is required.";
    if (!email.trim()) errors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email))
      errors.email = "Invalid email format.";
    if (!mobile.trim()) errors.mobile = "Mobile number is required.";
    else if (!/^\d{10}$/.test(mobile))
      errors.mobile = "Mobile number must be 10 digits.";
    if (!image) errors.image = "Brand image is required.";

    // ✅ Service Period Validation
    if (!serviceStartDate)
      errors.serviceStartDate = "Service start date is required.";
    if (!serviceEndDate)
      errors.serviceEndDate = "Service end date is required.";

    if (
      serviceStartDate &&
      serviceEndDate &&
      new Date(serviceStartDate) > new Date(serviceEndDate)
    ) {
      errors.serviceEndDate = "Service end date must be after the start date.";
    }

    // ✅ Subscription Period Validation
    // if (!subscriptionStartDate)
    //   errors.subscriptionStartDate = "Subscription start date is required.";
    // if (!subscriptionEndDate)
    //   errors.subscriptionEndDate = "Subscription end date is required.";

    // if (
    //   subscriptionStartDate &&
    //   subscriptionEndDate &&
    //   new Date(subscriptionStartDate) > new Date(subscriptionEndDate)
    // ) {
    //   errors.subscriptionEndDate =
    //     "Subscription end date must be after the start date.";
    // }
    if (!pricePerCode)
      errors.pricePerCode = "Price per code is required ";
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
    const randomPassword = Math.random().toString(36).slice(-8);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("mobile", mobile);
    formData.append("address", address);
    formData.append("welcome_message", isWelcomeMessage);
    formData.append("image", image);
    formData.append("password", randomPassword);
    formData.append("role_id", 0);
    formData.append("status", 1);
    formData.append("payment_option", paymentOption);
    formData.append("service_start_date", serviceStartDate);
    formData.append("service_end_date", serviceEndDate);
    formData.append("subscription_payment_option", subscriptionPaymentOption);
    formData.append("enable_alerts", enableAlerts);
    formData.append("price_per_code", pricePerCode)
    // formData.append("subscription_start_date", subscriptionStartDate);
    // formData.append("subscription_end_date", subscriptionEndDate);
    formData.append("created_by", tokenData.id);

    setLoading(true);
    try {
      const endpoint = brandId
        ? `/api/admin/brands?id=${brandId}`
        : "/api/admin/brands";
      const method = brandId ? "put" : "post";


      let data = await axios({
        method,
        url: endpoint,
        data: formData, // Directly pass formData here
      });



      router.push("/admin/brands");
    } catch (err) {
      console.log("error saveing brands", err);

      const message =
        err.response?.data?.message ||
        "An error occurred while saving the brand.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    // Validate image type and size
    if (file && file.size > 500 * 1024) {
      setImageError("Image size should be under 500KB");
      e.target.value = ""; // Clear file input
      return;
    }
    setImageError("");
    if (file && !file.type.startsWith("image/")) {
      setValidationErrors((prev) => ({
        ...prev,
        image: "Please upload a valid image file.",
      }));
      setImage(null);
    } else if (file && file.size > 5 * 1024 * 1024) {
      setValidationErrors((prev) => ({
        ...prev,
        image: "Image size must be less than 5MB.",
      }));
      setImage(null);
    } else {
      setImage(file);
    }
  };

  return (


    // <Form onSubmit={handleSubmit}>
    //   {error && <Alert variant="danger">{error}</Alert>}

    //   {/* Brand Information Section */}
    //   <h4 className="mb-3 p-1 fs-5" style={{ background: "gainsboro" }}>
    //     Brand Information
    //   </h4>
    //   <Row>
    //     <Col md={4}>
    //       <Form.Group className="mb-3">
    //         <Form.Label>
    //           Brand Name <span className="text-danger">*</span>
    //         </Form.Label>
    //         <Form.Control
    //           type="text"
    //           value={name}
    //           onChange={(e) => {
    //             setName(e.target.value),
    //               setValidationErrors((prevErrors) => ({
    //                 ...prevErrors,
    //                 name: "",
    //               }));
    //           }}
    //           isInvalid={!!validationErrors.name}
    //           placeholder="Enter brand name"
    //         />
    //         {validationErrors.name && (
    //           <Form.Control.Feedback type="invalid">
    //             {validationErrors.name}
    //           </Form.Control.Feedback>
    //         )}
    //       </Form.Group>
    //     </Col>
    //     <Col md={4}>
    //       <Form.Group className="mb-3">
    //         <Form.Label>
    //           Email <span className="text-danger">*</span>
    //         </Form.Label>
    //         <Form.Control
    //           type="email"
    //           value={email}
    //           onChange={(e) => {
    //             setEmail(e.target.value),
    //               setValidationErrors((prevErrors) => ({
    //                 ...prevErrors,
    //                 email: "",
    //               }));
    //           }}
    //           isInvalid={!!validationErrors.email}
    //           placeholder="Enter email"
    //         />
    //         {validationErrors.email && (
    //           <Form.Control.Feedback type="invalid">
    //             {"Please Enter Valid Email"}
    //           </Form.Control.Feedback>
    //         )}
    //       </Form.Group>
    //     </Col>
    //     <Col md={4}>
    //       <Form.Group className="mb-3">
    //         <Form.Label>
    //           Mobile <span className="text-danger">*</span>
    //         </Form.Label>
    //         <Form.Control
    //           type="text"
    //           value={mobile}
    //           onChange={(e) => {
    //             setMobile(e.target.value),
    //               setValidationErrors((prevErrors) => ({
    //                 ...prevErrors,
    //                 mobile: "",
    //               }));
    //           }}
    //           isInvalid={!!validationErrors.mobile}
    //           placeholder="Enter mobile number"
    //         />
    //         {validationErrors.mobile && (
    //           <Form.Control.Feedback type="invalid">
    //             {validationErrors.mobile}
    //           </Form.Control.Feedback>
    //         )}
    //       </Form.Group>
    //     </Col>
    //   </Row>

    //   <Row>
    //     <Col md={6}>
    //       <Form.Group className="mb-3">
    //         <Form.Label>Brand Image</Form.Label>
    //         <Form.Control
    //           type="file"
    //           accept="image/*"
    //           onChange={handleImageChange}
    //         />
    //         {validationErrors.image && (
    //           <Form.Control.Feedback type="invalid">
    //             {validationErrors.image}
    //           </Form.Control.Feedback>
    //         )}
    //       </Form.Group>
    //     </Col>
    //     <Col md={6}>
    //       <Form.Group className="mb-3">
    //         <Form.Label>Address</Form.Label>
    //         <Form.Control
    //           as="textarea"
    //           rows={1}
    //           value={address}
    //           onChange={(e) => setAddress(e.target.value)}
    //           placeholder="Enter address"
    //         />
    //       </Form.Group>
    //     </Col>
    //   </Row>

    //   {/* Subscription Details Section */}
    //   <h4 className="mb-3 p-1 fs-5" style={{ background: "gainsboro" }}>
    //     Service Period During Warranty
    //   </h4>
    //   <Row>
    //     <Col md={4}>
    //       <Form.Group className="mb-3">
    //         <Form.Label>Payment Option</Form.Label>
    //         <Form.Select
    //           value={paymentOption}
    //           onChange={(e) => setPaymentOption(e.target.value)}
    //         >
    //           <option value={1}>By Brand</option>
    //           <option value={0}>By End User</option>
    //         </Form.Select>
    //       </Form.Group>
    //     </Col>
    //     <Col md={4}>
    //       <Form.Group className="mb-3">
    //         <Form.Label>Service Period (From)</Form.Label>
    //         <Form.Control
    //           type="date"
    //           value={serviceStartDate}
    //           onChange={(e) => {
    //             setServiceStartDate(e.target.value),
    //               setValidationErrors((prevErrors) => ({
    //                 ...prevErrors,
    //                 serviceStartDate: "",
    //               }));
    //           }}
    //         />
    //         {validationErrors.serviceStartDate && (
    //           <small className="text-danger">
    //             {validationErrors.serviceStartDate}
    //           </small>
    //         )}
    //       </Form.Group>
    //     </Col>
    //     <Col md={4}>
    //       <Form.Group className="mb-3">
    //         <Form.Label>Service Period (To)</Form.Label>
    //         <Form.Control
    //           type="date"
    //           value={serviceEndDate}
    //           onChange={(e) => {
    //             setServiceEndDate(e.target.value),
    //               setValidationErrors((prevErrors) => ({
    //                 ...prevErrors,
    //                 serviceEndDate: "",
    //               }));
    //           }}
    //         />
    //         {validationErrors.serviceEndDate && (
    //           <small className="text-danger">
    //             {validationErrors.serviceEndDate}
    //           </small>
    //         )}
    //       </Form.Group>
    //     </Col>
    //   </Row>

    //   <h4 className="mb-3 p-1 fs-5" style={{ background: "gainsboro" }}>
    //     Subscription Details
    //   </h4>
    //   <Row>
    //     <Col md={4}>
    //       <Form.Group className="mb-3">
    //         <Form.Label>Subscription Payment Option</Form.Label>
    //         <Form.Select
    //           value={subscriptionPaymentOption}
    //           onChange={(e) => setSubscriptionPaymentOption(e.target.value)}
    //         >
    //           <option value={1}>By Brand</option>
    //           <option value={0}>By End User</option>
    //         </Form.Select>
    //       </Form.Group>
    //     </Col>
    //     {/* <Col md={4}>
    //       <Form.Group className="mb-3">
    //         <Form.Label>Subscription Period (From)</Form.Label>
    //         <Form.Control
    //           type="date"
    //           value={subscriptionStartDate}
    //           onChange={(e) => {
    //             setSubscriptionStartDate(e.target.value),
    //               setValidationErrors((prevErrors) => ({ ...prevErrors, subscriptionStartDate: "" }));
    //           }}
    //         />
    //         {validationErrors.subscriptionStartDate && <small className="text-danger">{validationErrors.subscriptionStartDate}</small>}

    //       </Form.Group>
    //     </Col>
    //     <Col md={4}>
    //       <Form.Group className="mb-3">
    //         <Form.Label>Subscription Period (To)</Form.Label>
    //         <Form.Control
    //           type="date"
    //           value={subscriptionEndDate}
    //           onChange={(e) => {
    //             setSubscriptionEndDate(e.target.value),
    //               setValidationErrors((prevErrors) => ({ ...prevErrors, subscriptionEndDate: "" }));
    //           }}
    //         />
    //         {validationErrors.subscriptionEndDate && <small className="text-danger">{validationErrors.subscriptionEndDate}</small>}

    //       </Form.Group>
    //     </Col> */}
    //     <Col md={4}>
    //       <Form.Group className="mb-3">
    //         <Form.Label>Price Per Code</Form.Label>
    //         <Form.Control
    //           type="number" // Allow only numbers
    //           placeholder="Enter price"
    //           value={pricePerCode} // Controlled input for price
    //           onChange={(e) => {
    //             const price = e.target.value;
    //             setPricePerCode(price); // Update state with numeric value

    //             // Clear validation errors when user types
    //             setValidationErrors((prevErrors) => ({
    //               ...prevErrors,
    //               pricePerCode: "",
    //             }));
    //           }}
    //         />
    //         {validationErrors.pricePerCode && (
    //           <small className="text-danger">
    //             {validationErrors.pricePerCode}
    //           </small>
    //         )}
    //       </Form.Group>
    //     </Col>
    //   </Row>

    //   <Row>
    //     <Col md={4}>
    //       <Form.Group className="mb-3">
    //         <Form.Label>Enable Alerts for Subscription End</Form.Label>
    //         <Form.Check
    //           type="checkbox"
    //           checked={enableAlerts === 1}
    //           onChange={(e) => setEnableAlerts(e.target.checked ? 1 : 0)}
    //         />
    //       </Form.Group>
    //     </Col>
    //   </Row>

    //   {/* Additional Information Section */}
    //   <h4 className="mb-3 p-1 fs-5" style={{ background: "gainsboro" }}>
    //     Additional Information
    //   </h4>
    //   <Row>
    //     <Col md={12}>
    //       <Form.Group className="mb-3">
    //         <Form.Label>Welcome Message</Form.Label>
    //         <Form.Control
    //           as="textarea"
    //           rows={3}
    //           value={isWelcomeMessage}
    //           onChange={(e) => setIsWelcomeMessage(e.target.value)}
    //           placeholder="Enter a welcome message"
    //         />
    //       </Form.Group>
    //     </Col>
    //   </Row>

    //   <Button variant="primary" type="submit" disabled={loading}>
    //     {loading ? <Spinner animation="border" size="sm" /> : "Save Brand"}
    //   </Button>
    // </Form>



    // My code prvious one


    <>
      {/* 

<style>{`
  
  .form-label {
    color: #444 !important;
  }


  .input-group.modern-input:focus-within,
  .modern-input:focus {
    border-color: #EAE6FF!important;
    box-shadow: 0 0 0 0.2rem rgba(98, 75, 255, 0.25);
    outline: none;
    
  }

  .custom-checkbox .form-check-input {
    border: 1px solid #444;
    width: 18px;
    height: 18px;
  }

  .save-button {
    background-color: #624BFF;
    border: none;
    border-radius: 8px;
    padding: 0.75rem 2rem;
    font-size: 1rem;
    font-weight: 600;
    box-shadow: 0px 6px 16px rgba(98, 75, 255, 0.3);
    transition: background 0.2s ease;
  }

 
  
  .same-height {
    height: 38px;
    resize: none;
  }
   
`}</style>


<Form onSubmit={handleSubmit} className="p-4  rounded-3 shadow-sm">
  {error && <Alert variant="danger">{error}</Alert>}

  

  <h4 className="mb-3 px-3 py-2 rounded-2 border-black fw-normal" style={{ backgroundColor: "#F7f7f4", color: "#5f656b" }}>
    Brand Information
  </h4>


  <Row>
    <Col md={4}>
      <Form.Group className="mb-4">
        <Form.Label className="form-label">Brand Name <span className="text-danger">*</span></Form.Label>
        <Form.Control
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setValidationErrors((prev) => ({ ...prev, name: "" }));
          }}
          isInvalid={!!validationErrors.name}
          placeholder="Enter brand name"
          className="modern-input"
        />
        <Form.Control.Feedback type="invalid">{validationErrors.name}</Form.Control.Feedback>
      </Form.Group>
    </Col>

    <Col md={4}>
      <Form.Group className="mb-4">
        <Form.Label className="form-label">Email <span className="text-danger">*</span></Form.Label>
        <InputGroup className="modern-input">
          <InputGroup.Text><MdEmail color="#624BFF" /></InputGroup.Text>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setValidationErrors((prev) => ({ ...prev, email: "" }));
            }}
            isInvalid={!!validationErrors.email}
            placeholder="Enter email"
          />
        </InputGroup>
        <Form.Control.Feedback type="invalid">Please enter valid email</Form.Control.Feedback>
      </Form.Group>
    </Col>

    <Col md={4}>
      <Form.Group className="mb-4">
        <Form.Label className="form-label">Mobile <span className="text-danger">*</span></Form.Label>
        <InputGroup className="modern-input">
          <InputGroup.Text><MdPhoneAndroid color="#624BFF" /></InputGroup.Text>
          <Form.Control
            type="text"
            value={mobile}
            onChange={(e) => {
              setMobile(e.target.value);
              setValidationErrors((prev) => ({ ...prev, mobile: "" }));
            }}
            isInvalid={!!validationErrors.mobile}
            placeholder="Enter mobile number"
          />
        </InputGroup>
        <Form.Control.Feedback type="invalid">{validationErrors.mobile}</Form.Control.Feedback>
      </Form.Group>
    </Col>
  </Row>

  <Row>
    <Col md={6}>
      <Form.Group className="mb-4">
        <Form.Label className="form-label">Brand Image</Form.Label>
        <Form.Control
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="modern-input"
        />
      </Form.Group>
    </Col>
    <Col md={6}>
      <Form.Group className="mb-4">
        <Form.Label className="form-label">Address</Form.Label>
        <InputGroup className="modern-input">
          <InputGroup.Text><MdLocationOn color="#624BFF" /></InputGroup.Text>
          <Form.Control
            as="textarea"
            rows={1}
            className="same-height"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter address"
          />
        </InputGroup>
      </Form.Group>
    </Col>
  </Row>



  <h4 className="mb-3 px-3 py-2 rounded-2 fw-normal" style={{ backgroundColor: "#F7f7f4", color: "#5f656b" }}>
    Service Period During Warranty
  </h4>
  
  <Row>
    <Col md={4}>
      <Form.Group className="mb-4">
        <Form.Label className="form-label">Payment Option</Form.Label>
        <Form.Select
          value={paymentOption}
          onChange={(e) => setPaymentOption(e.target.value)}
          className="modern-input"
        >
          <option value={1}>By Brand</option>
          <option value={0}>By End User</option>
        </Form.Select>
      </Form.Group>
    </Col>
    <Col md={4}>
      <Form.Group className="mb-4">
        <Form.Label className="form-label">Service Period (From)</Form.Label>
        <Form.Control
          type="date"
          value={serviceStartDate}
          onChange={(e) => {
            setServiceStartDate(e.target.value);
            setValidationErrors((prev) => ({ ...prev, serviceStartDate: "" }));
          }}
          className="modern-input"
        />
        {validationErrors.serviceStartDate && (
          <small className="text-danger">{validationErrors.serviceStartDate}</small>
        )}
      </Form.Group>
    </Col>
    <Col md={4}>
      <Form.Group className="mb-4">
        <Form.Label className="form-label">Service Period (To)</Form.Label>
        <Form.Control
          type="date"
          value={serviceEndDate}
          onChange={(e) => {
            setServiceEndDate(e.target.value);
            setValidationErrors((prev) => ({ ...prev, serviceEndDate: "" }));
          }}
          className="modern-input"
        />
        {validationErrors.serviceEndDate && (
          <small className="text-danger">{validationErrors.serviceEndDate}</small>
        )}
      </Form.Group>
    </Col>
  </Row>

 
   <h4 className="mb-3 px-3 py-2 rounded-2 fw-normal" style={{ backgroundColor:"#F7f7f4", color: "#5f656b" }}>
    Subscription Details
  </h4>


  <Row>
    <Col md={4}>
      <Form.Group className="mb-4">
        <Form.Label className="form-label">Subscription Payment Option</Form.Label>
        <Form.Select
          value={subscriptionPaymentOption}
          onChange={(e) => setSubscriptionPaymentOption(e.target.value)}
          className="modern-input"
        >
          <option value={1}>By Brand</option>
          <option value={0}>By End User</option>
        </Form.Select>
      </Form.Group>
    </Col>
    <Col md={4}>
    <Form.Group className="mb-4">
  <Form.Label className="form-label">Price Per Code</Form.Label>
  <Form.Control
    type="number"
    placeholder="Enter price"
    value={pricePerCode}
    onChange={(e) => {
      setPricePerCode(e.target.value);
      setValidationErrors((prevErrors) => ({
        ...prevErrors,
        pricePerCode: "",
      }));
    }}
    className="modern-input"
  />
  {validationErrors.pricePerCode && (
    <small className="text-danger">{validationErrors.pricePerCode}</small>
  )}
</Form.Group>
    </Col>
  </Row>

  <Row>
    <Col md={4}>
      <Form.Group className="mb-4">
        <Form.Label className="form-label">Enable Alerts for Subscription End</Form.Label>
        <div className="custom-checkbox pt-2">
          <Form.Check
            type="checkbox"
            checked={enableAlerts === 1}
            onChange={(e) => setEnableAlerts(e.target.checked ? 1 : 0)}
          />
        </div>
      </Form.Group>
    </Col>
  </Row>

 <h4 className="mb-3 px-3 py-2 rounded-2 fw-normal" style={{ backgroundColor: "#F7f7f4", color: "#5f656b" }}>
    Additional Information
  </h4>


  <Row>
    <Col md={12}>
      <Form.Group className="mb-4">
        <Form.Label className="form-label">Welcome Message</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={isWelcomeMessage}
          onChange={(e) => setIsWelcomeMessage(e.target.value)}
          placeholder="Enter a welcome message"
          className="modern-input"
        />
      </Form.Group>
    </Col>
  </Row>

  <div className="text-end">
    <Button type="submit" disabled={loading} className="save-button">
      {loading ? <Spinner animation="border" size="sm" /> : "Save Brand"}
    </Button>
  </div>
</Form> */}


      {/* new one */}



      <style>{`
  .form-label {
    color: #444 !important;
  }

  .input-group.modern-input:focus-within,
  .modern-input:focus {
    border-color: #EAE6FF!important;
    box-shadow: 0 0 0 0.2rem rgba(98, 75, 255, 0.25);
    outline: none;
  }

  .custom-checkbox .form-check-input {
    border: 1px solid #444;
    width: 18px;
    height: 18px;
  }

  .save-button {
    background-color: #624BFF;
    border: none;
    border-radius: 8px;
    padding: 0.75rem 2rem;
    font-size: 1rem;
    font-weight: 600;
    box-shadow: 0px 6px 16px rgba(98, 75, 255, 0.3);
    transition: background 0.2s ease;
  }

  .same-height {
    height: 38px;
    resize: none;
  }

  .section-header {
    background-color: #fff5df;
    padding: 0.75rem 1rem;
    border-left: 6px solid #624BFF;
    border-radius: 6px;
    font-size: 1.1rem;
    font-weight: 500;
    margin-bottom: 1.25rem;
    color: #313e4b;
  }
`}</style>

      <Form onSubmit={handleSubmit} className="p-4  rounded-3 shadow-sm">
        {error && <Alert variant="danger">{error}</Alert>}

        {/* Brand Info */}
        <h4 className="section-header d-flex align-items-center gap-2">
          <FaTags color="#a22191" size={22} />
          Brand Information
        </h4>

        <Row>
          <Col md={4}>
            <Form.Group className="mb-4">
              <Form.Label className="form-label">Brand Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setValidationErrors((prev) => ({ ...prev, name: "" }));
                }}
                isInvalid={!!validationErrors.name}
                placeholder="Enter brand name"
                className="modern-input"
              />
              <Form.Control.Feedback type="invalid">{validationErrors.name}</Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group className="mb-4">
              <Form.Label className="form-label">Email <span className="text-danger">*</span></Form.Label>
              <InputGroup className="modern-input">
                <InputGroup.Text><MdEmail color="#a22191" /></InputGroup.Text>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setValidationErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  isInvalid={!!validationErrors.email}
                  placeholder="Enter email"
                />
              </InputGroup>
              <Form.Control.Feedback type="invalid">Please enter valid email</Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group className="mb-4">
              <Form.Label className="form-label">Mobile <span className="text-danger">*</span></Form.Label>
              <InputGroup className="modern-input">
                <InputGroup.Text><MdPhoneAndroid color="#a22191" /></InputGroup.Text>
                <Form.Control
                  type="text"
                  value={mobile}
                  onChange={(e) => {
                    setMobile(e.target.value);
                    setValidationErrors((prev) => ({ ...prev, mobile: "" }));
                  }}
                  isInvalid={!!validationErrors.mobile}
                  placeholder="Enter mobile number"
                />
              </InputGroup>
              <Form.Control.Feedback type="invalid">{validationErrors.mobile}</Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-4">
              <Form.Label className="form-label">
                Brand Image{" "}
                <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                  (Min: 100kB Max: 500KB, Recommended 600×300px Only JPG||PNG)
                </span>
              </Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="modern-input"
              />
              {imageError && (
                <div style={{ color: "red", fontSize: "0.85rem", marginTop: "5px" }}>
                  {imageError}
                </div>
              )}
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-4">
              <Form.Label className="form-label">Address</Form.Label>
              <InputGroup className="modern-input">
                <InputGroup.Text><MdLocationOn color="#a22191" /></InputGroup.Text>
                <Form.Control
                  as="textarea"
                  rows={1}
                  className="same-height"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter address"
                />
              </InputGroup>
            </Form.Group>
          </Col>
        </Row>

        {/* Service Period */}
        <h4 className="section-header d-flex align-items-center gap-2">
          <MdBuild color="#a22191" size={22} />
          Service Period During Warranty
        </h4>

        <Row>
          <Col md={4}>
            <Form.Group className="mb-4">
              <Form.Label className="form-label">Payment Option</Form.Label>
              <Form.Select
                value={paymentOption}
                onChange={(e) => setPaymentOption(e.target.value)}
                className="modern-input"
              >
                <option value={1}>By Brand</option>
                <option value={0}>By End User</option>
              </Form.Select>
            </Form.Group>
          </Col>
          {/* <Col md={4}>
      <Form.Group className="mb-4">
        <Form.Label className="form-label">Service Period (From)</Form.Label>
        <Form.Control
          type="date"
          value={serviceStartDate}
          onChange={(e) => {
            setServiceStartDate(e.target.value);
            setValidationErrors((prev) => ({ ...prev, serviceStartDate: "" }));
          }}
          className="modern-input"
        />
        {validationErrors.serviceStartDate && (
          <small className="text-danger">{validationErrors.serviceStartDate}</small>
        )}
      </Form.Group>
    </Col>
    <Col md={4}>
      <Form.Group className="mb-4">
        <Form.Label className="form-label">Service Period (To)</Form.Label>
        <Form.Control
          type="date"
          value={serviceEndDate}
          onChange={(e) => {
            setServiceEndDate(e.target.value);
            setValidationErrors((prev) => ({ ...prev, serviceEndDate: "" }));
          }}
          className="modern-input"
        />
        {validationErrors.serviceEndDate && (
          <small className="text-danger">{validationErrors.serviceEndDate}</small>
        )}
      </Form.Group>
    </Col> */}
        </Row>

        {/* Subscription Details */}
        <h4 className="section-header d-flex align-items-center gap-2">
          <MdPayment color="#a22191" size={22} />
          Subscription Details
        </h4>

        <Row>
          <Col md={4}>
            <Form.Group className="mb-4">
              <Form.Label className="form-label">Subscription Payment Option</Form.Label>
              <Form.Select
                value={subscriptionPaymentOption}
                onChange={(e) => setSubscriptionPaymentOption(e.target.value)}
                className="modern-input"
              >
                <option value={1}>By Brand</option>
                <option value={0}>By End User</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-4">
              <Form.Label className="form-label">Price Per Code</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter price"
                value={pricePerCode}
                onChange={(e) => {
                  setPricePerCode(e.target.value);
                  setValidationErrors((prevErrors) => ({
                    ...prevErrors,
                    pricePerCode: "",
                  }));
                }}
                className="modern-input"
              />
              {validationErrors.pricePerCode && (
                <small className="text-danger">{validationErrors.pricePerCode}</small>
              )}
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={4}>
            <Form.Group className="mb-4">
              <Form.Label className="form-label">Enable Alerts for Subscription End</Form.Label>
              <div className="custom-checkbox pt-2">
                <Form.Check
                  type="checkbox"
                  checked={enableAlerts === 1}
                  onChange={(e) => setEnableAlerts(e.target.checked ? 1 : 0)}
                />
              </div>
            </Form.Group>
          </Col>
        </Row>

        {/* Additional Information */}
        <h4 className="section-header d-flex align-items-center gap-2">
          <MdInfo color="#a22191" size={22} />
          Additional Information
        </h4>

        <Row>
          <Col md={12}>
            <Form.Group className="mb-4">
              <Form.Label className="form-label">Welcome Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={isWelcomeMessage}
                onChange={(e) => setIsWelcomeMessage(e.target.value)}
                placeholder="Enter a welcome message"
                className="modern-input"
              />
            </Form.Group>
          </Col>
        </Row>

        <div className="text-end">
          <Button type="submit" disabled={loading} className="save-button" style={{background:"#a22191", color:"#fff"}}>
            {loading ? <Spinner animation="border" size="sm" /> : "Save Brand"}
          </Button>
        </div>
      </Form>

    </>


  );
};

export default BrandForm;
