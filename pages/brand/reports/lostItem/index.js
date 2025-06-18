import Cookies from "js-cookie";
import Select from "react-select";
import React, { useEffect, useState } from "react";
import { Card, Col, Container, Row, Spinner } from "react-bootstrap";

export default function LostItem() {
  const [lostItemStats, setLostItemStats] = useState([]);
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState([]);

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
  }, [tokenData]);

  const fetchData = async (brandId) => {
    setLoading(true);
    setLostItemStats([]); // ✅ Clear old data before fetch

    try {
      let requestUrl = `/api/brand/kpis?action=get_lostitem_data`;

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
   

      const formattedData = data.data.map((item) => ({
        date: new Date(item.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        lostItemCount: item.lost_items_count,
      }));

      setLostItemStats(formattedData); // ✅ Even if empty, clears old data
    } catch (error) {
      console.log("error fetching lost item data: ", error);
    } finally {
      setLoading(false);
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

    if (selectedOption) {
      // ✅ User selected a brand → fetch for that brand
      fetchData(selectedOption.value);
   
    } else {
      // ❌ selectedOption is null (i.e. cleared)
      // ✅ Show default brand data (tokenData.brand_id)
      fetchData();
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
          <h3>Lost & Found Trends Over Time</h3>
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
                  maxHeight: "300px",
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
                      <th>Lost Items Count</th>

                    </tr>
                  </thead>
                  <tbody>
                    {lostItemStats.length > 0 ? (
                      lostItemStats.map((item, index) => (
                        <tr key={index} className="border border-gray-300">
                          <td className="border border-gray-300 p-2">
                            {index + 1}
                          </td>
                          <td className="border border-gray-300 p-2">
                            {item.date}
                          </td>
                          <td className="border border-gray-300 p-2">
                            {item.lostItemCount}
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
        </Card.Body>
      </Card>
       */}

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
            maxHeight: "300px",
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
                backgroundColor: "#f8f9fa", // Light Bootstrap bg
              }}
            >
              <tr className="text-center text-xs">
                <th className="py-3 fw-semibold border-bottom">#</th>
                <th className="py-3 fw-semibold border-bottom">Date</th>
                <th className="py-3 fw-semibold border-bottom">Lost Items Count</th>
              </tr>
            </thead>
            <tbody>
              {lostItemStats.length > 0 ? (
                lostItemStats.map((item, index) => (
                  <tr key={index} className="text-center">
                    <td className="py-3 border-top">{index + 1}</td>
                    <td className="py-3 border-top">{item.date}</td>
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
      </>
    )}
  </Card.Body>
</Card>

    </Container>
  );
}
