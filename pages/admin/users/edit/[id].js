// pages/categories/edit/[id].js
import { useRouter } from "next/router";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import Link from "next/link";
import UsersForm from "../UsersForm";

const EditUserPage = () => {
  const router = useRouter();
  const { id } = router.query;
  return (
    <Container fluid className="p-6">
      <Row className="align-items-center my-4">
        <Col>
          <h3>Edit Brand</h3>
        </Col>
        <Col className="text-end">
        <Link href="/admin/users" passHref>
            <Button variant="danger" className=""> <MdOutlineKeyboardBackspace className="me-2 fs-4" />Back</Button>
          </Link>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body>
          <UsersForm userId={id} />
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EditUserPage;
