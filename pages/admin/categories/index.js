import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  CardHeader,
  CardBody,
  Pagination,
} from "react-bootstrap";
import Link from "next/link";
import Swal from "sweetalert2";
import ToastNotification from "../../components/ToastNotification";
import GetPermission from "utils/getpermissions";
import Cookies from "js-cookie";


const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");
  const [totalRecord, setTotalRecord] = useState(0)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = Cookies.get("Page-limit" )||10

  const [totalPages, setTotalPages] = useState(1);
  const [permissions, setPermissions] = useState({
    canAdd: false,
    canEdit: false,
    canDelete: false,
  });
  useEffect(() => {
    setPermissions({
      canAdd: GetPermission("add-category"),
      canEdit: GetPermission("edit-category"),
      canDelete: GetPermission("delete-category"),
    });
  }, []);
  useEffect(() => {


    fetchCategories();
  }, [currentPage, searchTerm]);





  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/categories?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}`);
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch categories");
      }
      console.log(result,'result'),

      setCategories(result.data);
      setFilteredCategories(result.data); // Optional: remove this if no local search needed
      setTotalPages(Math.ceil(result.total / itemsPerPage));
      setTotalRecord(result.total)
    } catch (error) {
      console.log("error fetching categories", error);
    } finally {
      setLoading(false);
    }
  };




  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setCurrentPage(1); // always reset to first page on new search
  };


  const deleteCategory = async (id) => {
    try {
      const response = await fetch(`/api/admin/categories?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setToastMessage("Category deleted successfully!");
        setToastVariant("success");
        setShowToast(true);

        setCategories((prevCategories) =>
          prevCategories.filter((category) => category.id !== id)
        );
        setFilteredCategories((prevCategories) =>
          prevCategories.filter((category) => category.id !== id)
        );
      } else {
        const errorData = await response.json();
        setToastMessage("Error deleting category. Please try again.");
        setToastVariant("danger");
        setShowToast(true);
      }
    } catch (error) {
      console.log("error deleteing category", error);

      setToastMessage("Error deleting category. Please try again.");
      setToastVariant("danger");
      setShowToast(true);
    }
    finally {
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
        deleteCategory(id);
      }
    });
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCategories?.slice(
    indexOfFirstItem,
    indexOfLastItem
  );


  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <Container fluid className="p-2" style={{ width: "95%" }}>
      <Row className="align-items-center my-2">
        <Col>
          <h3>Categories List</h3>
        </Col>
      </Row>

      <Card>
        <CardHeader>
          <div className="justify-content-between row">
            <div className="mb-3 col-md-6">
              <input
                placeholder="Search by Category Name"
                className="form-control w-50"
                type="search"
                value={searchTerm}
                onChange={handleSearch}
                />
            </div>
            <div className="text-lg-end mb-3 col-md-6">
              {permissions.canAdd && (
                <Link
                  href="/admin/categories/create"
                  passHref
                  className="btn  me-2"
                  style={{background:"#a22191",color:"white"}}
                >
                  + Add New Category
                </Link>
              )}
            </div>
          </div>
        </CardHeader>
        {loading ? (
          <div className="d-flex justify-content-center my-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : filteredCategories?.length === 0 ? (
          <p className="text-center">No categories found.</p>
        ) : (
          <CardBody>
              <p>Showing {filteredCategories?.length} out of {totalRecord}</p>

            <div className="table-responsive" style={{ maxHeight: "300px", overflowY: "auto" }}>
              <table id="example" className="text-nowrap table-centered mt-0 table">
                <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 10, background: "white" }}>
                  <tr>
                    <th scope="col" className="text-inherit">ID</th>
                    <th scope="col">Name</th>
                    <th scope="col">Description</th>
                    {(permissions.canEdit || permissions.canDelete) && (
                      <th scope="col">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category, index) => (

                    <tr key={category.id}>
                      <td className="text-inherit">
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td>{category.name}</td>
                      <td>{category.description}</td>
                      <td>
                        <div className="d-flex align-items-center text-secondary">
                          {permissions.canEdit && (
                            <Link
                              href={`/admin/categories/edit/${category.id}`}
                              passHref
                              className="btn btn-ghost btn-icon custom-btn-icon btn-sm rounded-circle"
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
                          )}
                          {
                            permissions.canDelete && (
                              <div
                                className="btn btn-ghost btn-icon btn-sm rounded-circle"
                                onClick={() => handleDeleteClick(category.id)}
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

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>




            {/* Updated Pagination */}
            <div className="d-flex justify-content-between align-items-center mt-4">
              <Pagination className="justify-content-end custom-pagination ">
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
          </CardBody>
        )}
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

export default CategoriesPage;
