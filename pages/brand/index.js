import { Fragment, useState, useEffect } from "react";
import { Container, Col, Row, Card } from "react-bootstrap";
import { StatRightTopIcon } from "widgets";
import { Box, Shop, QrCode, XCircle } from "react-bootstrap-icons";
import Cookies from "js-cookie";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import Link from "next/link";

// Function to fetch KPI data for the brand
const fetchBrandKPIs = async (setBrandStats, tokenData) => {
  try {
    const response = await fetch(
      `/api/brand/kpis?brandId=${tokenData.brand_id}&action=kpi`
    ); // Replace with the actual API endpoint
    if (!response.ok) throw new Error("Failed to fetch brand KPIs");

    const data = await response.json();
    // console.log("Brand KPI Data:", data); // Debugging output
    setBrandStats([
      {
        id: 1,
        title: "Total QR Codes Assigned",
        value: data.total_qr_assigned || 0,
        icon: <Box size={18} />,
      },
      {
        id: 2,
        title: "Total QR Codes Activated",
        value: data.total_qr_activated || 0,
        icon: <Shop size={18} />,
      },
      {
        id: 3,
        title: "Total Lost Items",
        value: data.total_lost_items || 0,
        icon: <QrCode size={18} />,
      },
      {
        id: 4,
        title: "Total Found Items",
        value: data.total_found_items || 0,
        icon: <XCircle size={18} />,
      },
      {
        id: 5,
        title: "Recovery Success Rate",
        value: `${data.recovery_success_rate || 0}%`,
        icon: <XCircle size={18} />,
      },
      {
        id: 6,
        title: "Utilization Rate",
        value: `${data.utilization_rate || 0}%`,
        icon: <XCircle size={18} />,
      },
    ]);
  } catch (error) {
    setBrandStats([
      {
        id: 1,
        title: "Total QR Codes Assigned",
        value: 0,
        icon: <Box size={18} />,
      },
      {
        id: 2,
        title: "Total QR Codes Activated",
        value: 0,
        icon: <Shop size={18} />,
      },
      {
        id: 3,
        title: "Reported Lost ",
        value: 0,
        icon: <QrCode size={18} />,
      },
      {
        id: 4,
        title: " Reported Found",
        value: 0,
        icon: <XCircle size={18} />,
      },
      {
        id: 5,
        title: "Recovery Success Rate",
        value: `${0}%`,
        icon: <XCircle size={18} />,
      },
      {
        id: 6,
        title: "Utilization Rate",
        value: `${0}%`,
        icon: <XCircle size={18} />,
      },
    ]);
    console.log("Error fetching brand KPIs", error);
  }
};
// Function to fetch KPI data for the brand
const fetchUserKPIs = async (setUserStats, tokenData) => {
  try {
    const response = await fetch(
      `/api/brand/kpis?brandId=${tokenData.brand_id}&action=total_user_reg_data`
    ); // Replace with the actual API endpoint
    if (!response.ok) throw new Error("Failed to fetch brand KPIs");

    const data = await response.json();
    console.log("total_user_reg_data KPI Data:", data); // Debugging output

    // Map API response to match barData format
    const formattedData = data.data.map((item) => ({
      name: new Date(item.date).toLocaleString("en-US", { month: "short" }), // Extract month name
      value: item.users_registered, // Correct key name
    }));

    setUserStats(formattedData);
  } catch (error) {
    console.log("Error fetching user KPIs", error);
  }
};
const fetchLostAndFoundData = async (setLnfStats, tokenData) => {
  try {
    const response = await fetch(
      `/api/brand/kpis?brandId=${tokenData.brand_id}&action=get_lost_found_data`
    ); // Replace with the actual API endpoint
    if (!response.ok) throw new Error("Failed to fetch brand KPIs");

    const data = await response.json();
    // console.log("get_lost_found_data", data); // Debugging output

    const formattedData = data.data.map((item) => ({
      name: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }), // Format date
      lostReports: item.lost_reports, // Lost reports
      foundReports: item.found_reports, // Found reports
    }));
    // Example: Setting data for your chart
    setLnfStats(formattedData);

    // console.log("Formatted Data:", formattedData);
  } catch (error) {
    console.log("Error fetching lost and found data", error);
  }
};
const fetchUtilisationRate = async (setUtilizationStats, tokenData) => {
  try {
    const response = await fetch(
      `/api/brand/kpis?brandId=${tokenData.brand_id}&action=get_utilization_rate`
    ); // Replace with the actual API endpoint
    if (!response.ok) throw new Error("Failed to fetch brand KPIs");

    const data = await response.json();
    // console.log("get_utilization_rate", data); // Debugging output

    const formattedData = data.data.map((item) => ({
      name: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }), // Extract formatted date
      utilizationRate: item.utilization_rate, // Convert utilization_rate to number
    }));

    setUtilizationStats(formattedData);
  } catch (error) {
    console.log("Error fetching UtilisationRate", error);
  }
};
const fetchLostItem = async (setLostItemStats, tokenData) => {
  try {
    const response = await fetch(
      `/api/brand/kpis?brandId=${tokenData.brand_id}&action=get_lostitem_data`
    ); // Replace with the actual API endpoint
    if (!response.ok) throw new Error("Failed to fetch brand KPIs");

    const data = await response.json();
    // console.log("get_lostitem_data", data); // Debugging output

    const formattedData = data.data.map((item) => ({
      name: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }), // Extract formatted date
      lostItemCount: item.lost_items_count, // Convert utilization_rate to number
    }));

    setLostItemStats(formattedData);
  } catch (error) {
    console.log("error fetching LostItem", error);
  }
};
const fetchUserGrowth = async (setUserGrowthStats, tokenData) => {
  try {
    const response = await fetch(
      `/api/brand/kpis?brandId=${tokenData.brand_id}&action=get_user_growth`
    ); // Replace with the actual API endpoint
    if (!response.ok) throw new Error("Failed to fetch brand KPIs");

    const data = await response.json();
    // console.log("get_user_growth", data); // Debugging output

    const formattedData = data.data.map((item) => ({
      name: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }), // Extract formatted date
      userGrowth: item.user_growth, // Convert utilization_rate to number
    }));

    setUserGrowthStats(formattedData);
  } catch (error) {
    console.log("error fetching userGrowth", error);
  }
};
const fetchEngagementInsight = async (setEngagementInsight, tokenData) => {
  try {
    const response = await fetch(
      `/api/brand/kpis?brandId=${tokenData.brand_id}&action=get_engagement_insight`
    ); // Replace with the actual API endpoint
    if (!response.ok) throw new Error("Failed to fetch brand KPIs");

    const data = await response.json();
    // console.log("get_engagement_insight", data); // Debugging output

    // Convert object to an array for BarChart
    const formattedData = [
      {
        name: "Success Rate",
        value: parseFloat(data.data.recovery_success_rate),
      },
      {
        name: "Speed (Days)",
        value: parseFloat(data.data.recovery_speed_days),
      },
    ];

    setEngagementInsight(formattedData);
  } catch (error) {
    console.log("error fetching EngagementInsight", error);
  }
};
const fetchGeoTrend = async (setGeoTrendStats, tokenData) => {
  try {
    const response = await fetch(
      `/api/brand/kpis?brandId=${tokenData.brand_id}&action=get_geo_trend`
    ); // Replace with the actual API endpoint
    if (!response.ok) throw new Error("Failed to fetch brand KPIs");

    const data = await response.json();

    // Convert array of objects into required format
    const formattedData = data.data.map((item) => ({
      name: `${item.city}, ${item.region_name}, ${item.country_name}`, // Combine location
      value: item.lost_reports, // Assign lost_reports value
    }));

    setGeoTrendStats(formattedData);
  } catch (error) {
    console.log("error fetching geotrends", error);
  }
};

