"use client";

import Cookies from "js-cookie";
import ToastNotification from "pages/components/ToastNotification";
import { useState, useEffect } from "react";
import { Container, Table, Pagination, Row, Col, Card, Spinner } from "react-bootstrap";

const PaymentHistory = () => {
  const [filter, setFilter] = useState("");
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]); // Stores filtered data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tokenData, setTokenData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;


  function decodeJWT(token) {
    try {
      const base64Url = token.split(".")[1]; // Get the payload part of the JWT
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/"); // Replace URL-safe characters
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload); // Return the parsed JSON payload
    } catch (error) {
      console.log("error fetching token",error);
      return null; // Return null if decoding fails
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
      fetchPayments();
    }
  }, [tokenData]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/payment`);
      if (!response.ok) {
        throw new Error("Failed to fetch payments");
      }
      const data = await response.json();
      setPayments(data);
      setFilteredPayments(data); // Initially show all payments
    } catch (err) {
      console.log("error occourred",err);
      setError(err.message);
  }
   finally {
      setLoading(false);
    }
  };

  // Filtering logic (Only apply when user types)
  useEffect(() => {
    if (filter.trim() === "") {
      setFilteredPayments(payments); // Show all payments if filter is empty
    } else {
      const lowercasedFilter = filter.toLowerCase();
      const filtered = payments.filter((payment) =>
        payment?.txn_id?.toLowerCase().includes(lowercasedFilter)
      );
      setFilteredPayments(filtered);
    }
  }, [filter, payments]);




  const paginateData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setQrdata([]); // ✅ Force UI re-render
      setCurrentPage(pageNumber);
    }
  };
  return (
    // <>
    //   <h2 className="ms-15 mt-4">Payment History & Invoices</h2>
    //   <Container className="mt-2 p-4 bg-white rounded">
    //     <div className="mb-3">
    //       <input
    //         type="text"
    //         className="form-control"
    //         placeholder="Filter by Transaction ID"
    //         value={filter}
    //         onChange={(e) => setFilter(e.target.value)}
    //       />
    //     </div>

    //     {loading ? (
    //       <p className="text-center">Loading...</p>
    //     ) : error ? (
    //       <p className="text-danger text-center">{error}</p>
    //     ) : (

         
    //       <Table  hover responsive className="custom-payment-table">
    //       <thead className="table-light">
    //         <tr>
    //           <th>#</th>
    //           <th>Transaction ID</th>
    //           <th>Payment Method</th>
    //           <th>Amount</th>
    //           <th>Status</th>
    //           <th>Payment Date</th>
    //         </tr>
    //       </thead>
    //       <tbody >
    //         {filteredPayments.length > 0 ? (
    //           filteredPayments.map((payment, index) => (
    //             <tr key={payment.id}>
    //               <td>{index + 1}</td>
    //               <td>{payment.txn_id}</td>
    //               <td>{payment.payment_method}</td>
    //               <td>₹{payment.amount}</td>
    //               <td>{payment.status}</td>
    //               <td>{new Date(payment.created_at).toLocaleDateString("en-GB")}</td>
    //             </tr>
    //           ))
    //         ) : (
    //           <tr>
    //             <td colSpan={6} className="text-center text-muted py-3">
    //               No Payment History Available
    //             </td>
    //           </tr>
    //         )}
    //       </tbody>
        
    //       {/* Styled JSX */}
    //       <style jsx>{`
    //         .custom-payment-table {
    //           border-collapse: separate;
    //           border-spacing: 0 5px; /* Adds space between rows */
    //         }
        
    //         .custom-payment-table tbody tr {
    //           border-bottom: 1px solid #dee2e6 !important;
    //         }
        
    //         .custom-payment-table tbody tr:last-child {
    //           border-bottom: none; /* Removes the last row border */
    //         }

    
    //       `}</style>
    //     </Table>
        

    //     )}

    //     {/* Pagination */}
    //     <Pagination className="justify-content-end">
    //             {/* First and Previous Buttons */}
    //             <Pagination.First
    //               onClick={() => handlePageChange(1)}
    //               disabled={currentPage === 1}
    //             />
    //             <Pagination.Prev
    //               onClick={() => handlePageChange(currentPage - 1)}
    //               disabled={currentPage === 1}
    //             />

    //             {/* Dynamic Page Numbers */}
    //             {Array.from({ length: totalPages }, (_, index) => index + 1)
    //               .filter((page) =>
    //                 page === currentPage ||
    //                 page === currentPage - 1 ||
    //                 page === currentPage + 1
    //               )
    //               .map((page) => (
    //                 <Pagination.Item
    //                   key={page}
    //                   active={page === currentPage}
    //                   onClick={() => handlePageChange(page)}
    //                 >
    //                   {page}
    //                 </Pagination.Item>
    //               ))}

    //             {/* Next and Last Buttons */}
    //             <Pagination.Next
    //               onClick={() => handlePageChange(currentPage + 1)}
    //               disabled={currentPage === totalPages}
    //             />
    //             <Pagination.Last
    //               onClick={() => handlePageChange(totalPages)}
    //               disabled={currentPage === totalPages}
    //             />
    //           </Pagination>

    //   </Container>
    // </>

