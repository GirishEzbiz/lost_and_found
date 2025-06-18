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
  const [searchTerm, setSearchTerm] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = Cookies.get("Page-limit" )|| 10; // Show 50 items per page

  const [permissions, setPermissions] = useState({
    canAdd: false,
    canEdit: false,
    canDelete: false,
  });
  useEffect(() => {
    setPermissions({
      canAdd: GetPermission("add-subcategory"),
      canEdit: GetPermission("edit-subcategory"),
      canDelete: GetPermission("delete-subcategory"),
    });
  }, []);
  // console.log(permissions)


  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCategories();
    }, 300); // debounce for smoother search

    return () => clearTimeout(delayDebounce);
  }, [currentPage, searchTerm]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`/api/admin/subcategories?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}`);
      const data = await response.json();

      setCategories(data.subcategories || []);
      setTotalCount(data.total || 0);
    } catch (error) {

      setError("Error fetching categories");
    } finally {
      setLoading(false);
    }
  };
  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    setCurrentPage(1); // reset to first page on new search
  };


  const deleteCategory = async (id) => {
    try {
      const response = await fetch(`/api/admin/subcategories?id=${id}`, {
        method: "DELETE",
      });

      // console.log("res",response)
      if (response.ok) {
        const data = await response.json();
        setToastMessage("Sub Category deleted successfully!");
        setToastVariant("success");
        setShowToast(true);

        setCategories((prev) => prev.filter((category) => category.id !== id));
       
      } else {
        setToastMessage("Error deleting category. Please try again.");
        setToastVariant("danger");
        setShowToast(true);
      }
    } catch (error) {
      console.log("error deleteing categories", error);

      setToastMessage("Error deleting category. Please try again.");
      setToastVariant("danger");
      setShowToast(true);
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
  const currentItems = categories;
  const totalPages = Math.ceil(totalCount / itemsPerPage);


  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <Container fluid className="p-2" style={{ width: "95%" }}>
      <Row className="align-items-center my-2">
        <Col>
          <h3>Sub Categories List</h3>
        </Col>
      </Row>

      <Card>
        <CardHeader>
          <div className="row justify-content-between">
            <div className="col-md-3">
              <input
                placeholder="Search for Sub Category Name"
                className="form-control"
                type="search"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <div className="col-md-6 text-lg-end">
              {permissions.canAdd && (
                <Link href="/admin/subcategories/create" passHref>
                  <button className="btn btn-primary" style={{background:"#aa2191",color:"white",border:"none"}}>+ Add Sub Category</button>
                </Link>
              )}
            </div>
          </div>
        </CardHeader>

        {loading ? (
          <div className="d-flex justify-content-center my-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : categories?.length === 0 ? (
          <CardBody className="text-center py-5">
            <p className="mb-4">
              <strong>No subcategories found.</strong>
            </p>
            {permissions.canAdd && (
              <Link href="/admin/subcategories/create" passHref>
                <button className="btn btn-primary">+ Add Sub Category</button>
              </Link>
            )}

          </CardBody>
        ) : (
          <CardBody>
             <p>Showing: {categories.length} out of {totalCount}</p>
            <div className="table-responsive" style={{ maxHeight: "300px", overflowY: "auto" }}>
              <table className="table table-centered">
                <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 10, background: "white" }}>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Description</th>
                    {(permissions.canEdit || permissions.canDelete) && (
                      <th scope="col">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((category, index) => (
                    <tr key={category.id}>
                      <td>{indexOfFirstItem + index + 1}</td>
                      <td>{category.name}</td>
                      <td>{category.description}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          {
                            permissions.canEdit && (
                              <Link
                                href={`/admin/subcategories/edit/${category.id}`}
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

            {/* Pagination */}
            <div className="d-flex justify-content-between align-items-center mt-4">
             
              <Pagination className="justify-content-end custom-pagination">
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
