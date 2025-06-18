import { authenticate } from "lib/auth";
import { db } from "lib/db";
import { withMonitorLogger } from "utils/withMonitorLogger";

const getKpis = async (brandId, req, res) => {
  try {
    // 1. Get total assigned QR codes & activated count
    const qrCodeQuery = `
      SELECT COUNT(*) AS totalQRAssigned, 
             SUM(status) AS totalQRActivated 
      FROM qr_code 
      WHERE brand_id = ?;
    `;
    const [qrCodeResult] = await db.query(qrCodeQuery, [brandId]);

    const totalQRAssigned = qrCodeResult[0]?.totalQRAssigned || 0;
    const totalQRActivated = qrCodeResult[0]?.totalQRActivated || 0;

    if (totalQRAssigned === 0) {
      return res.status(200).json({
        total_qr_assigned: 0,
        total_qr_activated: 0,
        total_lost_items: 0,
        total_found_items: 0,
        recovery_success_rate: "0",
        utilization_rate: "0",
      });
    }

    // 2. Get lost & found counts
    const lostFoundQuery = `
      SELECT 
        SUM(CASE WHEN h.status_type = 'lost' THEN 1 ELSE 0 END) AS totalLostItems,
        SUM(CASE WHEN h.status_type = 'found' THEN 1 ELSE 0 END) AS totalFoundItems
      FROM qr_code_history h
      JOIN qr_code q ON h.qr_code_id = q.qr_code
      WHERE q.brand_id = ?;
    `;
    const [lostFoundResult] = await db.query(lostFoundQuery, [brandId]);

    const totalLostItems = lostFoundResult[0]?.totalLostItems || 0;
    const totalFoundItems = lostFoundResult[0]?.totalFoundItems || 0;

    // 3. Calculate KPIs
    const recoverySuccessRate =
      totalLostItems > 0
        ? ((totalFoundItems / totalLostItems) * 100).toFixed(2)
        : "0";

    const utilizationRate =
      totalQRAssigned > 0
        ? ((totalQRActivated / totalQRAssigned) * 100).toFixed(2)
        : "0";

    // 4. Return KPI data
    return res.status(200).json({
      total_qr_assigned: totalQRAssigned,
      total_qr_activated: totalQRActivated,
      total_lost_items: totalLostItems,
      total_found_items: totalFoundItems,
      recovery_success_rate: recoverySuccessRate,
      utilization_rate: utilizationRate,
    });
  } catch (error) {
    console.log("error fetching kpis", error);
    res.status(500).json({ message: error.message });
    throw error;
  }
};

