import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Form, Button, Spinner, Alert, Row, Col, Table } from "react-bootstrap";
import axios from "axios";
import Cookies from "js-cookie";
import { DashboardMenu } from "../../../routes/DashboardRoutes";
import Select from "react-select";
import { FaTimes, FaTrash } from "react-icons/fa";


const TeamForm = ({ userId, }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const router = useRouter();
  const [permission, setPermission] = useState([])
  const [tokenData, setTokenData] = useState();
  const [permissions, setPermissions] = useState([])
  const [dynamicPermissions, setDynamicPermissions] = useState([]);


  function decodeJWT(token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    }
    catch (err) {
      console.log("error fewtching token ", error);
      setError("Failed to decode JWT token.");
    }
  }

  useEffect(() => {
    setTokenData(decodeJWT(Cookies.get('adminToken')))
  }, [])

  useEffect(() => {
    if (userId) {
      const fetchUser = async () => {
        setLoading(true);
        try {
          const { data } = await axios.get(`/api/admin/roles`, {
            params: { id: userId },
          });
        
          setName(data.name || "");
          setPermission(JSON.parse(data.permissions) || []);
        } catch (err) {
          console.log("error fewtching user data ", error);
          setError("Failed to fetch Roles data.");
        }
        finally {
          setLoading(false);
        }
      };
      fetchUser();
    }
    getPermissions()
  }, [userId]);

  const validateFields = () => {
    const errors = {};
    if (!name.trim()) errors.name = "Name is required.";
    return errors;
  };

  const getPermissions = async () => {
    try {
      const response = await axios.get('/api/admin/permissions');
      const permissions = response.data;
      setPermissions(permissions);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const handlePermissionChange = (perm) => {
    setPermission((prev) => {
      // Permissions ko filter ya add karte waqt nayi array banayein
      const updatedPermissions = prev.includes(perm)
        ? prev.filter((p) => p !== perm)
        : [...prev, perm];
      return updatedPermissions;
    });
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
      created_by: tokenData.id,
      id: userId,
      permissions: permission
    };

    setLoading(true);
    try {

      if (permission.length > 0) {
        const endpoint = userId
          ? `/api/admin/roles?id=${userId}`
          : "/api/admin/role";
        const method = userId ? "put" : "post";

        await axios({
          method,
          url: endpoint,
          data: userData,
        });

        router.push("/admin/roles");
      } else {
        setError("Please Select Any Checkbox")
        setTimeout(() => {
          setError(false)
        }, 2000);
      }

    }
    catch (err) {
      console.log("error submiting the form ", error);

      const message =
        err.response?.data?.message ||
        "An error occurred while saving the user.";
      setError(message);
    }
  };


  const handleDynamicChange = (index, key, value) => {
    const updated = [...dynamicPermissions];
    updated[index][key] = value;
    setDynamicPermissions(updated);
  };

  const handleRemovePermission = (index) => {
    const updated = [...dynamicPermissions];
    updated.splice(index, 1);
    setDynamicPermissions(updated);
  };

  const handleLogPermission = (index) => {
    const data = dynamicPermissions[index];

    let { name, type } = data



    try {
      let response = axios.post('/api/admin/permissions', {
        name,
        type
      });
      ('Permission logged successfully:', response.data);
      // Auto-remove the row after logging
      const updated = [...dynamicPermissions];
      updated.splice(index, 1);
      setDynamicPermissions(updated);
      setTimeout(() => {
        getPermissions()
      }, 500);

    } catch (error) {
      console.error('Error logging permission:', error);

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
        <Col md={8} className='text-end mt-5'>
          <Button variant="success" onClick={() => {
            setDynamicPermissions([
              ...dynamicPermissions,
              { name: '', type: '', access: false }
            ]);
          }}>
            + Add Permission
          </Button>

        </Col>
      </Row>

      <Row>
        <Col>
          {loading ? (
            <div className="d-flex justify-content-center my-4">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (

            
            // <Table responsive bordered hover className="align-middle">
            //   <thead className="table-light">
            //     <tr>
            //       <th style={{ width: '10%' }} className="text-center">S No.</th>
            //       <th style={{ width: '35%' }}>Permission</th>
            //       <th style={{ width: '30%' }}>Type</th>
            //       <th style={{ width: '5%' }} className="text-center">Access</th>
            //       <th style={{ width: '5%' }} className="text-center">Action</th>

            //     </tr>
            //   </thead>
            //   <tbody>

            //     {dynamicPermissions.map((perm, index) => (
            //       <tr key={`dynamic-${index}`} style={{ height: '40px' }}>
            //         <td className="text-center align-middle">{index + 1}</td>

            //         <td className="align-middle">
            //           <Form.Control
            //             type="text"
            //             placeholder="Enter permission name"
            //             size="sm"
            //             className="py-0 px-1"
            //             style={{ fontSize: '0.85rem', height: '32px' }}
            //             value={perm.name}
            //             onChange={(e) =>
            //               handleDynamicChange(index, 'name', e.target.value)
            //             }
            //           />
            //         </td>

            //         <td className="align-middle">
            //           <Select
            //             options={[
            //               { label: 'navigation', value: 'navigation' },
            //               { label: 'action', value: 'action' }
            //             ]}
            //             placeholder="Select Type"
            //             value={perm.type ? { label: perm.type, value: perm.type } : null}
            //             onChange={(selected) =>
            //               handleDynamicChange(index, 'type', selected.value)
            //             }
            //             styles={{
            //               control: (base) => ({
            //                 ...base,
            //                 minHeight: '32px',
            //                 height: '32px',
            //                 fontSize: '0.85rem',
            //               }),
            //               dropdownIndicator: (base) => ({
            //                 ...base,
            //                 padding: 4,
            //               }),
            //               clearIndicator: (base) => ({
            //                 ...base,
            //                 padding: 4,
            //               }),
            //               valueContainer: (base) => ({
            //                 ...base,
            //                 padding: '0px 6px',
            //               }),
            //               input: (base) => ({
            //                 ...base,
            //                 margin: 0,
            //                 padding: 0,
            //               }),
            //             }}
            //           />
            //         </td>

            //         <td className="text-center align-middle">
                      
            //         </td>

            //         <td className="text-center align-middle">
            //           <div className="d-flex justify-content-center gap-1">
            //             <Button
            //               variant="outline-success"
            //               size="sm"
            //               className="px-1 py-0 "
            //               style={{ fontSize: '0.75rem', lineHeight: '1.2rem' }}
            //               onClick={() => handleLogPermission(index)}
            //               title="Add Permission"
            //             >
            //               Save
            //             </Button>
            //             <Button
            //               variant="outline-danger"
            //               size="sm"
            //               className="px-1 py-0 ms-2"
            //               style={{ fontSize: '0.75rem', lineHeight: '1.2rem' }}
            //               onClick={() => handleRemovePermission(index)}
            //               title="Remove Permission"
            //             >
            //               <FaTimes style={{ fontSize: '0.75rem' }} />
            //             </Button>
            //           </div>
            //         </td>
            //       </tr>

            //     ))}


            //     {permissions.length > 0 ? (
            //       permissions.map((d, i) => (
            //         <tr key={i}>
            //           <td className="text-center">{i + 1}</td>
            //           <td>{d.name}</td>
            //           <td>{d.type}</td>
            //           <td className="text-center">
            //             <input
            //               className="form-check-input"
            //               type="checkbox"
            //               style={{ width: '1.3rem', height: '1.3rem' }}
            //               checked={permission.includes(d.name)} // ✅ Check status set kiya
            //               onChange={() => handlePermissionChange(d.name)} // ✅ State update function
            //             />
            //           </td>
            //           <td><FaTrash /></td>
            //         </tr>
            //       ))
            //     ) : (
            //       <tr>
            //         <td colSpan="3" className="text-center">No permissions available.</td>
            //       </tr>
            //     )}
            //   </tbody>
            // </Table>


            <div className="table-container">
            <Table  className=" custom-table">
              <thead className="table-light sticky-header text-center">
                <tr>
                  <th style={{ width: '10%' }}>S No.</th>
                  <th style={{ width: '35%' }}>Permission</th>
                  <th style={{ width: '30%' }}>Type</th>
                  <th style={{ width: '5%' }}>Access</th>
                  <th style={{ width: '5%' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {dynamicPermissions.map((perm, index) => (
                  <tr key={`dynamic-${index}`} className="text-center">
                    <td>{index + 1}</td>
                    <td className="align-middle text-center">
                      <Form.Control
                        type="text"
                        placeholder="Enter permission name"
                        size="sm"
                        value={perm.name}
                        onChange={(e) => handleDynamicChange(index, 'name', e.target.value)}
                      />
                    </td>
                    <td className="align-middle text-center">
                      <Select
                        options={[
                          { label: 'navigation', value: 'navigation' },
                          { label: 'action', value: 'action' }
                        ]}
                        value={perm.type ? { label: perm.type, value: perm.type } : null}
                        onChange={(selected) => handleDynamicChange(index, 'type', selected.value)}
                        styles={{
                          control: (base) => ({
                            ...base,
                            minHeight: '32px',
                            height: '32px',
                            fontSize: '0.85rem',
                          }),
                          dropdownIndicator: (base) => ({
                            ...base,
                            padding: 4,
                          }),
                          clearIndicator: (base) => ({
                            ...base,
                            padding: 4,
                          }),
                          valueContainer: (base) => ({
                            ...base,
                            padding: '0px 6px',
                          }),
                          input: (base) => ({
                            ...base,
                            margin: 0,
                            padding: 0,
                          }),
                        }}
                      />
                    </td>
                    <td className="text-center align-middle">
                      {/* Add your checkbox or additional input here */}
                    </td>
                    <td className="text-center align-middle">
                      <div className="d-flex justify-content-center gap-1">
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => handleLogPermission(index)}
                        >
                          Save
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleRemovePermission(index)}
                        >
                          <FaTimes />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
      
                {permissions.length > 0 ? (
                  permissions.map((d, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td className="text-center">{d.name}</td>
                      <td className="text-center">{d.type}</td>
                      <td className="text-center">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={permission.includes(d.name)} // ✅ Check status
                          onChange={() => handlePermissionChange(d.name)} // ✅ State update
                        />
                      </td>
                      <td className="text-center">
                        <FaTrash />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">No permissions available.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          )}
        </Col>
      </Row>
      <div className="text-end">

        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : "Save User"}
        </Button>
      </div>

      <style>

        {`
        
        /* Table container for scroll and layout */
.table-container {
  max-height: 400px;              /* Height for scrollable area */
  overflow-y: auto;               /* Enable vertical scrolling */
  position: relative;
}

/* Remove borders from all sides except the bottom */
.custom-table,
.custom-table td,
.custom-table th {
  border: none !important;
  border-bottom: 1px solid #dee2e6 !important; /* Only bottom border */
}

/* Sticky header that stays on top when scrolling */
.sticky-header th {
  position: sticky;
  top: 0;
  background-color: var(--bs-table-bg); /* Keep the Bootstrap light background color */
  z-index: 10;
}

/* Center the Permission and Type columns */
.custom-table td.text-center {
  text-align: center;
}

/* Optional: Styling the hover effect */
.custom-table tbody tr:hover {
  background-color: #f1f1f1;
}

/* Optional: Custom scrollbar */
.table-container::-webkit-scrollbar {
  width: 8px;
}

.table-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.table-container::-webkit-scrollbar-thumb {
  background-color: #c1c1c1;
  border-radius: 4px;
}

/* Center the # column (S No.) */
.custom-table td:first-child,
.custom-table th:first-child {
  text-align: center;
}



        `}
      </style>
    </Form>
  );
};

export default TeamForm;
