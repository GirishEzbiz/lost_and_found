// pages/categories/create.js
import { Button, Card, Col, Container, Row, Toast } from "react-bootstrap";
import Link from "next/link";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import BrandForm from "./BrandForm";

const CreateCategoryPage = () => {
  return (
    <Container fluid className="" style={{ width: "95%" }}>
      <Row className="align-items-center my-4">
        <Col>
          <h3>Add Brand</h3>
        </Col>
        <Col className="text-end">
          <Link href="/admin/brands"    passHref>
            <Button variant="primary" className="" style={{background:"#a22191",border:"none",color:"white"}}> <MdOutlineKeyboardBackspace className="me-2 fs-4" />Back</Button>
          </Link>
        </Col>
      </Row>
      <Card className="">
        <Card.Body>
          <BrandForm />
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CreateCategoryPage;
