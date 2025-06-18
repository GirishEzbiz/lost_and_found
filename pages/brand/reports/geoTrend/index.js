import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import { Card, Col, Container, Row, Spinner } from "react-bootstrap";
import Select from "react-select";

export default function GeoTrend() {
  const [geoTrendStats, setGeoTrendStats] = useState([]);
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);

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
    }
  }, [tokenData]);

  const fetchData = async (brandId) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/brand/kpis?action=get_geo_trend&brandId=${
          brandId || tokenData.brand_id
        }`
      );
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
    if (selectedOption) {
      fetchData(selectedOption.value);
    } else {
      fetchData(); // fallback to tokenData.brand_id
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
                      <th>City</th>
                      <th>Region</th>
                      <th>Country</th>
                      <th>Lost Reports</th>

                      {/* <th>Recovered</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {geoTrendStats.length > 0 ? (
                      geoTrendStats.map((item, index) => (
                        <tr
                          key={item.id}
                          className="hover:bg-gray-50 transition"
                        >
                          <td className="px-6 py-2 border-b text-gray-800">
                            {index + 1}
                          </td>
                          <td className="px-6 py-2 border-b text-gray-800">
                            {item.city}
                          </td>
                          <td className="px-6 py-2 border-b text-gray-800">
                            {item.region}
                          </td>
                          <td className="px-6 py-2 border-b text-gray-800">
                            {item.country}
                          </td>
                          <td className="px-6 py-2 border-b text-gray-800">
                            {item.lostReports}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-6 py-2 text-center text-gray-500 border-b"
                        >
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
