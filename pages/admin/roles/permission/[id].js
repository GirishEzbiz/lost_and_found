import { Button, Card, Col, Container, Row, Spinner, Table } from 'react-bootstrap'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Cookies from 'js-cookie';
import axios from 'axios';
import { DashboardMenu } from "../../../../routes/DashboardRoutes";


export default function Permission() {
    const [tokenData, setTokenData] = useState();
    const router = useRouter()
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { id } = router.query;
    const [datas, setDatas] = useState(null);

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
        } catch (err) {
            console.log("error fewtching token ", error);
            return null;
        }
    }

    useEffect(() => {
        setTokenData(decodeJWT(Cookies.get('adminToken')));
    }, []);

    const fetchUser = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`/api/admin/roles`, {
                params: { id: id },
            });
            setDatas(data);
        } catch (err) {
            console.log("error fewtching role data ", error);
            setError("Failed to fetch roles data.");
        }
         finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchUser();
        }
    }, [id]);

    return (
        <Container fluid className="p-4 mt-4">
            <Row className="align-items-center mb-2">
                <Col><h3 > {datas?.name}</h3></Col>
                <Col md={2} className="text-end">
                    <Button variant="secondary"  onClick={() => router.push('/admin/roles')}>Back</Button>
                </Col>
            </Row>

            <Card className="shadow-sm">
                {/* <Card.Header className="bg-light">
                    <h5 className="mb-0 p-2 text-secondary">Permissions</h5>
                </Card.Header> */}

                <Card.Body>
                    {loading ? (
                        <div className="d-flex justify-content-center my-4">
                            <Spinner animation="border" variant="primary" />
                        </div>
                    ) : (
                        <Table responsive bordered hover className="align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th style={{ width: '10%' }} className="text-center">S No.</th>
                                    <th style={{ width: '70%' }}>Permission</th>
                                    <th style={{ width: '20%' }} className="text-center">Access</th>
                                </tr>
                            </thead>
                            <tbody>
                                {DashboardMenu.length > 0 ? (
                                    DashboardMenu.map((d, i) => (
                                        <tr key={i}>
                                            <td className="text-center">{i + 1}</td>
                                            <td>{d.title}</td>
                                            <td className="text-center">
                                                <input className="form-check-input" type="checkbox" style={{ width: '1.3rem', height: '1.3rem' }} />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="text-center">No permissions available.</td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}
