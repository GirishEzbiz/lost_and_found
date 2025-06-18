import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { Card, Col, Container, Row, Spinner, Pagination } from "react-bootstrap";

export default function EngagementInsight() {
    const [engagementInsight, setEngagementInsight] = useState([]);
    const [tokenData, setTokenData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [brands, setBrands] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = Cookies.get("Page-limit") || 10;  // Default 10 items per page
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [totalRecord, setTotalRecord] = useState(0)

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
            console.log("error fetching token ", error);
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
        setEngagementInsight([]); // ✅ Clear previous data before fetching

        try {
            let requestUrl = `/api/brand/kpis?action=get_engagement_insight&limit=${itemsPerPage}&page=${page}`;

            if (brandId) {
                requestUrl += `&brandId=${brandId}`;
            } else {
                requestUrl += `&brandId=${tokenData.brand_id}`;
            }

            const response = await fetch(requestUrl);

            if (!response.ok) {
                throw new Error("Failed to fetch brand KPIs");
            }

            const data = await response.json();
            console.log("data", data)
            const formattedData = data?.data?.filter(item => item.recovery_success_rate != null)
                .map((item) => ({
                    metric: "Success Rate",
                    value: (parseFloat(item.recovery_success_rate) / 100).toFixed(2) + "%",
                    speed: item.recovery_speed_days != null ? parseFloat(item.recovery_speed_days).toFixed(2) + " Days" : "N/A"
                }));

            setEngagementInsight(formattedData);
            setTotalPages(Math.ceil(data.total / itemsPerPage)); // Set total pages from response
            setTotalRecord(formattedData.length)
        } catch (error) {
            console.log("error fetching engagement insight: ", error);
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
            console.error("Error fetching brands", error);
        }
    };

    const brandOptions = brands.map(brand => ({
        value: brand.id,
        label: brand.name
    }));

    const handleSelectChange = (selectedOption) => {
        setSelectedBrand(selectedOption);
        setCurrentPage(1);  // Reset to page 1 on brand change
    };

    const handlePageChange = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    return (
        <Container fluid className="p-2" style={{ width: "95%" }}>
            <Row className="align-items-center my-2">
                <Col>
                    <h3>Engagement Insight</h3>
                    <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
                        Shows user interaction patterns across time.
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

            <Card className="shadow-sm">
                <Card.Body className="p-0">
                    {loading ? (
                        <div className="d-flex justify-content-center my-5">
                            <Spinner animation="border" variant="primary" />
                        </div>
                    ) : (
                        <>
                            <div className="table-responsive" style={{ maxHeight: "300px", overflowY: "auto", position: "relative", width: "100%" }}>
                                <span className="mt-2 ms-2">Showing {engagementInsight.length} out of {totalRecord} </span>

                                <table className="table align-middle mb-0" style={{ borderCollapse: "collapse", width: "100%", margin: "0 auto" }}>
                                    <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 0, background: "white" }}>
                                        <tr className="text-center">
                                            <th className="py-3 fw-semibold border-bottom">#</th>
                                            <th className="py-3 fw-semibold border-bottom">Metric</th>
                                            <th className="py-3 fw-semibold border-bottom">Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {engagementInsight.length > 0 ? (
                                            engagementInsight.map((item, index) => (
                                                <tr key={index} className="text-center">
                                                    <td className="py-3 border-top">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                    <td className="py-3 border-top">{item.metric}</td>
                                                    <td className="py-3 border-top">{item.value}</td>
                                                </tr>
                                            ))
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
                                {/* Pagination */}

                                <Pagination className="justify-content-end p-2 custom-pagination">
                                    <Pagination.First
                                        onClick={() => handlePageChange(1)}
                                        disabled={currentPage === 1}
                                    />
                                    <Pagination.Prev
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    />
                                    {Array.from({ length: totalPages }, (_, index) => index + 1)
                                        .filter(
                                            (page) =>
                                                page === 1 ||
                                                page === totalPages ||
                                                (page >= currentPage - 2 && page <= currentPage + 2)
                                        )
                                        .reduce((acc, page, index, arr) => {
                                            const prev = arr[index - 1];
                                            if (prev && page - prev > 1) {
                                                acc.push(
                                                    <Pagination.Ellipsis key={`ellipsis-${page}`} disabled />
                                                );
                                            }
                                            acc.push(
                                                <Pagination.Item
                                                    key={page}
                                                    active={page === currentPage}
                                                    onClick={() => handlePageChange(page)}
                                                >
                                                    {page}
                                                </Pagination.Item>
                                            );
                                            return acc;
                                        }, [])}
                                    <Pagination.Next
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    />
                                    <Pagination.Last
                                        onClick={() => handlePageChange(totalPages)}
                                        disabled={currentPage === totalPages}
                                    />
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
