import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import { Card, Col, Container, Row, Spinner, Pagination } from "react-bootstrap";
import Select from "react-select";

export default function GeoTrend() {
    const [geoTrendStats, setGeoTrendStats] = useState([]);
    const [tokenData, setTokenData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [brands, setBrands] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = Cookies.get("Page-limit") || 10;
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
        try {
            let requestUrl = `/api/brand/kpis?action=get_geo_trend&limit=${itemsPerPage}&page=${page}`;

            if (brandId) {
                requestUrl += `&brandId=${brandId}`;
            } else {
                requestUrl += `&brandId=${tokenData.brand_id}`;
            }

            const response = await fetch(requestUrl);
            if (!response.ok) throw new Error("Failed to fetch Geo Trend");

            const data = await response.json();
            const formatted = data.data.map((item, index) => ({
                id: index + 1,
                city: item.city,
                region: item.region_name,
                country: item.country_name,
                lostReports: item.lost_reports,
            }));

            setGeoTrendStats(formatted);
            setTotalPages(Math.ceil(data.total / itemsPerPage)); // Set total pages based on total count
            setTotalRecord(data.total)
        } catch (error) {
            console.log("Error fetching Geo Trend", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBrands = async () => {
        try {
            const response = await fetch(`/api/admin/brands`);
            const data = await response.json();
            setBrands(data?.brands);
        } catch (error) {
            console.log("Error fetching brands", error);
        }
    };

    const handleBrandChange = (selectedOption) => {
        setSelectedBrand(selectedOption);
        setCurrentPage(1); // Reset to page 1 on brand change
    };

    const handlePageChange = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const brandOptions = brands.map((brand) => ({
        value: brand.id,
        label: brand.name,
    }));

    return (
        <Container fluid className="p-2" style={{ width: "95%" }}>
            <Row className="align-items-center my-2">
                <Col>
                    <h3>Geo Trend</h3>
                    <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
                        Shows location-wise trend of lost item reports.
                    </p>
                </Col>

                <Col>
                    <Select
                        isClearable
                        options={brandOptions}
                        value={selectedBrand}
                        onChange={handleBrandChange}
                        placeholder="Filter by Brand"
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
                                <span className="mt-4 ms-2">Showing {geoTrendStats.length} out of {totalRecord} </span>

                                <table className="table align-middle mb-0" style={{ borderCollapse: "collapse", width: "100%", margin: "0 auto" }}>
                                    <thead className="table-light" style={{ position: "sticky", top: 0, background: "white" }}>
                                        <tr className="text-center">
                                            <th className="px-5 py-3 fw-semibold border-bottom">#</th>
                                            <th className="px-5 py-3 fw-semibold border-bottom">City</th>
                                            <th className="px-5 py-3 fw-semibold border-bottom">Region</th>
                                            <th className="px-5 py-3 fw-semibold border-bottom">Country</th>
                                            <th className="px-5 py-3 fw-semibold border-bottom">Lost Reports</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {geoTrendStats.length > 0 ? (
                                            geoTrendStats.map((item, index) => (
                                                <tr key={item.id} className="text-center hover:bg-gray-50 transition">
                                                    <td className="px-5 py-2 border-b text-gray-800">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                    <td className="px-5 py-2 border-b text-gray-800">{item.city}</td>
                                                    <td className="px-5 py-2 border-b text-gray-800">{item.region}</td>
                                                    <td className="px-5 py-2 border-b text-gray-800">{item.country}</td>
                                                    <td className="px-5 py-2 border-b text-gray-800">{item.lostReports}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-2 text-center text-gray-500 border-b">
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
