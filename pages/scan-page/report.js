 
import { useEffect, useState } from "react";
import { Table, Container, Card } from "react-bootstrap";

const QrScansTable = () => {
  const [scans, setScans] = useState([]);

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const res = await fetch("/api/scan-page/genrateScanData");
        const data = await res.json();

        // Check if data is an array
        if (Array.isArray(data)) {
          setScans(data); // Set state only if data is an array
        } else {
          console.error("Data is not an array:", data);
          setScans([]); // Fallback to empty array
        }
      } catch (error) {
        console.log("error fetching data", error);

        setScans([]); // Fallback to empty array on error
      }
    };

    fetchScans();
  }, []);

  return (
    <Container className="mt-4">
      <Card>
        <Card.Header>
          <h4>QR Scans Management</h4>
        </Card.Header>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>QR Code</th>
                <th>User ID</th>
                <th>IP Address</th>
                <th>City</th>
                <th>Browser</th>
                <th>Device</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(scans) && scans.length > 0 ? (
                scans.map((scan, index) => (
                  <tr key={scan.id}>
                    <td>{index + 1}</td>
                    <td>{scan.qr_code}</td>
                    <td>{scan.unique_user_id}</td>
                    <td>{scan.ip_address}</td>
                    <td>{scan.city}</td>
                    <td>{scan.browser_details}</td>
                    <td>{scan.device}</td>
                    <td>{new Date(scan.scan_timestamp).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">No data available</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default QrScansTable;