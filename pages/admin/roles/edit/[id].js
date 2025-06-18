// pages/categories/edit/[id].js
import { useRouter } from "next/router";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import Link from "next/link";
import TeamForm from "../TeamForm";


const EditUserPage = () => {
  const router = useRouter();
  const { id } = router.query;
  return (
    <Container fluid  style={{width: '95%'}}>
      <Row className="align-items-center my-3">
        <Col>
          <h3>Edit Role</h3>
        </Col>
        <Col className="text-end">
        <Link href="/admin/roles" passHref>
            <Button variant="primary" className=""> <MdOutlineKeyboardBackspace className="me-2 fs-4" />Back</Button>
          </Link>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body>
          <TeamForm userId={id} />
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EditUserPage;
