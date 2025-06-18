import { Fragment, useState, useEffect } from "react";
import { Container, Col, Row, Card } from "react-bootstrap";
import { StatRightTopIcon } from "widgets";
import { Box, Shop, QrCode, XCircle } from "react-bootstrap-icons";
import Cookies from "js-cookie";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import Link from "next/link";
import { formatNumber } from "utils/formatNumber";








// Admin Dashboard Component
const AdminDashboard = ({ projectsStats }) => {
  return (
    <Fragment>
      <div className=" pt-10 pb-21" style={{background:"#a22191"}}></div>
      <Container fluid className="mt-n22 px-6">
        <Row>
          <Col lg={12} md={12} xs={12}>
            <div>
              <div className="d-flex justify-content-between align-items-center">
                <div className="mb-2 mb-lg-0">
                  <h3 className="mb-0 text-white">Dashboard</h3>
                </div>
              </div>
            </div>
          </Col>
          {projectsStats.map((item, index) => (
            <Col xl={3} lg={6} md={12} xs={12} className="mt-6" key={index}>
              <StatRightTopIcon info={item} />
            </Col>
          ))}
        </Row>
      </Container>
    </Fragment>
  );
};

// Main Home Component
const Home = () => {
  const [tokenData, setTokenData] = useState(null);
  const [projectsStats, setProjectsStats] = useState([
    { id: 1, title: "Total SKUs", value: 18, icon: <Box size={18} style={{ color: "#a22191"  ,  }} /> },
    { id: 2, title: "Total Brands", value: 132, icon: <Shop size={18} style={{ color: "#a22191",      }} /> },
    { id: 3, title: "Active QRs", value: 12, icon: <QrCode size={18} style={{ color: "#a22191",      }} /> },
    { id: 4, title: "Inactive QRs", value: "76%", icon: <XCircle size={18} style={{ color: "#a22191",   }} /> },
    
  ]);



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
    }catch (error) {
      console.log("error fetchingtoken ",error);
      return null;
  }
  
  }

  useEffect(() => {
    setTokenData(decodeJWT(Cookies.get("adminToken")));
  }, []);

  useEffect(() => {
    const fetchAdminKPIs = async () => {
      try {
        const response = await fetch("/api/admin/dashboard");
        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        setProjectsStats((prevStats) => [
          { ...prevStats[0], value: formatNumber(data.total_sku) },
  { ...prevStats[1], value: formatNumber(data.total_brands) },
  { ...prevStats[2], value: formatNumber(data.total_active_qr) },
  { ...prevStats[3], value: formatNumber(data.total_inactive_qr) },
        ]);
      } catch (error) {
        console.log("error fetching admin kpis",error);
    }
    
    };

    fetchAdminKPIs();
    
  }, []);

  return (
    <>
      
        <AdminDashboard projectsStats={projectsStats} />
     
    </>
  );
};

export default Home;
