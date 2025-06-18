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
  Badge,
} from "react-bootstrap";
import Link from "next/link";
import Swal from "sweetalert2";
import ToastNotification from "../../components/ToastNotification";
import { MdOutlineMessage } from "react-icons/md";
import Image from "next/image";
import Cookies from "js-cookie";
import GetPermission from "utils/getpermissions";
import { FaUserPlus } from "react-icons/fa";



const BrandsPage = () => {
  const [brands, setBrands] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = Cookies.get("Page-limit") || 10; // Max brands per page

  const [permissions, setPermissions] = useState({
    canAdd: false,
    canViewAlert: false,
    canViewBrandUser: false,
    canEdit: false,
    canDelete: false,
  });
  useEffect(() => {
    setPermissions({
      canAdd: GetPermission("add-brand"),
      canViewAlert: GetPermission("view-brandAlert"),
      canViewBrandUser: GetPermission("view-brandUser"),
      canEdit: GetPermission("edit-brand"),
      canDelete: GetPermission("delete-brand"),
    });
  }, []);



  useEffect(() => {
    const delay = setTimeout(() => {

      if (searchTerm.length === 0 || searchTerm.length >= 3) {
        fetchBrands();

      } // Add debounce for cleaner UX

    }, 300); // debounce

    return () => clearTimeout(delay);
  }, [currentPage, searchTerm]);

  const fetchBrands = async () => {
    try {
      const response = await fetch(`/api/admin/brands?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}`);
      const data = await response.json();
      setBrands(data.brands || []);
      setTotalCount(data.total || 0);
    } catch (error) {
      console.log("error fetching brands", error);

    } finally {
      setLoading(false);
    }
  };


  const goToAlerts = (id) => {
    const brand = brands.find((b) => b.id === id);
    if (!brand) {
      console.error("Brand not found!");
      return;
    }

    window.location.href = `/admin/brands/alerts?brand_id=${brand.id}`;
  };

  const deleteBrand = async (id) => {
    try {
      const response = await fetch(`/api/admin/brands?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setToastMessage("Brand deleted successfully!");
        setToastVariant("success");
        setShowToast(true);

        setBrands((prevBrands) =>
          prevBrands.filter((brand) => brand.id !== id)
        );
      } else {
        setToastMessage("Error deleting brand. Please try again.");
        setToastVariant("danger");
        setShowToast(true);
      }
    } catch (error) {
      console.log("error delete brands", error);

      setToastMessage("Error deleting brand. Please try again.");
      setToastVariant("danger");
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        deleteBrand(id);
      }
    });
  };


  const paginatedBrands = brands;
  const totalPages = Math.ceil(totalCount / itemsPerPage);


  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <Container fluid className="p-2" style={{ width: "95%" }}>
      <Row className="align-items-center my-2">
        <Col>
          <h3>Brands</h3>
        </Col>
      </Row>

      <Card>
        <CardHeader>
          <div className="justify-content-between row">
            <div className="mb-3 col-md-6">
              <input
                placeholder="Search for Brand Name"
                className="form-control w-50"
                type="search"
                value={searchTerm} // Controlled input
                onChange={(e) => setSearchTerm(e.target.value)} // Update searchTerm
              />
            </div>
            <div className="text-lg-end mb-3 col-md-6">
              {
                permissions.canAdd && (
                  <Link
                    href="/admin/brands/create"
                    passHref
                    className="btn btn-primary me-2"
                    style={{ background: "#aa2191", border: "#aa2191",color: "#fff" }}
                  >
                    + Add Brand
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
        ) : brands.length === 0 ? (
          <div className="text-center my-5">
            <Image
              src="/images/not-found.png"
              alt="No data available"
              className="mb-3"
              width={200} // Set a fixed width
              height={200} // Set a fixed height (adjust as needed)
              style={{ maxWidth: "200px", width: "100%" }}
            />
            <h5 className="text-muted">No Brands Found</h5>
            <p className="text-secondary d-inline">
              We couldn’t find any brands matching your criteria. Try adjusting
              your filters or adding a new brand.
            </p>
            <Link href="/admin/brands/create" passHref>
              <span className="text-primary fw-bold ms-2 text-decoration-underline">
                + Add New
              </span>
            </Link>
          </div>
        ) : (
          <CardBody>
            <p>Showing {paginatedBrands.length} out of {totalCount}</p>
            <div
              style={{
                maxHeight: "300px",
                overflowY: "auto",
                overflowX: "auto",
              }}
            >
              <table
                id="example"
                className="text-nowrap table-centered mt-0 table"
              >
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
                    <th>#</th>
                    <th>Image</th>
                    <th>Brand Code</th>
                    <th>Brand Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    {
                      permissions.canViewAlert && (
                        <th>Alerts</th>
                      )
                    }

                    {(permissions.canViewBrandUser || permissions.canEdit || permissions.canDelete) && (
                      <th scope="col">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {paginatedBrands
                    ?.map((brand, index) => (
                      <tr key={brand.id}>
                        <td>{index + 1}</td>
                        <td>
                          <img
                            src={
                              brand?.image
                                ? brand.image
                                : "/images/blank-img.png"
                            }
                            alt="brand"
                            width="44"
                            height="32"
                            className="rounded img-4by3-xs"
                          />
                        </td>
                        <td>{brand.brand_code}</td>
                        <td>{brand.name}</td>
                        <td>{brand.email}</td>
                        <td>{brand.mobile}</td>
                        
                        {
                          permissions.canViewAlert && (
                            <td>
                              <Button
                                variant="warning"
                                size="sm"
                                onClick={() => goToAlerts(brand.id)}
                              >
                                Alert
                              </Button>
                            </td>
                          )
                        }


                        <td >


                          {
                            permissions.canViewBrandUser && (
                              // <Link
                              //   href={`/admin/brands/addUser/${brand.id}`}
                              //   passHref
                              //   className="btn btn-sm btn-primary rounded d-inline-flex align-items-center gap-1  px-1 text-sm "
                              //   style={{ marginRight: "10px", marginBottom: "12px" }}
                              // >
                              //   <span className="text-white fw-semibold">
                              //     <i className="bi bi-person-plus-fill me-1"></i>
                              //     Users
                              //   </span>
                              // </Link>

                              <Link
                              href={`/admin/brands/addUser/${brand.id}`}
                              passHref
                              className="btn btn-sm btn-primary rounded d-inline-flex align-items-center justify-center px-2"
                              style={{ marginRight: "10px", marginBottom: "12px", height: "27px", width: "32px",background: "#aa2191", border: "#aa2191" }}
                              
                            >
                              <FaUserPlus size={16} color="white" />
                            </Link>

                            )
                          }
                          {
                            permissions.canEdit && (
                              <Link
                                href={`/admin/brands/edit/${brand.id}`}
                                passHref
                                className="btn btn-ghost btn-icon btn-sm rounded-circle "
                                style={{ marginTop: "-12px" }}

                              >
                                <span>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="22"
                                    height="22"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
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
                                onClick={() => handleDeleteClick(brand.id)}
                                style={{ marginTop: "-12px" }}
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
              </table>
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

export default BrandsPage;