<Container fluid className="p-2" style={{ width: "95%" }}>
<Row className="align-items-center my-2">
  <Col>
    <h3>Payment History & Invoices</h3>
  </Col>
</Row>

<Card className="shadow-sm">
 
  <Card.Body className="p-0">
    {loading ? (
      <div className="d-flex justify-content-center my-5">
        <Spinner animation="border" variant="primary" />
      </div>
    ) : error ? (
      <p className="text-danger text-center">{error}</p>
    ) : (
      <>
        <div className="p-4 bg-white rounded">
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Filter by Transaction ID"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          {/* <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <Table  responsive className="custom-payment-table" >
            <thead className="table-light" > */}
            <div
  style={{
    maxHeight: '450px',
    overflowY: 'auto',
    overflowX: 'auto',
    position: 'relative',
  }}
>
<p>Total Payments: {filteredPayments.length}</p>

  <table className="table custom-payment-table align-middle mb-0 w-100">
    <thead
      className="table-light"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: '#f8f9fa',
      }}
    >
              <tr>
                <th>#</th>
                <th>Transaction ID</th>
                <th>Name</th>
                <th>Role</th>
                <th>Payment Method</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment, index) => (
                  <tr key={payment.id}>
                    <td>{index + 1}</td>
                    <td>{payment.txn_id}</td>
                     <td>{payment.user_name}</td>
                      <td>{payment.payer_type}</td>
                    <td>{payment.payment_method}</td>
                    <td>₹{payment.amount}</td>
                    <td>{payment.status}</td>
                    <td>{new Date(payment.created_at).toLocaleDateString("en-GB")}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-3">
                    No Payment History Available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
           
        </div>

        {/* Pagination */}
        <div className="justify-content-between align-items-center row p-3">
          <div className="col-md-5 col-sm-12">
            {/* <p>Total Payments: {filteredPayments.length}</p> */}
          </div>
          <div className="col-md-7 col-sm-12">
            <Pagination className="justify-content-end mb-0" >
              {/* First and Previous Buttons */}
              <Pagination.First
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              />
              <Pagination.Prev
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              />

              {/* Dynamic Page Numbers */}
              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .filter((page) =>
                  page === currentPage ||
                  page === currentPage - 1 ||
                  page === currentPage + 1
                )
                .map((page) => (
                  <Pagination.Item
                    key={page}
                    active={page === currentPage}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Pagination.Item>
                ))}

              {/* Next and Last Buttons */}
              <Pagination.Next
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              />
              <Pagination.Last
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              />
            </Pagination>
          </div>
        </div>
      </>
    )}
  </Card.Body>
</Card>


</Container>


  );
};

export default PaymentHistory;