const getTotalRegData = async (brand_id, req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    // 🟡 Count total unique registration dates for pagination
    let countQuery = `SELECT COUNT(DISTINCT DATE(registration_date)) AS total FROM qr_code WHERE is_activated = 1`;
    const countParams = [];

    if (brand_id && brand_id !== "null") {
      countQuery += ` AND brand_id = ?`;
      countParams.push(brand_id);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0]?.total || 0;

    // 🟢 Fetch paginated registration data
    let qrCodeQuery = `
      SELECT DATE(registration_date) AS date, COUNT(id) AS users_registered
      FROM qr_code
      WHERE is_activated = 1
    `;
    const queryParams = [];

    if (brand_id && brand_id !== "null") {
      qrCodeQuery += ` AND brand_id = ?`;
      queryParams.push(brand_id);
    }

    qrCodeQuery += ` GROUP BY DATE(registration_date) ORDER BY DATE(registration_date) LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    const [qrCodesResult] = await db.query(qrCodeQuery, queryParams);

    if (qrCodesResult.length === 0) {
      return res
        .status(404)
        .json({ message: "No QR code registrations found" });
    }

    return res.status(200).json({
      data: qrCodesResult,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching registration data:", error);
    res.status(500).json({ message: error.message });
    throw error;
  }
};
const getLostFoundData = async (brand_id, req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // ✅ Limit from query
    const page = parseInt(req.query.page) || 1; // ✅ Page from query
    const offset = (page - 1) * limit;

    // 🔢 Count query
    let countQuery = `
      SELECT COUNT(DISTINCT DATE(h.change_date)) AS total 
      FROM qr_code_history h
      JOIN qr_code q ON h.qr_code_id = q.qr_code
      WHERE h.status_type IN ('lost', 'found')
    `;
    const countParams = [];

    if (brand_id && brand_id !== "null") {
      countQuery += ` AND q.brand_id = ?`;
      countParams.push(brand_id);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0]?.total || 0;

    // 📄 Data query
    let lostFoundQuery = `
      SELECT 
        DATE(h.change_date) AS date,
        COUNT(CASE WHEN h.status_type = 'lost' THEN 1 END) AS lost_reports,
        COUNT(CASE WHEN h.status_type = 'found' THEN 1 END) AS found_reports
      FROM qr_code_history h
      JOIN qr_code q ON h.qr_code_id = q.qr_code
      WHERE h.status_type IN ('lost', 'found')
    `;
    const queryParams = [];

    if (brand_id && brand_id !== "null") {
      lostFoundQuery += ` AND q.brand_id = ?`;
      queryParams.push(brand_id);
    }

    lostFoundQuery += `
      GROUP BY DATE(h.change_date)
      ORDER BY DATE(h.change_date)
      LIMIT ? OFFSET ?
    `;
    queryParams.push(limit, offset);

    const [lostFoundResult] = await db.query(lostFoundQuery, queryParams);

    if (lostFoundResult.length === 0) {
      return res.status(404).json({
        message: "No lost or found reports found",
      });
    }

    return res.status(200).json({
      data: lostFoundResult, // ✅ Response variable untouched
      total: total, // ✅ Used as-is
      page: page,
      limit: limit,
    });
  } catch (error) {
    console.log("error fetching lost and found data", error);
    res.status(500).json({ message: error.message });
    throw error;
  }
};
const getUtilizationRateData = async (brand_id, req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // ✅ Limit from query
    const page = parseInt(req.query.page) || 1; // ✅ Page from query
    const offset = (page - 1) * limit;

    // 🔢 1. Count total unique dates for pagination
    let countQuery = `
      SELECT COUNT(DISTINCT DATE(created_at)) AS total 
      FROM qr_code 
      WHERE 1=1
    `;
    const countParams = [];

    if (brand_id && brand_id !== "null") {
      countQuery += ` AND brand_id = ?`;
      countParams.push(brand_id);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0]?.total || 0;

    // 📊 2. Utilization rate query
    let utilizationQuery = `
      SELECT 
        DATE(created_at) AS date, 
        ROUND((COUNT(CASE WHEN is_activated = 1 THEN 1 END) / COUNT(id)) * 100, 2) AS utilization_rate
      FROM qr_code
      WHERE 1=1
    `;
    const queryParams = [];

    if (brand_id && brand_id !== "null") {
      utilizationQuery += ` AND brand_id = ?`;
      queryParams.push(brand_id);
    }

    utilizationQuery += `
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
      LIMIT ? OFFSET ?
    `;
    queryParams.push(limit, offset);

    const [utilizationResult] = await db.query(utilizationQuery, queryParams);

    if (utilizationResult.length === 0) {
      return res.status(404).json({
        message: "No utilization data found",
      });
    }

    return res.status(200).json({
      data: utilizationResult, // ✅ Kept as-is
      total: total,
      page: page,
      limit: limit,
    });
  } catch (error) {
    console.log("error fetching utilization data", error);
    res.status(500).json({ message: error.message });
    throw error;
  }
};
const getLostItemsData = async (brand_id, req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // ✅ Default limit
    const page = parseInt(req.query.page) || 1; // ✅ Default page
    const offset = (page - 1) * limit;

    // 🔢 1. Count total unique lost item dates
    let countQuery = `
      SELECT COUNT(DISTINCT DATE(h.change_date)) AS total 
      FROM qr_code_history h
      JOIN qr_code q ON h.qr_code_id = q.qr_code
      WHERE h.status_type = 'lost'
    `;
    const countParams = [];

    if (brand_id && brand_id !== "null") {
      countQuery += ` AND q.brand_id = ?`;
      countParams.push(brand_id);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0]?.total || 0;

    // 📊 2. Fetch lost items data
    let lostItemsQuery = `
      SELECT 
        DATE(h.change_date) AS date, 
        COUNT(h.qr_code_id) AS lost_items_count
      FROM qr_code_history h
      JOIN qr_code q ON h.qr_code_id = q.qr_code
      WHERE h.status_type = 'lost'
    `;
    const queryParams = [];

    if (brand_id && brand_id !== "null") {
      lostItemsQuery += ` AND q.brand_id = ?`;
      queryParams.push(brand_id);
    }

    lostItemsQuery += `
      GROUP BY DATE(h.change_date)
      ORDER BY DATE(h.change_date)
      LIMIT ? OFFSET ?
    `;
    queryParams.push(limit, offset);

    const [lostItemsResult] = await db.query(lostItemsQuery, queryParams);

    return res.status(200).json({
      data: lostItemsResult, // ✅ Response structure preserved
      total: total,
      page: page,
      limit: limit,
    });
  } catch (error) {
    console.log("error fetching lost item data", error);
    res.status(500).json({ message: error.message });
    throw error;
  }
};
const getUserGrowthData = async (brand_id, req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // 1. Base query for activated users
    let baseQuery = `
      SELECT DATE(registration_date) AS date,
             COUNT(id) OVER (ORDER BY DATE(registration_date)) AS user_growth
      FROM qr_code
      WHERE is_activated = 1
    `;

    const queryParams = [];

    if (brand_id && brand_id !== "null") {
      baseQuery += ` AND brand_id = ?`;
      queryParams.push(brand_id);
    }

    // 2. Fetch all results for count
    const [allResults] = await db.query(baseQuery, queryParams);
    const total = allResults.length;

    // 3. Paginated result using subquery
    const paginatedQuery = `
      SELECT * FROM (${baseQuery}) AS growth
      ORDER BY date
      LIMIT ? OFFSET ?
    `;

    const [paginatedData] = await db.query(paginatedQuery, [
      ...queryParams,
      parseInt(limit),
      offset,
    ]);

    if (paginatedData.length === 0) {
      return res.status(404).json({ message: "No user growth data found" });
    }

    return res.status(200).json({
      data: paginatedData,
      total: total,
    });
  } catch (error) {
    console.log("error fetching growth data", error);
    res.status(500).json({ message: error.message });
    throw error;
  }
};
const getEngagementInsights = async (brand_id, req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    // 1. Total count query
    let countQuery = `
      SELECT COUNT(DISTINCT h.qr_code_id) AS total
      FROM qr_code_history h
      JOIN qr_code q ON h.qr_code_id = q.qr_code
      WHERE h.status_type IN ('lost', 'found')
    `;
    const countParams = [];

    if (brand_id && brand_id !== "null") {
      countQuery += ` AND q.brand_id = ?`;
      countParams.push(brand_id);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0]?.total || 0;

    // 2. Engagement data query
    let engagementQuery = `
      SELECT 
        (COUNT(CASE WHEN h.status_type = 'found' THEN 1 END) / NULLIF(COUNT(CASE WHEN h.status_type = 'lost' THEN 1 END), 0)) * 100 AS recovery_success_rate,
        AVG(TIMESTAMPDIFF(DAY, 
          (SELECT MIN(h1.change_date) FROM qr_code_history h1 WHERE h1.qr_code_id = h.qr_code_id AND h1.status_type = 'lost'),
          (SELECT MIN(h2.change_date) FROM qr_code_history h2 WHERE h2.qr_code_id = h.qr_code_id AND h2.status_type = 'found')
        )) AS recovery_speed_days
      FROM qr_code_history h
      JOIN qr_code q ON h.qr_code_id = q.qr_code
      WHERE h.status_type IN ('lost', 'found')
    `;

    const queryParams = [];

    if (brand_id && brand_id !== "null") {
      engagementQuery += ` AND q.brand_id = ?`;
      queryParams.push(brand_id);
    }

    engagementQuery += `
      GROUP BY h.qr_code_id
      LIMIT ? OFFSET ?
    `;
    queryParams.push(limit, offset);

    const [engagementResult] = await db.query(engagementQuery, queryParams);

    if (!engagementResult || engagementResult.length === 0) {
      return res.status(404).json({
        message: "No engagement data found",
      });
    }

    return res.status(200).json({
      data: engagementResult,
      total: total,
      page: page,
      limit: limit,
    });
  } catch (error) {
    console.log("error fetching engagement insights", error);
    res.status(500).json({ message: error.message });
    throw error;
  }
};
const getGeographicalTrends = async (brand_id, req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    // 🔢 1. Count query
    let countQuery = `
      SELECT COUNT(DISTINCT f.city) AS total
      FROM qr_code_history h
      JOIN qr_code q ON h.qr_code_id = q.qr_code
      JOIN items i ON i.qr_code_id = q.qr_code
      LEFT JOIN tbl_finder f ON f.item_id = i.id
      WHERE h.status_type = 'lost'
        AND f.city IS NOT NULL 
        AND f.region_name IS NOT NULL 
        AND f.country_name IS NOT NULL
    `;
    const countParams = [];

    if (brand_id && brand_id !== "null") {
      countQuery += ` AND q.brand_id = ?`;
      countParams.push(brand_id);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0]?.total || 0;

    // 🌍 2. Geo trends query
    let geoTrendsQuery = `
      SELECT 
        f.city, 
        f.region_name, 
        f.country_name, 
        COUNT(h.qr_code_id) AS lost_reports
      FROM qr_code_history h
      JOIN qr_code q ON h.qr_code_id = q.qr_code
      JOIN items i ON i.qr_code_id = q.qr_code
      LEFT JOIN tbl_finder f ON f.item_id = i.id
      WHERE h.status_type = 'lost'
        AND f.city IS NOT NULL 
        AND f.region_name IS NOT NULL 
        AND f.country_name IS NOT NULL
    `;
    const queryParams = [];

    if (brand_id && brand_id !== "null") {
      geoTrendsQuery += ` AND q.brand_id = ?`;
      queryParams.push(brand_id);
    }

    geoTrendsQuery += `
      GROUP BY f.city, f.region_name, f.country_name
      ORDER BY lost_reports DESC
      LIMIT ? OFFSET ?
    `;
    queryParams.push(limit, offset);

    const [geoTrendsResult] = await db.query(geoTrendsQuery, queryParams);

    if (!geoTrendsResult || geoTrendsResult.length === 0) {
      return res.status(404).json({
        message: "No geographical trend data found",
      });
    }

    return res.status(200).json({
      data: geoTrendsResult,
      total: total,
      page: page,
      limit: limit,
    });
  } catch (error) {
    console.log("error fetching geo trends", error);
    res.status(500).json({ message: error.message });
    throw error;
  }
};

const handler = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { brandId, action } = req.query;

  if (!brandId) {
    return res.status(400).json({ message: "brandId is required" });
  }
  if (action == "kpi") {
    getKpis(brandId, req, res);
  } else if (action == "total_user_reg_data") {
    getTotalRegData(brandId, req, res);
  } else if (action == "get_lost_found_data") {
    getLostFoundData(brandId, req, res);
  } else if (action == "get_utilization_rate") {
    getUtilizationRateData(brandId, req, res);
  } else if (action == "get_lostitem_data") {
    getLostItemsData(brandId, req, res);
  } else if (action == "get_user_growth") {
    getUserGrowthData(brandId, req, res);
  } else if (action == "get_engagement_insight") {
    getEngagementInsights(brandId, req, res);
  } else if (action == "get_geo_trend") {
    getGeographicalTrends(brandId, req, res);
  }
};

export default withMonitorLogger(handler);
