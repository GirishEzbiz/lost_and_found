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
  Button,
  Badge,
} from "react-bootstrap";
import Link from "next/link";
import Swal from "sweetalert2";
import ToastNotification from "../../components/ToastNotification";
import Drawer from "react-modern-drawer"; // Import Drawer
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import "react-modern-drawer/dist/index.css"; // Import the drawer styles
import ItemCategoriesForm from "./itemcategoryform"; // Import your form component
import GetPermission from "utils/getpermissions";
import Cookies from "js-cookie";

const ItemCategories = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]); // Ensure always an array
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState(""); 
  const [toastVariant, setToastVariant] = useState("success");
  const [selectedCategory, setSelectedCategory] = useState(null);
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = Cookies.get("Page-limit" )|| 10; // Show 50 items per page
  
  const [drawerOpen, setDrawerOpen] = useState(false); // State to control drawer visibility
  const [totalPages, setTotalPages] = useState(1); // Add totalPages
  const [totalData, setTotalData] = useState(0)
  const [groupedCategories, setGroupedCategories] = useState([]);
  const [permissions, setPermissions] = useState({
    viewCategory: false,

  });
  useEffect(() => {
    setPermissions({
      viewCategory: GetPermission("view-item-category"),

    });
  }, []);

  // Toggle the drawer
  const handleDrawerToggle = () => {
    setSelectedCategory(null); // Clear previous selected category
    setDrawerOpen(!drawerOpen); // Open drawer
  };


  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.length === 0 || searchTerm.length >= 3) {
        fetchCategories(); // ✅ Hit API only if search is 0 or >= 3 chars
      }
    }, 300); // Add debounce for cleaner UX

    return () => clearTimeout(delayDebounce);
  }, [currentPage, searchTerm, drawerOpen]);

  const transformCategories = (data) => {
    const grouped = {};
    data.forEach((item) => {
      if (!grouped[item.id]) {
        grouped[item.id] = { id: item.id, category: item.category, messages: [] };
      }
      grouped[item.id].messages.push({ message: item.message, massageId: item.massageId });
    });
    return Object.values(grouped);
  };


  const fetchCategories = async () => {
    try {
      const response = await fetch(
        `/api/admin/itemcategory?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}`
      );
      const data = await response.json();

      // Ensure the data has 'categories' key and it's an array
      if (data.categories && Array.isArray(data.categories)) {
        const transformed = transformCategories(data.categories);
       
        setGroupedCategories(data.categories);
        setCategories(data.categories);
        setFilteredCategories(data.categories);
        setTotalPages(Math.ceil(data.total / itemsPerPage));
        setTotalData(data.total)
      } else {
        setCategories([]);
        setFilteredCategories([]);
      }
    } catch (error) {
      console.log("error fetching categories", error);
    } finally {
      setLoading(false);
    }
  };

  const currentItems = groupedCategories;
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // const currentItems = categories;


  const deleteMessage = async (messageId) => {
    try {


      const response = await fetch(`/api/admin/itemcategory?id=${messageId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setToastMessage("Message deleted successfully!");
        setToastVariant("success");
        setShowToast(true);

        fetchCategories()

        // Remove the deleted message from state
        // setFilteredCategories((prevMessages) =>
        //   prevMessages.filter((message) => message.message_id !== messageId)
        // );
      } else {
        setToastMessage("Error deleting message: " + data.error);
        setToastVariant("danger");
        setShowToast(true);
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      setToastMessage("An error occurred while deleting the message.");
      setToastVariant("danger");
      setShowToast(true);
    }
  };




  const handleDeleteClick = (messageId) => {

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
        deleteMessage(messageId); // Call delete function with message ID
      }
    });
  };


  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;


  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const handleEditClick = (category) => {
    setSelectedCategory(category); // Set the selected category
    setDrawerOpen(true); // Open the drawer
  };

  const handleAddClick = () => {
    setSelectedCategory(null); // Ensure fresh form
    setDrawerOpen(true); // Open drawer
  };



  return (
    <Container fluid className="p-2" style={{ width: "95%" }}>
      <Row className="align-items-center my-2">
        <Col>
          <h3>Item Categories List</h3>
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
              {/* Button to open the drawer */}
              <Button
                variant="primary"
                onClick={handleAddClick}
                className="btn   me-2"
                style={{ background: "#a22191", border: "#a22191", color: "#fff" }}
                >
                + Add New Item Category
              </Button>
            </div>
          </div>
        </CardHeader>

        {loading ? (
          <div className="d-flex justify-content-center my-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : filteredCategories.length === 0 ? (
          <p className="text-center">No categories found.</p>
        ) : (
          <CardBody>
            <p>Showing {categories.length} out of {totalData}</p>
            <div
              className="table-responsive"
              style={{ maxHeight: "300px", overflowY: "auto" }}
            >
              <table className="text-nowrap table-centered mt-0 table">
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
                    <th scope="col">ID</th>
                    <th scope="col">Name</th>
                    <th scope="col">Action</th>
                    {/* <th scope="col">Actions</th> */}
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((category, index) => (
                    <tr key={index}>
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td>{category.category}</td>{""}
                      {/* Updated: Now 'category' holds name */}
                      <td>

                        <div
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => {
                            if (permissions.viewCategory) {
                              handleEditClick(category);
                            }else{
                              Swal.fire({
                                icon: "warning",
                                title: "Access Denied",
                                text: "Sorry, you don't have permission to view this.",
                                confirmButtonColor: "#d33",
                              });
                            }
                          }}
                        >
                          <Badge  >

                            View
                            
                          </Badge >
                          <style>
                          {`
                          .badge {
                            background-color: #a22191!important;
                            color: #fff!important;`}
                          </style>
                        </div>

                      </td>
                      {/* Updated: Now 'message' instead of 'description' */}
                      {/* <td>
                        <div className="d-flex align-items-center text-secondary">
                          <div
                            className="btn btn-ghost btn-icon btn-sm rounded-circle"
                            onClick={() => handleDeleteClick(category.massageId)}
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
                        </div>
                      </td> */}
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

      {/* Toast Notification */}
      <ToastNotification
        show={showToast}
        onClose={() => setShowToast(false)}
        message={toastMessage}
        variant={toastVariant}
      />

      {/* Drawer for Item Categories Form */}
      <Drawer
        open={drawerOpen}
        onClose={handleDrawerToggle}
        direction="right"
        className="drawer-container"
        style={{
          width: "450px", // Adjust the width
          transition: "width 0.3s ease-in-out", // Add smooth transition
        }}
      >
        <Card className="shadow-sm">
          <Card.Body>
            <h4 className="mb-3">{selectedCategory
              ? `Selected Messages for "${selectedCategory.category}"`
              : "Add Item Category Form"}</h4>
            <ItemCategoriesForm
              key={selectedCategory ? selectedCategory.id : "new"} // 👈 This is the fix!
              setDrawerOpen={setDrawerOpen}
              selectedCategory={selectedCategory}
              onSave={fetchCategories}
            />

          </Card.Body>
        </Card>
      </Drawer>
    </Container>
  );
};

export default ItemCategories;
