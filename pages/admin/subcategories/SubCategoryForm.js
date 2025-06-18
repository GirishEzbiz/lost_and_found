import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Form, Button, Spinner, Alert } from "react-bootstrap";
import axios from "axios";
 

const SubCategoryForm = ({ categoryId }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nameError, setNameError] = useState(null); // Validation error for name field
  const router = useRouter();

  useEffect(() => {
    if (categoryId) {
      // Fetch category data if editing
      const fetchCategory = async () => {
        setLoading(true);
        setError(null);
        try {
          const { data } = await axios.get(`/api/admin/subcategories`, {
            params: { id: categoryId },
          });
          setName(data.name || "");
          setDescription(data.description || "");
        } catch (err) {
          console.log("error fetching subcategories", err);
          
          setError("Failed to fetch subcategory data.");
      }
       finally {
          setLoading(false);
        }
      };
      fetchCategory();
    }
  }, [categoryId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setNameError(null);

    // Validate name field
    if (!name.trim()) {
      setNameError("Sub Category Name is required.");
      return;
    }

    setLoading(true);
    try {
      const endpoint = categoryId
        ? `/api/admin/subcategories?id=${categoryId}`
        : "/api/admin/subcategories";
      const method = categoryId ? "put" : "post";

      await axios({
        method,
        url: endpoint,
        data: { name, description },
      });

      router.push("/admin/subcategories");
    } catch (err) {
      console.log("error saveing subcategories", err);
      const message = err.response?.data?.message || "An error occurred while saving the subcategory.";
      setError(message);
  }
   finally {
      setLoading(false);
    }
  };

  return (

    // <Form onSubmit={handleSubmit}>
    //   {error && <Alert variant="danger">{error}</Alert>}

    //   <Form.Group className="mb-3">
    //     <Form.Label>
    //     Sub Category Name <span className="text-danger">*</span>
    //     </Form.Label>
    //     <Form.Control
    //       type="text"
    //       value={name}
    //       onChange={(e) => setName(e.target.value)}
    //       isInvalid={!!nameError}
    //     />
    //     {nameError && <Form.Control.Feedback type="invalid">{nameError}</Form.Control.Feedback>}
    //   </Form.Group>

    //   <Form.Group className="mb-3">
    //     <Form.Label>Description</Form.Label>
    //     <Form.Control
    //       as="textarea"
    //       rows={3}
    //       value={description}
    //       onChange={(e) => setDescription(e.target.value)}
    //     />
    //   </Form.Group>

    //   <Button variant="primary" type="submit" disabled={loading}>
    //     {loading ? <Spinner animation="border" size="sm" /> : "Save Subcategory"}
    //   </Button>
    // </Form>

    <Form onSubmit={handleSubmit} className="p-4 rounded-3 shadow-sm bg-white modern-form">
  <style>{`
    .modern-form .form-label {
      color: #444 !important;
      font-weight: 500;
      font-size: 14px;
    }

    .modern-form .form-control {
      border-radius: 6px;
      border: 1px solid #ccc;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
      font-size: 14px;
      padding: 10px 12px;
    }

    .modern-form .form-control:focus {
      border-color: #624BFF;
      box-shadow: 0 0 0 0.2rem rgba(98, 75, 255, 0.1);
      outline: none;
    }

    .modern-form .btn-save {
      background-color: #624BFF;
      border: none;
      font-weight: 500;
      border-radius: 6px;
      padding: 0.5rem 1.5rem;
      box-shadow: 0px 4px 10px rgba(98, 75, 255, 0.15);
    }

    .modern-form .btn-save:hover {
      background-color: #D3D3D3
    }
  `}</style>

  {error && <Alert variant="danger">{error}</Alert>}

  <Form.Group className="mb-4">
    <Form.Label>
      Sub Category Name <span className="text-danger">*</span>
    </Form.Label>
    <Form.Control
      type="text"
      value={name}
      onChange={(e) => setName(e.target.value)}
      isInvalid={!!nameError}
      placeholder="Enter subcategory name"
    />
    {nameError && (
      <Form.Control.Feedback type="invalid">{nameError}</Form.Control.Feedback>
    )}
  </Form.Group>

  <Form.Group className="mb-4">
    <Form.Label>Description</Form.Label>
    <Form.Control
      as="textarea"
      rows={3}
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      placeholder="Write a brief description..."
    />
  </Form.Group>

  <div className="text-end">
    <Button type="submit" disabled={loading} className="btn-save" style={{background:"#aa2191",color:"white"}}>
      {loading ? <Spinner animation="border" size="sm" /> : "Save Subcategory"}
    </Button>
  </div>
</Form>

  );
};

export default SubCategoryForm;
