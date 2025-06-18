import useToast from "hooks/useToast";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import CustomSelect from "utils/ui/CustomSelect";
import CodeMiningForm from "./CodeMiningForm";
import { Button, Card, Col, Container, Row } from "react-bootstrap";


const SKUForm = ({ skuId }) => {
  const router = useRouter();
  
  useEffect(() => {
    // Fetch brands, categories, and subcategories
    const fetchData = async () => {
      try {
        const brandsResponse = await fetch("/api/admin/brands");
        const brandsData = await brandsResponse.json();
        setBrands(brandsData);

        const categoriesResponse = await fetch("/api/admin/categories");
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);

        const subcategoriesResponse = await fetch("/api/admin/subcategories");
        const subcategoriesData = await subcategoriesResponse.json();
        setSubcategories(subcategoriesData);

        // If SKU ID is provided (edit mode), fetch SKU details for editing
        if (skuId) {
          const skuResponse = await fetch(`/api/admin/sku?id=${skuId}`);
          const skuData = await skuResponse.json();
          const sku = skuData[0]; // Assuming single SKU is returned
          setSkuData({
            brand_id: sku.brand_id,
            // category_id: sku.category_id,
            // subcategory_id: sku.subcategory_id,
            name: sku.name,
            description: sku.description,
            code_length: sku.code_length,
            total_codes: sku.total_codes,
            code_type: sku.code_type,
          });
        }
      } catch (error) {
        console.log("error fetching data",error);
    }
    
    };

    fetchData();
  }, [skuId]); // Run when skuId changes
  

 

  
  // const brandOptions = brands.map((brand) => ({
  //   value: String(brand.id),
  //   label: brand.name,
  // }));
  // console.log("brand",brands,brandOptions);

  // const handleBrandChange = (selectedOption) => {
  //   console.log(selectedOption);
  //   setSkuData({ ...skuData, brand: String(selectedOption.value) });
  // };
  return (
    <Container fluid className="p-6">
      <Row className="align-items-center my-4">
        <Col>
          <h3>Create Template</h3>
        </Col>
        <Col className="text-end">
          <Link href="/admin/code-mining" passHref>
            <Button variant="danger" className=""> <MdOutlineKeyboardBackspace className="me-2 fs-4" />Back</Button>
          </Link>
        </Col>
      </Row>
      <Card className="shadow-sm ">
        <Card.Body>
        <CodeMiningForm/>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SKUForm;
