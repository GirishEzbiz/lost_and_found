import { useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { Modal } from "react-bootstrap"; // Bootstrap Modal for confirmation
import "bootstrap/dist/css/bootstrap.min.css"; // Make sure Bootstrap is imported

const Users = ({ session }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Sample data - You can replace this with actual user data from an API
  const users = [
    { id: 1, name: "John Doe", email: "john@example.com" },
    { id: 2, name: "Jane Smith", email: "jane@example.com" },
    { id: 3, name: "Alice Johnson", email: "alice@example.com" },
  ];

  // Handle user deletion
  const handleDeleteUser = (userId) => {
    setUserToDelete(userId);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = () => {
    // Here you would call an API to delete the user, e.g., deleteUserAPI(userToDelete);
    console.log(`User with ID ${userToDelete} has been deleted.`);
    setShowDeleteModal(false);
    // You may also want to refresh the user list after deletion
  };

  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-semibold mb-4">User List</h1>

        {/* Add User Button */}
        <div className="mb-3">
          <button className="btn btn-primary">Add User</button>
        </div>

        {/* Bootstrap Table */}
        <table className="table table-striped">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id}>
                <td>{index + 1}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteUser(user.id)}
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
            <Modal.Title>Delete User</Modal.Title>
          </Modal.Header>
          <Modal.Body>Are you sure you want to delete this user?</Modal.Body>
          <Modal.Footer>
            <button
              className="btn btn-secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </button>
            <button className="btn btn-danger" onClick={confirmDeleteUser}>
              Delete
            </button>
          </Modal.Footer>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default Users;
