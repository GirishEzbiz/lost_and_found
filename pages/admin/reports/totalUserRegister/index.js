import Cookies from "js-cookie";
import { Card, Col, Container, Pagination, Row, Spinner } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import Select from 'react-select';
import { dateFormat } from "utils/dateFormat";



export default function TotalUserRegister() {
    const [userStats, setUserStats] = useState([]);
    const [tokenData, setTokenData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [brands, setBrands] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = Cookies.get("Page-limit") || 10;
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [totalRecord, setTotalRecord] = useState(0)
    const [viewMode, setViewMode] = useState("date"); // default: date-wise



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
        } catch (error) {
            console.log("error fewtching token ", error);
            return null;
        }

    }

    useEffect(() => {
        const token = Cookies.get("adminToken");
        if (token) {
            setTokenData(decodeJWT(token));
        }
    }, []);

    useEffect(() => {
        if (tokenData) {
            fetchData(selectedBrand?.value || tokenData.brand_id, currentPage);
            fetchBrands();
        }
    }, [tokenData, currentPage, selectedBrand]);


    const fetchData = async (brandId, page) => {
        setLoading(true);
        setUserStats([]); // ✅ Clear old data before new fetch

        try {
            let response;
            let requestUrl = `/api/brand/kpis?action=total_user_reg_data&limit=${itemsPerPage}&page=${page}`;

            if (brandId) {
                requestUrl += `&brandId=${brandId}`;
            } else {
                requestUrl += `&brandId=${tokenData.brand_id}`;
            }

            response = await fetch(requestUrl);

            if (!response.ok) {
                throw new Error(`Failed to fetch brand KPIs. Status: ${response.status}`);
            }
            const dd = await response.json();
            const data = dd.data;
            console.log("data", data);

            if (!Array.isArray(data)) {
                throw new Error("Unexpected data format received");
            }

            const formattedData = data.map((item) => ({
                date: item.date, // ✅ Keep raw date, don't format here
                registeredUsers: item.users_registered
            }));


            setUserStats(formattedData);
            setTotalPages(Math.ceil(dd.total / itemsPerPage));
            setTotalRecord(dd.total)
        } catch (error) {
            console.error("Error fetching data: ", error.message);
        } finally {
            setLoading(false);
        }
    };



    const fetchBrands = async () => {
        try {
            let response = await fetch(`/api/admin/brands`);

            let data = await response.json();

            setBrands(data?.brands);
        } catch (error) {

        }
    }


    // Transform brands to match react-select's option format
    const brandOptions = brands.map(brand => ({
        value: brand.id,
        label: brand.name
    }));
    const dateTimeFormat = (dt) => {
        if (!dt || isNaN(new Date(dt).getTime())) return "-";
        return new Date(dt).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    const handleSelectChange = (selectedOption) => {
        setSelectedBrand(selectedOption);
        setCurrentPage(1);  // ✅ Reset page to 1 on brand change
        // ✅ Don't manually call fetchData here, useEffect will handle it now!
    };



    // Custom styles for the react-select dropdown
    // const customSelectStyles = {
    //     menu: (provided) => ({
    //         ...provided,
    //         zIndex: 1050,  // Ensures the dropdown is above other elements like the card
    //     }),
    // };
    const handlePageChange = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };


    const displayedStats =
        viewMode === "month"
            ? Object.values(
                userStats.reduce((acc, item) => {
                    const key = new Date(item.date).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        month: "short",
                        year: "numeric",
                    });
                    acc[key] = acc[key] || { label: key, registeredUsers: 0 };
                    acc[key].registeredUsers += item.registeredUsers;
                    return acc;
                }, {})
            )
            : userStats;


    return (

        <Container fluid className="p-2" style={{ width: "95%" }}>
            <Row className="align-items-center my-2">
                <Col>
                    <h3>Total User Register</h3>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                        This page displays when and how many users registered over time.
                    </p>

                </Col>
                <Col>
                    <Select

                        isClearable={true}
                        options={brandOptions} // Pass the transformed options to the Select component
                        value={selectedBrand}   // Value is controlled by state
                        onChange={handleSelectChange} // Handle the selection
                        placeholder="Select a Brand"

                        className="w-50 float-end"
                    />
                </Col>


            </Row>


            <Card className="shadow-sm mt-4">
                <Card.Body className="p-0">
                    <Row>
                        <Col>
                            <span className="mt-4 ms-2 p-0">Showing {userStats.length} out of {totalRecord}</span>
                        </Col>


                        <Col xs="auto" style={{ padding: "5px", marginRight: "10px" }}>
                            <Select
                                options={[
                                    { value: "date", label: "Date-wise" },
                                    { value: "month", label: "Month-wise" },
                                ]}
                                value={{ value: viewMode, label: viewMode === "date" ? "Date-wise" : "Month-wise" }}
                                onChange={(selected) => setViewMode(selected.value)}
                                className="w-100"
                            />
                        </Col>

                    </Row>

                    {loading ? (
                        <div className="d-flex justify-content-center my-5">
                            <Spinner animation="border" variant="primary" />
                        </div>
                    ) : (
                        <>
                            <div
                                className="table-responsive"
                                style={{ maxHeight: "300px", overflowY: "auto", position: "relative", width: "100%" }}
                            >
                                <table
                                    className="table  align-middle mb-0"
                                    style={{
                                        borderCollapse: "collapse",
                                        width: "100%",
                                        margin: "0 auto",
                                    }}
                                >
                                    <thead
                                        className="table-light"
                                        style={{
                                            position: "sticky",
                                            top: 0,
                                            zIndex: 0,
                                            background: "white",
                                        }}
                                    >
                                        <tr className="text-center">
                                            <th className="py-3 fw-semibold border-bottom">#</th>
                                            <th className="py-3 fw-semibold border-bottom">Month</th>
                                            <th className="py-3 fw-semibold border-bottom">Registered Users</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userStats.length > 0 ? (
                                            displayedStats.map((item, index) => {
                                                console.log("item", item)
                                                return (
                                                    <tr key={index} className="text-center">
                                                        <td className="py-3 border-top">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                        <td className="py-3 border-top">
                                                            {viewMode === "month"
                                                                ? item.label
                                                                : new Date(item.date).toLocaleString("en-IN", {
                                                                    timeZone: "Asia/Kolkata",
                                                                    day: "2-digit",
                                                                    month: "short",
                                                                    year: "numeric",
                                                                   
                                                                })}
                                                        </td>

                                                        <td className="py-3 border-top">{item.registeredUsers}</td>
                                                    </tr>
                                                )
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={3} className="text-center text-muted py-4">
                                                    No data available
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="d-flex justify-content-end">
                                <Pagination className="justify-content-end p-2 custom-pagination">
                                    <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                                    <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                                    {Array.from({ length: totalPages }, (_, index) => index + 1)
                                        .filter(page => page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2))
                                        .reduce((acc, page, index, arr) => {
                                            const prev = arr[index - 1];
                                            if (prev && page - prev > 1) {
                                                acc.push(<Pagination.Ellipsis key={`ellipsis-${page}`} disabled />);
                                            }
                                            acc.push(
                                                <Pagination.Item key={page} active={page === currentPage} onClick={() => handlePageChange(page)}>
                                                    {page}
                                                </Pagination.Item>
                                            );
                                            return acc;
                                        }, [])}
                                    <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                                    <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
                                </Pagination>
                                <style jsx global>
              {`
              
              /* Change background of active button */
.custom-pagination .page-item.active .page-link {
  background-color: #A22191; /* Bootstrap magenta color */
  border: none;
  color: white;
}
              `}

              </style>

                            </div>

                        </>
                    )}
                </Card.Body>
            </Card>

        </Container>
    );
}
