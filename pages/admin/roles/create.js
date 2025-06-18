import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Container, Row, Form, Spinner, Alert, Table } from 'react-bootstrap';
import { MdOutlineKeyboardBackspace } from 'react-icons/md';
import axios from 'axios';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import Select from 'react-select';
import { DashboardMenu } from '../../../routes/DashboardRoutes';
import TeamForm from './TeamForm';
import { FaCross, FaTimes, FaTrash } from 'react-icons/fa';


const CreateUser = () => {
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [tokenData, setTokenData] = useState();
  const [permission, setPermission] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [dynamicPermissions, setDynamicPermissions] = useState([]);

  let router = useRouter();

  function decodeJWT(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.log("error fetching token ", error);
      return null;
    }

  }

  useEffect(() => {
    setTokenData(decodeJWT(Cookies.get('adminToken')));
    getPermissions();
  }, []);

  const validateFields = () => {
    const errors = {};
    if (!role.trim()) errors.role = 'Role is required.';
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
    setPermission((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
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
      name: role,
      created_by: tokenData.id,
      permissions: permission
    };




    setLoading(true);
    try {
      if (permission.length > 0) {
        await axios.post('/api/admin/roles', userData);
        router.push('/admin/roles');
      } else {
        setError("Please Select Any Checkbox")
        setTimeout(() => {
          setError(false)
        }, 2000);
      }


    } catch (err) {
      console.log("error saveing user", error);
      setError(err.response?.data?.message || 'An error occurred while saving the user.');
    } finally {
      setLoading(false);
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
    <Container fluid className="" style={{ width: '95%' }}>
      <Row className="align-items-center my-3">
        <Col>
          <h3>Add Roles</h3>
        </Col>
        <Col className="text-end">
          <Link href="/admin/roles" passHref>
            <Button  style={{ backgroundColor: '#a22191', border: 'none' }}>
              <MdOutlineKeyboardBackspace className="me-2 fs-4" />Back
            </Button>
          </Link>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            {error && <Alert variant="danger">{error}</Alert>}
            <Row >
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    isInvalid={!!validationErrors.role}
                    placeholder='Enter your name '
                  />
                  {validationErrors.role && (
                    <Form.Control.Feedback type="invalid">
                      {validationErrors.role}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col >

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
            {/* <Button variant="primary" type="submit" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : 'Save Role'}
            </Button> */}
          </Form>

          {loading ? (
            <div className="d-flex justify-content-center my-4">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (


            // <Table responsive bordered hover className="align-middle mt-4">
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
            //               checked={permission.includes(d.name)} // ❌ d.title → ✅ d.name
            //               onChange={() => handlePermissionChange(d.name)} // ❌ d.title → ✅ d.name
            //             />

            //           </td>
            //           <td className='text-center'><FaTrash /></td>
            //         </tr>
            //       ))
            //     ) : (
            //       <tr>
            //         <td colSpan="3" className="text-center">No permissions available.</td>
            //       </tr>
            //     )}
            //   </tbody>


            // </Table>
          
            <div style={{
              maxHeight: "300px",
              overflowY: "auto",
              position: "relative",
            }}> 
            <table className="table align-middle mb-0 mt-0">
            <thead
              className="table-light"
              style={{
                position: "sticky",
                top: 0,
                zIndex: 100,
                backgroundColor: "#f8f9fa",
              }}
            >
              <tr className="text-center text-xs">
                <th className="py-3 fw-semibold border-bottom" style={{ width: '10%' }}>S No.</th>
                <th className="py-3 fw-semibold border-bottom" style={{ width: '35%' }}>Permission</th>
                <th className="py-3 fw-semibold border-bottom" style={{ width: '30%' }}>Type</th>
                <th className="py-3 fw-semibold border-bottom" style={{ width: '5%' }}>Access</th>
                <th className="py-3 fw-semibold border-bottom" style={{ width: '5%' }}>Action</th>
              </tr>
            </thead>
          
            <tbody>
              {dynamicPermissions.map((perm, index) => (
                <tr key={`dynamic-${index}`} style={{ height: '40px' }}>
                  <td className="text-center align-middle">{index + 1}</td>
          
                  <td className="text-center align-middle">
                    <Form.Control
                      type="text"
                      placeholder="Enter permission name"
                      size="sm"
                      className="py-0 px-1 text-center"
                      style={{ fontSize: '0.85rem', height: '32px' }}
                      value={perm.name}
                      onChange={(e) =>
                        handleDynamicChange(index, 'name', e.target.value)
                      }
                    />
                  </td>
          
                  <td className="text-center align-middle">
                    <div className="d-flex justify-content-center">
                      <Select
                        options={[
                          { label: 'navigation', value: 'navigation' },
                          { label: 'action', value: 'action' }
                        ]}
                        placeholder="Select Type"
                        value={perm.type ? { label: perm.type, value: perm.type } : null}
                        onChange={(selected) =>
                          handleDynamicChange(index, 'type', selected.value)
                        }
                        styles={{
                          control: (base) => ({
                            ...base,
                            minHeight: '32px',
                            height: '32px',
                            fontSize: '0.85rem',
                            textAlign: 'center'
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
                            textAlign: 'center'
                          }),
                        }}
                      />
                    </div>
                  </td>
          
                  <td className="text-center align-middle"></td>
          
                  <td className="text-center align-middle">
                    <div className="d-flex justify-content-center gap-1">
                      <Button
                        variant="outline-success"
                        size="sm"
                        className="px-1 py-0"
                        style={{ fontSize: '0.75rem', lineHeight: '1.2rem' }}
                        onClick={() => handleLogPermission(index)}
                        title="Add Permission"
                      >
                        Save
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="px-1 py-0 ms-2"
                        style={{ fontSize: '0.75rem', lineHeight: '1.2rem' }}
                        onClick={() => handleRemovePermission(index)}
                        title="Remove Permission"
                      >
                        <FaTimes style={{ fontSize: '0.75rem' }} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
          
              {permissions.length > 0 ? (
                permissions.map((d, i) => (
                  <tr key={i}>
                    <td className="text-center align-middle">{i + 1}</td>
                    <td className="text-center align-middle">{d.name}</td>
                    <td className="text-center align-middle">{d.type}</td>
                    <td className="text-center align-middle">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        style={{ width: '1.3rem', height: '1.3rem' }}
                        checked={permission.includes(d.name)}
                        onChange={() => handlePermissionChange(d.name)}
                      />
                    </td>
                    <td className="text-center align-middle">
                      <FaTrash />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">
                    No permissions available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        

          )}

          <div className="text-end mt-4">
            <Button  style={{ backgroundColor: '#a22191', border: 'none' }} onClick={handleSubmit} disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : 'Save Role'}
            </Button>
          </div>

        </Card.Body>
      </Card>
    </Container>
    // <Container fluid className='p-6'>
    //   <Row className="align-items-center my-4">
    //     <Col>
    //       <h3>Add Role</h3>
    //     </Col>
    //     <Col className="text-end">
    //       <Link href="/admin/roles" passHref>
    //         <Button variant="danger" className=""> <MdOutlineKeyboardBackspace className="me-2 fs-4" />Back</Button>
    //       </Link>
    //     </Col>
    //   </Row>
    //   <Card className="shadow-sm">
    //     <Card.Body>
    //       <TeamForm />
    //     </Card.Body>
    //   </Card>

    // </Container>
  );
};

export default CreateUser;
