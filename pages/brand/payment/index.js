"use client";

import Cookies from "js-cookie";
import { useState, useEffect } from "react";
import { Container, Table, Pagination } from "react-bootstrap";

const PaymentHistory = () => {
  const [filter, setFilter] = useState("");
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]); // Stores filtered data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tokenData, setTokenData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = Cookies.get("Page-limit");


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
      const response = await fetch(`/api/admin/payment?brandId=${tokenData?.brand_id}`);
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


/* Targets ONLY the active pagination item */
.custom-pagination .page-item.active .page-link {
  background-color: #A22191 !important; /* Force override */
  border: none !important;
  color: white !important;
}

/* Explicitly set styles for inactive items (optional) */
.custom-pagination .page-item:not(.active) .page-link {
  background-color:  #f8f9fa!important; /* Or your default color */
  color: #000; /* Default text color */
}

    `}
  </style>
      <h3 className="ms-7 mt-4">Payment History & Invoices</h3>
      <Container className="mt-2 p-4 bg-white rounded" style={{ maxWidth: "95%" }}>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Filter by Transaction ID"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="text-center">Loading...</p>
        ) : error ? (
          <p className="text-danger text-center">{error}</p>
        ) : (

         <div style={{ overflowY: "auto", maxHeight: "400px" }}>  
          <table className="table custom-payment-table">
          <thead className="table-light " style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      backgroundColor: "#f8f9fa",
    }}>
            <tr>
              <th>#</th>
              <th>Transaction ID</th>
              <th>Payment Method</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Payment Date</th>
            </tr>
          </thead>
          <tbody >
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment, index) => (
                <tr key={payment.id}>
                  <td>{index + 1}</td>
                  <td>{payment.txn_id}</td>
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
        
          {/* Styled JSX */}
          <style jsx>{`
            .custom-payment-table {
              border-collapse: separate;
              border-spacing: 0 5px; /* Adds space between rows */
            }
        
            .custom-payment-table tbody tr {
              border-bottom: 1px solid #dee2e6 !important;
            }
        
            .custom-payment-table tbody tr:last-child {
              border-bottom: none; /* Removes the last row border */
            }

    
          `}</style>
        </table>
        </div>

        )}

        {/* Pagination */}
        <Pagination className="justify-content-end custom-pagination">
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

      </Container>
    </>
  );
};

export default PaymentHistory;