// Brand Dashboard Component
const BrandDashboard = ({
  brandStats,
  userStats,
  lnfStats,
  utilizationStats,
  lostItemStats,
  userGrowthStats,
  engagementInsight,
  geoTrendStats,
  tokenData,
}) => {
  const [subscriptionAlerts, setSubscriptionAlerts] = useState(false);
  let brandId = tokenData?.brand_id;

  useEffect(() => {
    if (brandId) {
      fetchSubscriptionAlerts();
    }
  }, [brandId]);

  const fetchSubscriptionAlerts = async () => {
    try {
      const response = await fetch(
        `/api/check-brand-subscription?brand_id=${brandId}`
      ); // Your API endpoint
      const data = await response.json();
      if (data.length > 0) {
        setSubscriptionAlerts(true);
      } else {
        setSubscriptionAlerts(false);
        return;
      }
    } catch (error) {
      console.log("error fetching subscriptionalerts", error);
    }
  };

  return (
    <Fragment>
      <div className=" pt-10 pb-21" style={{ background: '#A22191'}}></div>
      <Container fluid className="mt-n22 px-6">
        {subscriptionAlerts && (
          <div className="alert alert-warning mt-3" role="alert">
            <strong>⚠️ Subscription Expiry Alert:</strong>
            One or more items subscription is getting exipred
            <Link
              href="/brand/code-management"
              className="btn btn-sm    float-end "
              style={{ background: '#A22191', color:"#fff" }}
            >
              Manage Subscriptions
            </Link>
          </div>
        )}
        <Row>
          <Col lg={12} md={12} xs={12}>
            <div>
              <div className="d-flex justify-content-between align-items-center">
                <div className="mb-2 mb-lg-0">
                  <h3 className="mb-0 text-white">Brand Dashboard</h3>
                </div>
              </div>
            </div>
          </Col>
          {brandStats.map((item, index) => (
            <Col xl={4} lg={6} md={12} xs={12} className="mt-6" key={index}>
              <StatRightTopIcon info={item} />
            </Col>
          ))}
        </Row>

        <Row className="mt-6">
          <Col md={6}>
            <Card className="bg-white text-black  p-4">
              <Card.Body>
                <h5 className="mb-4">User Registration</h5>
                {userStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={userStats}>
                      <XAxis dataKey="name" stroke="#000" />
                      <YAxis stroke="#000" />
                      <Tooltip
                        wrapperStyle={{
                          backgroundColor: "#333",
                          color: "#fff",
                        }}
                      />
                      <Bar dataKey="value" fill="#82ca9d" barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-5">
                    📉 No User Registration data available
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="bg-white text-black  p-4">
              <Card.Body>
                <h5 className="mb-4">Lost And Found</h5>
                {lnfStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={lnfStats}>
                      <XAxis dataKey="name" stroke="#000" />
                      <YAxis stroke="#000" />
                      <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                      <Tooltip
                        wrapperStyle={{
                          backgroundColor: "#333",
                          color: "#fff",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="lostReports"
                        stroke="#ff0000"
                        strokeWidth={2}
                        dot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="foundReports"
                        stroke="#00ff00"
                        strokeWidth={2}
                        dot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-5">
                    📉 No Lost/Found data available
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row className="mt-6">
          <Col md={6}>
            <Card className="bg-white text-black  p-4">
              <Card.Body>
                <h5 className="mb-4">QR Code Utilization Rate Overtime</h5>
                {utilizationStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={utilizationStats}>
                      <XAxis dataKey="name" stroke="#000" />
                      <YAxis stroke="#000" />
                      <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                      <Tooltip
                        wrapperStyle={{
                          backgroundColor: "#333",
                          color: "#fff",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="utilizationRate"
                        stroke="#ff0000"
                        strokeWidth={2}
                        dot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-5">
                    📉 No Utilization data available
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="bg-white text-black  p-4">
              <Card.Body>
                <h5 className="mb-4">Lost & Founds Trend Overtime</h5>
                {lostItemStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={lostItemStats}>
                      <XAxis dataKey="name" stroke="#000" />
                      <YAxis stroke="#000" />
                      <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                      <Tooltip
                        wrapperStyle={{
                          backgroundColor: "#333",
                          color: "#fff",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="lostItemCount"
                        stroke="#ff0000"
                        strokeWidth={2}
                        dot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-5">
                    📉 No Trend data available
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row className="mt-6">
          <Col md={6}>
            <Card className="bg-white text-black  p-4">
              <Card.Body>
                <h5 className="mb-4">User Growth Over Time</h5>
                {userGrowthStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={userGrowthStats}>
                      <XAxis dataKey="name" stroke="#000" />
                      <YAxis stroke="#000" />
                      <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                      <Tooltip
                        wrapperStyle={{
                          backgroundColor: "#333",
                          color: "#fff",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="userGrowth"
                        stroke="#8884d8"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-5">
                    📉 No Growth data available
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="bg-white text-black  p-4">
              <Card.Body>
                <h5 className="mb-4">Engagement Insights</h5>
                {engagementInsight.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={engagementInsight}>
                      <XAxis dataKey="name" stroke="#000" />
                      <YAxis stroke="#000" />
                      <Tooltip
                        wrapperStyle={{
                          backgroundColor: "#333",
                          color: "#fff",
                        }}
                      />
                      <Bar
                        dataKey="value"
                        fill="#007bff"
                        barSize={30}
                        name="Metrics"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-5">
                    📉 No Engagement data available
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row className="mt-6">
          <Col md={6}>
            <Card className="bg-white text-black p-4">
              <Card.Body>
                <h5 className="mb-4">Geo Trend</h5>
                {engagementInsight.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={geoTrendStats}>
                      <XAxis dataKey="name" stroke="#000" />
                      <YAxis stroke="#000" />
                      <Tooltip
                        wrapperStyle={{
                          backgroundColor: "#333",
                          color: "#fff",
                        }}
                      />
                      <Bar
                        dataKey="value"
                        fill="#007bff"
                        barSize={30}
                        name="Lost Reports"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-5">
                    📉 No Geo Trend data available
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

// Admin Dashboard Component
const AdminDashboard = ({ projectsStats }) => {
  return (
    <Fragment>
      <div className="bg-primary pt-10 pb-21"></div>
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
    { id: 1, title: "Total SKUs", value: 18, icon: <Box size={18} /> },
    { id: 2, title: "Total Brands", value: 132, icon: <Shop size={18} /> },
    { id: 3, title: "Active QRs", value: 12, icon: <QrCode size={18} /> },
    { id: 4, title: "Inactive QRs", value: "76%", icon: <XCircle size={18} /> },
  ]);

  const [brandStats, setBrandStats] = useState([]);
  const [userStats, setUserStats] = useState([]);
  const [lnfStats, setLnfStats] = useState([]);
  const [utilizationStats, setUtilizationStats] = useState([]);
  const [lostItemStats, setLostItemStats] = useState([]);
  const [userGrowthStats, setUserGrowthStats] = useState([]);
  const [engagementInsight, setEngagementInsight] = useState([]);
  const [geoTrendStats, setGeoTrendStats] = useState([]);

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
      console.log("error fetchingtoken ", error);
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
          { ...prevStats[0], value: data.total_sku },
          { ...prevStats[1], value: data.total_brands },
          { ...prevStats[2], value: data.total_active_qr },
          { ...prevStats[3], value: `${data.total_inactive_qr}` },
        ]);
      } catch (error) {
        console.log("error fetching admin kpis", error);
      }
    };

    if (tokenData?.brand_id !== null) {
      fetchBrandKPIs(setBrandStats, tokenData); // Fetch brand KPIs
      fetchUserKPIs(setUserStats, tokenData); // Fetch User KPIs
      fetchLostAndFoundData(setLnfStats, tokenData); // Fetch User KPIs
      fetchUtilisationRate(setUtilizationStats, tokenData); // Fetch User KPIs
      fetchLostItem(setLostItemStats, tokenData); // Fetch User KPIs
      fetchUserGrowth(setUserGrowthStats, tokenData); // Fetch User KPIs
      fetchEngagementInsight(setEngagementInsight, tokenData); // Fetch User KPIs
      fetchGeoTrend(setGeoTrendStats, tokenData); // Fetch User KPIs
    } else {
      fetchAdminKPIs(); // Fetch admin KPIs
    }
  }, [tokenData]);

  return (
    <>
      {tokenData?.brand_id !== null ? (
        <BrandDashboard
          brandStats={brandStats}
          userStats={userStats}
          lnfStats={lnfStats}
          utilizationStats={utilizationStats}
          lostItemStats={lostItemStats}
          userGrowthStats={userGrowthStats}
          engagementInsight={engagementInsight}
          geoTrendStats={geoTrendStats}
          tokenData={tokenData}
        />
      ) : (
        <AdminDashboard projectsStats={projectsStats} />
      )}
    </>
  );
};

export default Home;
