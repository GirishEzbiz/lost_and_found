// pages/categories/create.js
import { Button, Card, Col, Container, Row, Toast } from "react-bootstrap";
import Link from "next/link";
import SubCategoryForm from "./SubCategoryForm";
import { MdOutlineKeyboardBackspace } from "react-icons/md";

const CreateCategoryPage = () => {
  return (
    <Container fluid className="p-6" style={{width: "98%"}}>
      <Row className="align-items-center my-3" style={{ marginTop: "-15px!important" }}>
        <Col>
          <h3>Add New Sub Category</h3>
        </Col>
        <Col className="text-end">
          <Link href="/admin/subcategories" passHref >
            <Button   className="" style={{background:"#aa2191",color:"white",border:"none"}}> <MdOutlineKeyboardBackspace className="me-2 fs-4"  />Back</Button>
          </Link>
        </Col>
      </Row>  
      <Card className="shadow-sm">
        <Card.Body>
          <SubCategoryForm />
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CreateCategoryPage;
