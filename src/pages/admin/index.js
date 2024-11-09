import { useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { Modal } from "react-bootstrap"; // Bootstrap Modal for confirmation
import "bootstrap/dist/css/bootstrap.min.css"; // Make sure Bootstrap is imported

const AdminDashboard = ({ session }) => {
  // Sample data
  const orders = [
    {
      id: 1,
      status: "Shipped",
      user: "John Doe",
      item: "Laptop",
      trackingId: "XYZ123",
    },
    {
      id: 2,
      status: "Pending",
      user: "Jane Smith",
      item: "Phone",
      trackingId: "ABC456",
    },
    {
      id: 3,
      status: "Shipped",
      user: "Alice Johnson",
      item: "Wallet",
      trackingId: "DEF789",
    },
  ];

  const lostItems = [
    { id: 1, status: "Reported", item: "Bag", reportedBy: "John Doe" },
    { id: 2, status: "Found", item: "Keys", reportedBy: "Alice Johnson" },
    { id: 3, status: "Unresolved", item: "Phone", reportedBy: "Jane Smith" },
  ];

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Handle item deletion
  const handleDeleteItem = (itemId) => {
    setItemToDelete(itemId);
    setShowDeleteModal(true);
  };

  const confirmDeleteItem = () => {
    // Here you would call an API to delete the item, e.g., deleteItemAPI(itemToDelete);
    console.log(`Item with ID ${itemToDelete} has been deleted.`);
    setShowDeleteModal(false);
  };

  return (
    <AdminLayout>
      <div className="container-fluid p-4">
        <h1 className="text-3xl font-semibold mb-4">Admin Dashboard</h1>

        {/* Dashboard Overview */}
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card text-white bg-primary">
              <div className="card-header">Total Orders</div>
              <div className="card-body">
                <h5 className="card-title">{orders.length}</h5>
                <p className="card-text">Total number of orders placed.</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-white bg-success">
              <div className="card-header">Shipped Orders</div>
              <div className="card-body">
                <h5 className="card-title">
                  {orders.filter((order) => order.status === "Shipped").length}
                </h5>
                <p className="card-text">
                  Number of orders that have been shipped.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-white bg-warning">
              <div className="card-header">Pending Orders</div>
              <div className="card-body">
                <h5 className="card-title">
                  {orders.filter((order) => order.status === "Pending").length}
                </h5>
                <p className="card-text">Number of orders awaiting shipment.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lost and Found Items Overview */}
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card text-white bg-info">
              <div className="card-header">Total Lost Items</div>
              <div className="card-body">
                <h5 className="card-title">{lostItems.length}</h5>
                <p className="card-text">
                  Total number of items reported as lost.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-white bg-success">
              <div className="card-header">Found Items</div>
              <div className="card-body">
                <h5 className="card-title">
                  {lostItems.filter((item) => item.status === "Found").length}
                </h5>
                <p className="card-text">
                  Number of items that have been found.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-white bg-danger">
              <div className="card-header">Unresolved Items</div>
              <div className="card-body">
                <h5 className="card-title">
                  {
                    lostItems.filter((item) => item.status === "Unresolved")
                      .length
                  }
                </h5>
                <p className="card-text">
                  Number of items that are unresolved.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <h3 className="mb-4">Order Management</h3>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>#</th>
              <th>User</th>
              <th>Item</th>
              <th>Status</th>
              <th>Tracking ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr key={order.id}>
                <td>{index + 1}</td>
                <td>{order.user}</td>
                <td>{order.item}</td>
                <td>{order.status}</td>
                <td>{order.trackingId}</td>
                <td>
                  <button className="btn btn-success btn-sm">
                    Confirm Shipment
                  </button>
                  <button
                    className="btn btn-danger btn-sm ms-2"
                    onClick={() => handleDeleteItem(order.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Lost Items Table */}
        <h3 className="mb-4">Lost Items Management</h3>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>#</th>
              <th>Item</th>
              <th>Reported By</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {lostItems.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.item}</td>
                <td>{item.reportedBy}</td>
                <td>{item.status}</td>
                <td>
                  <button className="btn btn-primary btn-sm">
                    Mark as Found
                  </button>
                  <button
                    className="btn btn-danger btn-sm ms-2"
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Delete Item</Modal.Title>
          </Modal.Header>
          <Modal.Body>Are you sure you want to delete this item?</Modal.Body>
          <Modal.Footer>
            <button
              className="btn btn-secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </button>
            <button className="btn btn-danger" onClick={confirmDeleteItem}>
              Delete
            </button>
          </Modal.Footer>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
