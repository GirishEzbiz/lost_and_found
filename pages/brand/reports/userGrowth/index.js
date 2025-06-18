import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import Select from "react-select";

import {
  Card,
  Col,
  Container,
  Pagination,
  Row,
  Spinner,
} from "react-bootstrap";

export default function UserGrowth() {
  const [userGrowthStats, setUserGrowthStats] = useState([]);
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // const itemsPerPage = Cookies.get("Page-limit");
  const itemsPerPage = 2;

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
      fetchData();
      fetchBrands();
    }
  }, [tokenData, currentPage]);
  const fetchData = async (brandId = null, page = 1) => {
    setLoading(true);
    setUserGrowthStats([]); // ✅ Clear old data before new fetch
    setTotalPages(0); // ✅ Reset pagination if needed

    try {
      let requestUrl = `/api/brand/kpis?action=get_user_growth&page=${page}&limit=${itemsPerPage}`;

      if (brandId) {
        requestUrl += `&brandId=${brandId}`;
      } else {
        requestUrl += `&brandId=${tokenData.brand_id}`;
      }

      const response = await fetch(requestUrl);

      if (!response.ok) {
        throw new Error("Failed to fetch brand KPIs");
      }

      const result = await response.json();

      const formattedData = result.data.map((item) => ({
        date: new Date(item.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        userGrowth: item.user_growth,
      }));

      setUserGrowthStats(formattedData);
      setTotalPages(Math.ceil(result.total / itemsPerPage));
    } catch (error) {
      console.log("error fetching user growth data: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      fetchData(selectedBrand?.value || tokenData.brand_id, pageNumber);
    }
  };

  const fetchBrands = async () => {
    try {
      let response = await fetch(`/api/admin/brands`);

      let data = await response.json();

      setBrands(data?.brands);
    } catch (error) {}
  };

  const [selectedBrand, setSelectedBrand] = useState(null);

  // Transform brands to match react-select's option format
  const brandOptions = brands.map((brand) => ({
    value: brand.id,
    label: brand.name,
  }));

  const handleSelectChange = (selectedOption) => {
    setSelectedBrand(selectedOption);
    const brandId = selectedOption?.value || null;

    // Always reset to first page on brand change
    setCurrentPage(1);
    fetchData(brandId, 1);

    if (selectedOption) {
     
    } else {
      // console.log("Brand selection cleared. Showing default brand data.");
    }
  };

  // Custom styles for the react-select dropdown
  const customSelectStyles = {
    menu: (provided) => ({
      ...provided,
      zIndex: 1050, // Ensures the dropdown is above other elements like the card
    }),
  };

  return (
    <Container fluid className="p-2" style={{ width: "95%" }}>
      <Row className="align-items-center my-2">
        <Col>
          <h3>User Growth Over Time</h3>
        </Col>
      </Row>

{/* 
      <Card className="shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="d-flex justify-content-center my-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <>
              <div
                className="table-responsive"
                style={{
                  maxHeight: "455px",
                  overflowY: "auto",
                  position: "relative",
                  width: "100%",
                }}
              >
                <table
                  className="text-nowrap table-centered mt-0 table"
                  style={{
                    borderCollapse: "separate",
                    borderSpacing: 0,
                    width: "100%",
                    margin: "0 auto",
                  }}
                >
                  <thead
                    className="table-light"
                    style={{
                      position: "sticky",
                      top: 0,
                      zIndex: 100,
                      background: "white",
                    }}
                  >
                    <tr>
                      <th>#</th>
                      <th>Date</th>
                      <th>User Growth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userGrowthStats.length > 0 ? (
                      userGrowthStats.map((item, index) => (
                        <tr key={index} className="border border-gray-300">
                          <td className="border border-gray-300 p-2">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td className="border border-gray-300 p-2">
                            {item.date}
                          </td>
                          <td className="border border-gray-300 p-2">
                            {item.userGrowth}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="text-center text-muted py-3">
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

     
          {totalPages > 1 && (
            <Pagination className="justify-content-end p-2">
              <Pagination.First
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              />
              <Pagination.Prev
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              />

              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .filter((page) => {
                  return (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 2 && page <= currentPage + 2)
                  );
                })
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
          )}
        </Card.Body>
      </Card> */}


<Card className="shadow-sm">
  <Card.Body className="p-0">
    {loading ? (
      <div className="d-flex justify-content-center my-5">
        <Spinner animation="border" variant="primary" />
      </div>
    ) : (
      <>
      <style>
    {`
      /* For WebKit (Chrome, Edge, Safari) */
::-webkit-scrollbar {
  height: 8px;
  width: 9px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1; /* Light background */
}

::-webkit-scrollbar-thumb {
  background-color: #c1c1c1;  /* Light gray handle */
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a0a0a0;
}
    `}
  </style>
        <div
          className="table-responsive"
          style={{
            maxHeight: "455px",
            overflowY: "auto",
            position: "relative",
            width: "100%",
          }}
        >
          <table
            className="table align-middle mb-0"
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
                zIndex: 100,
                backgroundColor: "#f8f9fa",
              }}
            >
              <tr className="text-center text-xs">
                <th className="py-3 fw-semibold border-bottom">#</th>
                <th className="py-3 fw-semibold border-bottom">Date</th>
                <th className="py-3 fw-semibold border-bottom">User Growth</th>
              </tr>
            </thead>
            <tbody>
              {userGrowthStats.length > 0 ? (
                userGrowthStats.map((item, index) => (
                  <tr key={index} className="text-center">
                    <td className="py-3 border-top">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="py-3 border-top">{item.date}</td>
                    <td className="py-3 border-top">{item.userGrowth}</td>
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
      </>
    )}

    {totalPages > 1 && (
      <Pagination className="justify-content-end p-2">
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
    )}
  </Card.Body>
</Card>


    </Container>
  );
}
