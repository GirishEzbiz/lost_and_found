import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Container, Card, Alert, Spinner } from "react-bootstrap";
import Cookies from "js-cookie";
 

export default function ScanPage() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const [preMessage, setPreMessage] = useState("Authenticating...");
  const [lastScanTimestamp, setLastScanTimestamp] = useState(null);
  const [location, setLocation] = useState({
    city: "",
    state: "",
    country: "",
    latitude: "",
    longitude: "",
    isp: "",
    asn: "",
    locationSource: "", // NEW field to indicate the source of location
  });

  useEffect(() => {
    let uniqueUserId = Cookies.get("unique_user_id");
    if (!uniqueUserId) {
      uniqueUserId = generateUniqueUserId();
      Cookies.set("unique_user_id", uniqueUserId, { expires: 365 });
    }
    setLoading(true);


    if (id) {
      handleAllowLocation();
    }
  }, [id]);

  const generateUniqueUserId = () => {
    return "user_" + Math.random().toString(36).substr(2, 9);
  };

  // Request location permission & fetch data
  const handleAllowLocation = () => {
    setAlertMessage("Fetching location data...");
    setAlertType("success");

    navigator.geolocation.getCurrentPosition(
      async (position) => {

        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        // Fetch location from OpenCage & IP-based API
        await fetchLocationData(latitude, longitude, "GPS");
      },
      async (error) => {
        console.warn("Location permission denied, using IP-based location.");
        setAlertMessage("Location access denied. Using IP-based location.");
        setAlertType("warning");

        // If permission denied, use IP-based method
        await fetchIPBasedLocation();
      }
    );
  };

  // Fetch both OpenCage & IP-based location details
  const fetchLocationData = async (latitude, longitude, source) => {
    try {
      // Fetch public IP
      const ipResponse = await fetch("https://api.ipify.org?format=json");
      const ipData = await ipResponse.json();
      const ipAddress = ipData.ip;

      // API Keys
      const ipApiKey = "6x180hfpsHeC9DnJmD67CvQyILTRBndo"; // API Layer Key
      const locationApiKey = "e3a3ec086bbe4b38b75148015acc783d"; // OpenCage Key

      // Parallel API Calls
      const [ipInfoResponse, locationResponse] = await Promise.all([
        fetch(`https://api.apilayer.com/ip_to_location/${ipAddress}`, {
          method: "GET",
          headers: { apikey: ipApiKey },
        }),
        fetch(
          `https://api.opencagedata.com/geocode/v1/json?q=${latitude},${longitude}&key=${locationApiKey}`
        ),
      ]);

      if (!ipInfoResponse.ok || !locationResponse.ok) {
        throw new Error("Failed to fetch location data.");
      }

      // Parse responses
      const ipInfoData = await ipInfoResponse.json();
      const locationData = await locationResponse.json();

      // Extract details
      const isp = ipInfoData.connection?.isp || "Unknown";
      const asn = ipInfoData.connection?.asn || "Unknown";
      const city =
        locationData.results[0]?.components.city ||
        ipInfoData.city ||
        "Unknown";
      const state =
        locationData.results[0]?.components.state ||
        ipInfoData.region_name ||
        "Unknown";
      const country =
        locationData.results[0]?.components.country ||
        ipInfoData.country_name ||
        "Unknown";
      const lat =
        latitude ||
        ipInfoData.latitude ||
        locationData.results[0]?.geometry.lat ||
        "Unknown";
      const lon =
        longitude ||
        ipInfoData.longitude ||
        locationData.results[0]?.geometry.lng ||
        "Unknown";

      const parsedLocation = {
        isp,
        asn,
        city,
        state,
        country,
        latitude: lat,
        longitude: lon,
        locationSource: source,
      };

      setLocation(parsedLocation);
      setAlertMessage("");
      handleScan(id, parsedLocation, ipAddress);
    } catch (error) {
      console.log("error fetching location data", error);

      setAlertMessage("Failed to fetch location data.");
      setAlertType("danger");
    }
  };

  // Fallback: IP-based location if GPS fails
  const fetchIPBasedLocation = async () => {
    try {
      const ipResponse = await fetch("https://api.ipify.org?format=json");
      const ipData = await ipResponse.json();
      const ipAddress = ipData.ip;

      const apiKey = "6x180hfpsHeC9DnJmD67CvQyILTRBndo";
      const requestOptions = {
        method: "GET",
        headers: { apikey: apiKey },
      };

      const response = await fetch(
        `https://api.apilayer.com/ip_to_location/${ipAddress}`,
        requestOptions
      );
      if (!response.ok) throw new Error("Failed to fetch IP location data.");

      const ipInfoData = await response.json();

      const parsedLocation = {
        isp: ipInfoData.connection?.isp || "Unknown",
        asn: ipInfoData.connection?.asn || "Unknown",
        city: ipInfoData.city || "Unknown",
        state: ipInfoData.region_name || "Unknown",
        country: ipInfoData.country_name || "Unknown",
        latitude: ipInfoData.latitude || "Unknown",
        longitude: ipInfoData.longitude || "Unknown",
        locationSource: "IP-Based", // Indicating the source
      };

      setLocation(parsedLocation);
      handleScan(id, parsedLocation, ipAddress);
    } catch (error) {
      console.log("error fetching ip location", error);

      setAlertMessage("Failed to fetch location data.");
      setAlertType("danger");
    }
  };

  // Handle Scan Submissiowwwn
  const handleScan = async (qr_code, location, ipAddress) => {
    setError(null);

    const uniqueUserId = Cookies.get("unique_user_id");

    let postData = {
      qr_code,
      location,
      unique_user_id: uniqueUserId,
      ipAddress: ipAddress || null,
    };

    try {
      const res = await fetch("/api/scan-page/saveScan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to record the scan.");
      }

      const data = await res.json();
      setPreMessage("Thank you for Scanning...");
      if (data.status == "OK") {
        setAlertMessage(data.message);
        setAlertType("success");
      } else if (data.status == "Repeated") {
        setAlertMessage(data.message);
        setAlertType("warning");
        setLastScanTimestamp(data.lastScanTimestamp);
      } else if (data.status == "Overused") {
        setAlertMessage(data.message);
        setAlertType("danger");
      } else if (data.status == "NOT OK") {
        setAlertMessage(data.message);
        setAlertType("danger");
      } else if (data.status == "NOT FOUND") {
        setAlertMessage("❌ Unauthorized QR!");
        setAlertType("danger");
      }
    } catch (err) {
      console.log("error occurred plz try again later", error);

      setError("There is error, please try later");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <Card className="text-center p-4 h-500vh text-center">
        <h2> {preMessage}</h2>
        {loading && <Spinner animation="border" />}
        {error && <Alert variant="danger">{error}</Alert>}
        {alertMessage && <Alert variant={alertType}>{alertMessage}</Alert>}
      </Card>
    </Container>
  );
}
