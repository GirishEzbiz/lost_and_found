// pages/categories/create.js
import { Button, Card, Col, Container, Row, Toast } from "react-bootstrap";
import Link from "next/link";
import CategoryForm from "./CategoryForm";
import { MdOutlineKeyboardBackspace } from "react-icons/md";

const CreateCategoryPage = () => {
  return (
    <Container fluid className="p-6" style={{width: "98%"}}>
      <Row className="align-items-center my-3" style={{ marginTop: "-15px!important" }}>
        <Col> 
          <h3 className="">Add New Category</h3>
        </Col>
        <Col className="text-end">
          {/* <Link href="/admin/categories" passHref>
            <Button variant="danger">Back</Button>
          </Link> */}
          <Link href="/admin/categories" passHref>
            <Button   className="" style={{background:"#a22191",border:"#a22191",color:"#fff"}}> <MdOutlineKeyboardBackspace className="me-2 fs-4" />Back</Button>
          </Link>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body>
          <CategoryForm />
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CreateCategoryPage;
