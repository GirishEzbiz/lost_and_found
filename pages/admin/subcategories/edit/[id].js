// pages/categories/edit/[id].js
import { useRouter } from "next/router";
import { Button, Card, Col, Container, Row } from "react-bootstrap";

import { MdOutlineKeyboardBackspace } from "react-icons/md";
import Link from "next/link";
import SubCategoryForm from "../SubCategoryForm";

const EditCategoryPage = () => {
  const router = useRouter();
  const { id } = router.query;
  return (
    <Container fluid className="" style={{ width: "95%"}}>
      <Row className="align-items-center my-4">
        <Col>
          <h3>Edit Sub Category</h3>
        </Col>
        <Col className="text-end">
        <Link href="/admin/subcategories" passHref>
            <Button variant="primary" className="" style={{background:"#a22191",border:"none",color:"white"}}> <MdOutlineKeyboardBackspace className="me-2 fs-4" />Back</Button>
          </Link>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body>
          <SubCategoryForm categoryId={id} />
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EditCategoryPage;
