import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Spinner,
  CardBody,
  CardHeader,
  Pagination,
} from "react-bootstrap";
import Link from "next/link";
import Swal from "sweetalert2";
import ToastNotification from "../../components/ToastNotification";
import Image from "next/image";
import Cookies from "js-cookie";
import GetPermission from "utils/getpermissions";
import { dateFormat } from "utils/dateFormat";

const SKUListPage = () => {
  const [skus, setSkus] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); // State for search input
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");
  const [loadingSkuId, setLoadingSkuId] = useState(null);
  const [filteredSkus, setFilteredSkus] = useState([]); // State for filtered SKUs


  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = Cookies.get("Page-limit") || 10; // Max SKUs per page

  const [permissions, setPermissions] = useState({
    canAdd: false,
    canEdit: false,
    canDelete: false,
  });
  useEffect(() => {
    setPermissions({
      canAdd: GetPermission("add-sku"),
      canEdit: GetPermission("edit-sku"),
      canDelete: GetPermission("delete-sku"),
    });
  }, []);

  const fetchSkus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/sku?page=${currentPage}&limit=${itemsPerPage}&search=${searchQuery}`);
      const data = await response.json();
      setSkus(data.skus || []);
      setTotalCount(data.total || 0);
    } catch (error) {
      console.log("error fetching skus ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchSkus();
    }, 300); // debounce for smoother search

    return () => clearTimeout(delay);
  }, [currentPage, searchQuery]);




  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const paginatedSkus = skus; // Already paginated from backend


  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // reset to page 1 on new search
  };
  const deleteCategory = async (id) => {
    try {
      const response = await fetch(`/api/admin/sku?id=${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setToastMessage("SKU deleted successfully!");
        setToastVariant("success");
        setShowToast(true);
        setSkus((prevSkus) => prevSkus.filter((sku) => sku.id !== id));
        setFilteredSkus((prevSkus) => prevSkus.filter((sku) => sku.id !== id));
      } else {
        const errorData = await response.json();
        setToastMessage("Error deleting SKU. please try again");
        setToastVariant("danger");
        setShowToast(true);
      }
    } catch (error) {
      console.log("error deleting SKU", error);
      setToastMessage("Error deleting SKU. Please try again.");
      setToastVariant("danger");
      setShowToast(true);
    } finally {
      setLoadingSkuId(false);
    }
  };

  const handleDeleteClick = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "this action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    }).then((Result) => {
      if (Result.isConfirmed) {
        deleteCategory(id);
      }
    });
  };

  return (
    <Container fluid className="p-2" style={{ width: "95%" }}>
      <Row className="align-items-center my-2">
        <Col>
          <h3>SKU Master</h3>
        </Col>
      </Row>

      <Card>
        <CardHeader>
          <div className="row justify-content-between">
            <div className="mb-3 col-md-6">
              <input
                placeholder="Search for SKU Name"
                className="form-control w-50"
                type="search"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <div className="text-lg-end mb-3 col-md-6">
              {
                permissions.canAdd && (
                  <Link href="/admin/sku-master/create" passHref>
                    <Button variant="primary" style={{background:"#a22191", border:"none",color:"white"}}>+ Add SKU</Button>
                  </Link>
                )
              }

            </div>
          </div>
        </CardHeader>

        {loading ? (
          <div className="d-flex justify-content-center my-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : skus.length === 0 ? (
          <div className="text-center my-5">
            <Image
              src="/images/not-found.png"
              alt="No data available"
              className="mb-3"
              width={200} // Set a fixed width
              height={200} // Set a fixed height (adjust as needed)
              style={{ maxWidth: "200px", width: "100%" }}
            />
            <h5 className="text-muted">No SKUs Found</h5>
            <p className="text-secondary d-inline">
              We couldn’t find any SKUs matching your criteria. Try adjusting
              your filters or adding a new SKU.
            </p>
            <Link href="/admin/sku-master/create" passHref>
              <span className="text-primary fw-bold ms-2 text-decoration-underline">
                + Add New
              </span>
            </Link>
          </div>
        ) : (
          <CardBody>
            <p>Showing {paginatedSkus.length} out of {totalCount}</p>
            <div
              style={{
                maxHeight: "300px",
                overflowY: "auto",
                overflowX: "auto",
              }}
            >
              <Table id="example" className="text-nowrap table-centered mt-0">
                <thead
                  className="table-light"
                  style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                    background: "white",
                  }}
                >
                  <tr>
                    <th>ID</th>
                    <th>SKU Name</th>
                    <th>SKU Date</th>
                    {
                      (permissions.canEdit || permissions.canDelete) && (
                        <th>Actions</th>
                      )
                    }

                  </tr>
                </thead>
                <tbody>
                  {paginatedSkus.map((sku, index) => (
                    <tr key={index}>
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td>{sku.name}</td>
                      <td>
                        {/* {new Date(sku.created_at).toLocaleDateString()} */}
                        {dateFormat(sku.created_at)}
                      </td>
                      <td>
                        {
                          permissions.canEdit && (
                            <Link
                              href={`/admin/sku-master/edit/${sku.id}`}
                              passHref
                              className="btn btn-ghost btn-icon btn-sm rounded-circle"
                            >
                              <span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="icon-xs"
                                >
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                              </span>
                            </Link>
                          )
                        }

                        {
                          permissions.canDelete && (
                            <div
                              className="btn btn-ghost btn-icon btn-sm rounded-circle"
                              onClick={() => handleDeleteClick(sku.id)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="icon-xs"
                              >
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                              </svg>
                            </div>
                          )
                        }


                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </CardBody>
        )}

        <div className="justify-content-between align-items-center row p-3">
          <div className="col-md-5 col-sm-12 text-right">

          </div>
          <div className="col-md-7 col-sm-12">
            <Pagination className="justify-content-end mb-0 custom-pagination">
              <Pagination.First
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              />
              <Pagination.Prev
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              />
              {[...Array(totalPages)].map((_, index) => (
                <Pagination.Item
                  key={index}
                  active={index + 1 === currentPage}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              />
              <Pagination.Last
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              />
            </Pagination>
            <style jsx global>
              {`
              
              /* Change background of active button */
.custom-pagination .page-item.active .page-link {
  background-color: #A22191; /* Bootstrap magenta color */
  border: none;
  color: white;
}
              `}

              </style>

          </div>
        </div>
      </Card>

      <ToastNotification
        show={showToast}
        onClose={() => setShowToast(false)}
        message={toastMessage}
        variant={toastVariant}
      />
    </Container>
  );
};

export default SKUListPage;
