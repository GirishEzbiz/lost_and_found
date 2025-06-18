import Cookies from "js-cookie";
import Select from "react-select";
import React, { useEffect, useState } from "react";
import { Card, Col, Container, Pagination, Row, Spinner } from "react-bootstrap";

export default function LostItem() {
    const [lostItemStats, setLostItemStats] = useState([]);
    const [tokenData, setTokenData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [brands, setBrands] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecord, setTotalRecord] = useState(0);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [viewMode, setViewMode] = useState("date");

    const itemsPerPage = Cookies.get("Page-limit") || 10;

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
        setLostItemStats([]);

        try {
            let requestUrl = `/api/brand/kpis?action=get_lostitem_data&limit=${itemsPerPage}&page=${page}`;
            requestUrl += `&brandId=${brandId}`;
            const response = await fetch(requestUrl);
            if (!response.ok) throw new Error("Failed to fetch brand KPIs");

            const result = await response.json();
            const data = result.data;

            const formattedData = data.map((item) => ({
                date: item.date, // keep raw date
                lostItemCount: item.lost_items_count
            }));

            setLostItemStats(formattedData);
            setTotalPages(Math.ceil(result.total / itemsPerPage));
            setTotalRecord(result.total);
        } catch (error) {
            console.log("error fetching lost item data: ", error);
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
            console.error("Error fetching brands", error);
        }
    };

    const brandOptions = brands.map(brand => ({
        value: brand.id,
        label: brand.name
    }));

    const handleSelectChange = (selectedOption) => {
        setSelectedBrand(selectedOption);
        setCurrentPage(1);
    };

    const handlePageChange = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const formatDateIST = (dt) => {
        if (!dt || isNaN(new Date(dt).getTime())) return "-";
        return new Date(dt).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            day: '2-digit',
            month: 'short',
            year: 'numeric',
           
        });
    };

    const displayedStats =
        viewMode === "month"
            ? Object.values(
                lostItemStats.reduce((acc, item) => {
                    const key = new Date(item.date).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        month: "short",
                        year: "numeric"
                    });
                    acc[key] = acc[key] || { label: key, lostItemCount: 0 };
                    acc[key].lostItemCount += Number(item.lostItemCount || 0);
                    return acc;
                }, {})
            )
            : lostItemStats;

    return (
        <Container fluid className="p-2" style={{ width: "95%" }}>
            <Row className="align-items-center my-2">
                <Col>
                    <h3>Lost & Found Trends Over Time</h3>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                        This page displays how many items were reported lost over time.
                    </p>
                </Col>
                <Col>
                    <Select
                        isClearable
                        options={brandOptions}
                        value={selectedBrand}
                        onChange={handleSelectChange}
                        placeholder="Select a Brand"
                        className="w-50 float-end"
                    />
                </Col>
            </Row>

            <Card className="shadow-sm">
                <Card.Body className="p-0">
                    <Row>
                        <Col>
                            <span className="mt-4 ms-2 p-0">
                                Showing {displayedStats.length} out of {viewMode === "month" ? displayedStats.length : totalRecord}
                            </span>
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
                            <div className="table-responsive" style={{ maxHeight: "300px", overflowY: "auto", position: "relative" }}>
                                <table className="table align-middle mb-0" style={{ borderCollapse: "collapse", width: "100%" }}>
                                    <thead className="table-light" style={{ position: "sticky", top: 0, background: "white" }}>
                                        <tr className="text-center">
                                            <th className="py-3 fw-semibold border-bottom">#</th>
                                            <th className="py-3 fw-semibold border-bottom">Date</th>
                                            <th className="py-3 fw-semibold border-bottom">Lost Items Count</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayedStats.length > 0 ? (
                                            displayedStats.map((item, index) => (
                                                <tr key={index} className="text-center">
                                                    <td className="py-3 border-top">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                    <td className="py-3 border-top">
                                                        {viewMode === "month" ? item.label : formatDateIST(item.date)}
                                                    </td>
                                                    <td className="py-3 border-top">{item.lostItemCount}</td>
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
                                <Pagination className="justify-content-end p-2  custom-pagination">
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
