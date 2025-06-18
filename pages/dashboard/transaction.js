import { useState, useEffect } from "react";
import { Table, Pagination } from "react-bootstrap";
import GoBack from "./backButton";

import Support from "pages/support";
import logger from "lib/logger";
import useTranslate from "utils/useTranslate";


function Transaction() {
  const [filter, setFilter] = useState("");
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemPerPage = 10;


  const texts = useTranslate({
    transaction: "Transaction",
    paymentHistory: "Payment History & Invoices",
    filterByInvoice: "Filter by Invoice ID",
    loading: "Loading...",
    noPaymentHistory: "No Payment History Available",
    failedToFetch: "Failed to fetch payments",
    payerType: "Payer Type",
    txnId: "Transaction ID",
    paymentMethod: "Payment Method",
    amount: "Amount",
    status: "Status",
    paymentDate: "Payment Date",
  });




  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch("/api/user-tranction");
        if (!response.ok) {
          throw new Error("Failed to fetch payments");
        }
        const data = await response.json();
        setPayments(data);
      } catch (err) {
        // Log the error with the message and stack trace
        logger.error({
          message: "Error occurred while processing the payment",
          stack: err.stack,
          function: "fetchpayments"  // Replace with the actual function name
        });

        // Set the error message in the state
        setError(err.message);
      }
      finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const indexOfLastItem = currentPage * itemPerPage;
  const indexOfFirstItem = indexOfLastItem - itemPerPage;
  const currentItems = payments?.length > 0 && payments?.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(payments.length / itemPerPage);

  return (

    <>


      {/* Header */}

      <div>
        <style>
          {`
        /* Ensure the GoBack button is visible on all devices */
        .go-back-button {
          display: inline-block;
          margin-right: auto;
          margin-left: 10px;
        }
        
        @media (min-width: 576px) {
          .go-back-button {
            display: inline-block;
            padding-left:1.5rem;
          }
        }

        @media (max-width: 575px) {
          .go-back-button {
            display: inline-block;
          }
        }
      `}
        </style>

        <div className="d-flex align-items-center justify-content-between  bg-white p-3 shadow-md">
          <div className="go-back-button">
            <GoBack />
          </div>
          <div className="w-100">
            <h4 className="mb-0 text-center pe-5" style={{ marginRight: "3rem" }}>{texts.transaction}</h4>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="container-fluid mt-4 p-4 bg-white rounded shadow">
        <h2 className="mb-4 text-center fs-3 text-primary fs-4 font-bold">
          {texts.paymentHistory}
        </h2>

        {/* Search Filter */}
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder={texts.filterByInvoice}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        {/* Table & Data */}
        {loading ? (
          <p className="text-center">{texts.loading}</p>
        ) : error ? (
          <p className="text-danger text-center">{error}</p>
        ) : (
          <div className=" w-full">
            <div className="table-responsive">
              <Table striped bordered hover className="table-fixed w-full">
                <thead className="bg-gray-200 text-gray-700">
                  <tr>
                    <th>#</th>
                    <th>{texts.payerType}</th>
                    <th>{texts.txnId}</th>
                    <th>{texts.paymentMethod}</th>
                    <th>{texts.amount}</th>
                    <th>{texts.status}</th>
                    <th>{texts.paymentDate}</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((payment, index) => (
                      <tr key={index}>
                        <td>{indexOfFirstItem + index + 1}</td>
                        <td className="truncate">{payment.payer_type}</td>
                        <td className="truncate p-0 pt-3" style={{ fontSize: "12px" }} >{payment.txn_id}</td>
                        <td className="truncate">{payment.payment_method}</td>
                        <td>₹{payment.amount}</td>
                        <td className="truncate">{payment.status}</td>
                        <td>
                          {new Date(payment.created_at).toLocaleDateString("en-GB")}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center text-muted py-3">
                        {texts.noPaymentHistory}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination className="justify-content-end mt-3 mb-10">
            <Pagination.Prev
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            />
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Pagination.Item
                key={page}
                active={page === currentPage}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Pagination.Item>
            ))}
            <Pagination.Next
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        )}
      </div>

      {/* Fixed Support Footer */}
      <div className="fixed-footer">
        <Support />
      </div>

      {/* CSS Styles for Responsive UI */}
      <style jsx>{`
        .table-container {
          width: 100%;
          overflow-x: auto;
        }

        .table-responsive {
          display: block;
          max-width: 400px;
          overflow-x: auto;
          white-space: nowrap;
          
        }

        .table-fixed thead {
          position: sticky;
          top: 0;
          background: white;
          z-index: 10;
        }

        .truncate {
          max-width: 150px;
          // overflow-x: auto;
          text-overflow: ellipsis;
          white-space: nowrap;
          text-align:center;
          // font-size:12px;
        }

        @media (max-width: 768px) {
          .fixed-footer {
            position: fixed;
            bottom: 0;
            width: 100%;
            background: white;
            padding: 10px 0;
            box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
          }
        }
      `}</style>

    </>
  );
}

export default Transaction;
