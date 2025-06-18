import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";


const Report = () => {
  const [userStats, setUserStats] = useState([]);
  const [lnfStats, setLnfStats] = useState([]);
  const [utilizationStats, setUtilizationStats] = useState([]);
  const [lostItemStats, setLostItemStats] = useState([]);
  const [userGrowthStats, setUserGrowthStats] = useState([]);
  const [engagementInsight, setEngagementInsight] = useState(null);
  const [geoTrendStats, setGeoTrendStats] = useState([]);
  const [tokenData, setTokenData] = useState(null);

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
      console.log("error fetching token",error);
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
    if (tokenData ) {
      fetchData();
    }
  }, [tokenData]);

  const fetchData = async () => {
    try {
      const responses = await Promise.all([
        fetch(`/api/brand/kpis?brandId=${tokenData.brand_id}&action=total_user_reg_data`),
        fetch(`/api/brand/kpis?brandId=${tokenData.brand_id}&action=get_lost_found_data`),
        fetch(`/api/brand/kpis?brandId=${tokenData.brand_id}&action=get_utilization_rate`),
        fetch(`/api/brand/kpis?brandId=${tokenData.brand_id}&action=get_lostitem_data`),
        fetch(`/api/brand/kpis?brandId=${tokenData.brand_id}&action=get_user_growth`),
        fetch(`/api/brand/kpis?brandId=${tokenData.brand_id}&action=get_engagement_insight`),
        fetch(`/api/brand/kpis?brandId=${tokenData.brand_id}&action=get_geo_trend`),
      ]);

      if (responses.some((res) => !res.ok)) throw new Error("Failed to fetch data");

      const [userData, lnfData, utilizationData, lostItemData, userGrowthData, engagementData, geoData] =
        await Promise.all(responses.map((res) => res.json()));

      setUserStats(userData);
      setLnfStats(lnfData);
      setUtilizationStats(utilizationData);
      setLostItemStats(lostItemData);
      setUserGrowthStats(userGrowthData);
      setEngagementInsight(engagementData);
      setGeoTrendStats(geoData);
    } catch (error) {
      console.log("error fetching data",error);
  }
  
  };

  const TableCard = ({ title, headers, data }) => (
    <div className="bg-white shadow-md rounded-lg p-4 w-full md:w-1/2 lg:w-1/3">
      <h2 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">{title}</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              {headers.map((header, index) => (
                <th key={index} className="px-4 py-2 text-left">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="border-t hover:bg-gray-50">
                {Object.values(item).map((value, i) => (
                  <td key={i} className="px-4 py-2">{value}</td>
                ))}
                
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-wrap gap-4">
        <TableCard
          title="User KPIs"
          headers={["Date", "Users Registered"]}
          data={userStats.map((item) => ({ date: new Date(item.date).toLocaleDateString(), users: item.users_registered }))}
        />
        <TableCard
          title="Lost and Found Data"
          headers={["Date", "Lost Reports", "Found Reports"]}
          data={lnfStats.map((item) => ({ date: new Date(item.date).toLocaleDateString(), lost: item.lost_reports, found: item.found_reports }))}
        />
        <TableCard
          title="Utilization Rate"
          headers={["Date", "Utilization Rate"]}
          data={utilizationStats.map((item) => ({ date: new Date(item.date).toLocaleDateString(), rate: item.utilization_rate }))}
        />
        <TableCard
          title="Lost Items"
          headers={["Date", "Lost Items Count"]}
          data={lostItemStats.map((item) => ({ date: new Date(item.date).toLocaleDateString(), count: item.lost_items_count }))}
        />
        <TableCard
          title="User Growth"
          headers={["Date", "User Growth"]}
          data={userGrowthStats.map((item) => ({ date: new Date(item.date).toLocaleDateString(), growth: item.user_growth }))}
        />
        {engagementInsight && (
          <TableCard
            title="Engagement Insights"
            headers={["Metric", "Value"]}
            data={[
              { Metric: "Success Rate", Value: `${engagementInsight.recovery_success_rate}%` },
              { Metric: "Recovery Speed (Days)", Value: engagementInsight.recovery_speed_days },
            ]}
          />
        )}
        <TableCard
          title="Geo Trends"
          headers={["City", "Region", "Country", "Lost Reports"]}
          data={geoTrendStats.map((item) => ({
            city: item.city,
            region: item.region_name,
            country: item.country_name,
            lostReports: item.lost_reports,
          }))}
        />

        
      </div>
    </div>
  );
};

export default Report;