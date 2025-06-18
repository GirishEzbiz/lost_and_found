
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Form, Button, Spinner, Alert, Row, Col, Container } from 'react-bootstrap';

const SkuForm = ({ skuId }) => {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [skuData, setSkuData] = useState({
    category_id: '',
    subcategory_id: '',
    name: '',
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSkuLoading, setSkuLoading] = useState(false);

  // Fetch categories and subcategories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/admin/categories');
        const data = await res.json();
        setCategories(data.data);
      } catch (error) {
        console.log("error fetching categorys ", error);
        setError("Error fetching categories");
    }
    };

    fetchCategories();
  }, []);

  // Fetch SKU data if editing
  useEffect(() => {
    const fetchData = async () => {
      if (skuId) {
        setSkuLoading(true);
      }
      try {
        const categoriesResponse = await fetch("/api/admin/categories");
        const categories = await categoriesResponse.json();
        const categoriesData = categories.data
        setCategories(categoriesData);

        const subcategoriesResponse = await fetch("/api/admin/subcategories");
        const subcategories = await subcategoriesResponse.json();
        const subcategoriesData = subcategories.subcategories
        setSubcategories(subcategoriesData);

        if (skuId) {
          const skuResponse = await fetch(`/api/admin/sku?id=${skuId}`);
          const skuData = await skuResponse.json();
          const sku = skuData[0]; // Assuming single SKU is returned
          setSkuData({
            category_id: sku.category_id,
            subcategory_id: sku.subcategory_id,
            name: sku.name,
          });
        }
      } catch (error) {
        console.log("error fetching skus data ", error);
        setError("Error fetching SKU data");
    } finally {
        if (skuId) {
          setSkuLoading(false);
        }
        setLoading(false);
      }
    };

    fetchData();
  }, [skuId]);

  // Fetch subcategories based on selected category
  const handleCategoryChange = async (e) => {
    const categoryId = e.target.value;
    setSkuData({ ...skuData, category_id: categoryId, subcategory_id: '' }); // Reset subcategory
    if (categoryId) {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/subcategories?categoryId=${categoryId}`);
        const data = await res.json();
        const subcategories = data.subcategories;
        setSubcategories(subcategories);
      } catch (error) {
        console.log("error fetching subcategories ", error);
        setError("Error fetching subcategories");
    } finally {
        setLoading(false);
      }
    }
  };

  // Handle form field change
  const handleChange = (e) => {
    setSkuData({
      ...skuData,
      [e.target.name]: e.target.value,
    });
    setErrors({ ...errors, [e.target.name]: '' }); // Clear field-specific error
  };

  // Validate fields
  const validateFields = () => {
    const validationErrors = {};
    if (!skuData.category_id) validationErrors.category_id = 'Category is required.';
    if (!skuData.subcategory_id) validationErrors.subcategory_id = 'Subcategory is required.';
    if (!skuData.name.trim()) validationErrors.name = 'SKU Name is required.';

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!validateFields()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const requestOptions = {
        method: skuId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(skuData),
      };

      const response = await fetch(
        skuId ? `/api/admin/sku?id=${skuId}` : '/api/admin/sku',
        requestOptions
      );

      if (response.ok) {
        router.push('/admin/sku-master');
      } else {
        const error = await response.json();
        setError(error.message || 'There was an error saving the SKU.');
      }
    } catch (error) {
      console.log("error saveing the skus ", error);
      setError("There was an error saving the SKU.");
  } finally {
      setIsSubmitting(false);
    }
  };

  if (isSkuLoading) {
    return (
      <Container fluid className="p-6">
        <Row className="justify-content-center">
          <Spinner animation="border" variant="primary" />
        </Row>
      </Container>
    );
  }

  return (

    // <div>
    //   {isLoading && <Spinner animation="border" />}
    //   <Form onSubmit={handleSubmit} className="space-y-4">
    //     {error && <Alert variant="danger">{error}</Alert>}
    //     <Row className="mb-3">
    //       <Col md={6}>
    //         <Form.Group controlId="category_id">
    //           <Form.Label>Category</Form.Label>
    //           <Form.Control
    //             as="select"
    //             name="category_id"
    //             value={skuData.category_id}
    //             onChange={handleCategoryChange}
    //             isInvalid={!!errors.category_id}
                
    //           >
    //             <option value="">Select Category</option>
    //             {categories?.map((category) => (
    //               <option key={category.id} value={category.id}>
    //                 {category.name}
    //               </option>
    //             ))}
    //           </Form.Control>
    //           <Form.Control.Feedback type="invalid">{errors.category_id}</Form.Control.Feedback>
    //         </Form.Group>
    //       </Col>
    //       <Col md={6}>
    //         <Form.Group controlId="subcategory_id">
    //           <Form.Label>Subcategory</Form.Label>
    //           <Form.Control
    //             as="select"
    //             name="subcategory_id"
    //             value={skuData.subcategory_id}
    //             onChange={handleChange}
    //             isInvalid={!!errors.subcategory_id}
    //             required
    //             disabled={!skuData.category_id} // Disable subcategory if no category selected
    //           >
    //             <option value="">Select Subcategory</option>
    //             {subcategories?.map((subcategory) => (
    //               <option key={subcategory.id} value={subcategory.id}>
    //                 {subcategory.name}
    //               </option>
    //             ))}
    //           </Form.Control>
    //           <Form.Control.Feedback type="invalid">{errors.subcategory_id}</Form.Control.Feedback>
    //         </Form.Group>
    //       </Col>
    //     </Row>
    //     <Row className="mb-3">
    //       <Col md={6}>
    //         <Form.Group controlId="name">
    //           <Form.Label>SKU Name <span className="text-danger">*</span></Form.Label>
    //           <Form.Control
    //             type="text"
    //             name="name"
    //             value={skuData.name}
    //             onChange={handleChange}
    //             isInvalid={!!errors.name}
               
    //           />
            
    //           <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
    //         </Form.Group>
    //       </Col>
    //     </Row>

    //     <Button variant="primary" type="submit" disabled={isSubmitting}>
    //       {isSubmitting ? 'Saving...' : skuId ? 'Update SKU' : 'Create SKU'}
    //     </Button>
    //   </Form>
    // </div>
    

    <div className="p-4 rounded-3 shadow-sm bg-white modern-form">
  <style>{`
    .modern-form .form-label {
      color: #444 !important;
      font-weight: 500;
      font-size: 14px;
    }

    .modern-form .form-control {
      border-radius: 6px;
      border: 1px solid #ccc;
      font-size: 14px;
      padding: 10px 12px;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .modern-form .form-control:focus {
      border-color: #624bff;
      box-shadow: 0 0 0 0.15rem rgba(98, 75, 255, 0.2);
      outline: none;
    }

    .modern-form .btn-submit {
      background-color: #624bff;
      border: none;
      font-weight: 500;
      border-radius: 6px;
      padding: 0.5rem 1.5rem;
      box-shadow: 0px 4px 12px rgba(98, 75, 255, 0.15);
    }

    .modern-form .btn-submit:hover {
      background-color: #D3D3D3;
    }

    .modern-form .spinner-border {
      margin-bottom: 10px;
    }
  `}</style>

  {isLoading && <Spinner animation="border" />}

  <Form onSubmit={handleSubmit} className="modern-form">
    {error && <Alert variant="danger">{error}</Alert>}

    <Row className="mb-4">
      <Col md={6}>
        <Form.Group controlId="category_id">
          <Form.Label>Category</Form.Label>
          <Form.Control
            as="select"
            name="category_id"
            value={skuData.category_id}
            onChange={handleCategoryChange}
            isInvalid={!!errors.category_id}
          >
            <option value="">Select Category</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Form.Control>
          <Form.Control.Feedback type="invalid">
            {errors.category_id}
          </Form.Control.Feedback>
        </Form.Group>
      </Col>

      <Col md={6}>
        <Form.Group controlId="subcategory_id">
          <Form.Label>Subcategory</Form.Label>
          <Form.Control
            as="select"
            name="subcategory_id"
            value={skuData.subcategory_id}
            onChange={handleChange}
            isInvalid={!!errors.subcategory_id}
            required
            disabled={!skuData.category_id}
          >
            <option value="">Select Subcategory</option>
            {subcategories?.map((subcategory) => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </option>
            ))}
          </Form.Control>
          <Form.Control.Feedback type="invalid">
            {errors.subcategory_id}
          </Form.Control.Feedback>
        </Form.Group>
      </Col>
    </Row>

    <Row className="mb-4">
      <Col md={6}>
        <Form.Group controlId="name">
          <Form.Label>
            SKU Name <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={skuData.name}
            onChange={handleChange}
            isInvalid={!!errors.name}
            placeholder="Enter SKU name"
          />
          <Form.Control.Feedback type="invalid">
            {errors.name}
          </Form.Control.Feedback>
        </Form.Group>
      </Col>
    </Row>

    <div className="text-end">
      <Button type="submit" disabled={isSubmitting} className="btn-submit" style={{background:"#a22191",border:"none",color:"white"}}>
        {isSubmitting ? 'Saving...' : skuId ? 'Update SKU' : 'Create SKU'}
      </Button>
    </div>
  </Form>
</div>

  );
};

export default SkuForm;
