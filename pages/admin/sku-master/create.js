import useToast from "hooks/useToast";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import {
  Form,
  Button,
  Row,
  Col,
  Alert,
  Container,
  Card,
} from "react-bootstrap"; // Importing React Bootstrap components
import SkuForm from "./SkuForm";
import { MdOutlineKeyboardBackspace } from "react-icons/md";


const SKUForm = ({ skuId }) => {
  // const [brands, setBrands] = useState([]);
  // const [categories, setCategories] = useState([]);
  // const [subcategories, setSubcategories] = useState([]);
  // const [skuData, setSkuData] = useState({
  //   category_id: "",
  //   subcategory_id: "",
  //   name: "",
  // });
  // const [error, setError] = useState("");
  // const [isLoading, setLoading] = useState(false);
  // useEffect(() => {
  //   // Fetch brands, categories, and subcategories
  //   const fetchData = async () => {
  //     try {
  //       const brandsResponse = await fetch("/api/admin/brands");
  //       const brandsData = await brandsResponse.json();
  //       setBrands(brandsData);

  //       const categoriesResponse = await fetch("/api/admin/categories");
  //       const categoriesData = await categoriesResponse.json();
  //       setCategories(categoriesData);

  //       const subcategoriesResponse = await fetch("/api/admin/subcategories");
  //       const subcategoriesData = await subcategoriesResponse.json();
  //       setSubcategories(subcategoriesData);

  //       // If SKU ID is provided (edit mode), fetch SKU details for editing
  //       if (skuId) {
  //         const skuResponse = await fetch(`/api/admin/sku?id=${skuId}`);
  //         const skuData = await skuResponse.json();
  //         const sku = skuData[0]; // Assuming single SKU is returned
  //         setSkuData({
  //           category_id: sku.category_id,
  //           subcategory_id: sku.subcategory_id,
  //           name: sku.name,
  //         });
  //       }
  //     } catch (error) {
  //      console.log("error fetching data ", error);
  //   }
    
  //   };

  //   fetchData();
  // }, [skuId]); // Run when skuId changes

  return (
    <Container fluid className="p-6" style={{ width: "98%" }}>
      <Row className="align-items-center my-3" style={{ marginTop: "-15px!important" }}>
        <Col>
          <h3>Add Sku</h3>
        </Col>
        <Col className="text-end">
          <Link href="/admin/sku-master" passHref>
            <Button variant="primary" className="" style={{background:"#a22191",border:"none",color:"white"}}> <MdOutlineKeyboardBackspace className="me-2 fs-4" />Back</Button>
          </Link>
        </Col>
      </Row>
      <Card className="shadow-sm">
        <Card.Body>
          <SkuForm/>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SKUForm;
