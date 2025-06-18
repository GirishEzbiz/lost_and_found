import { useRouter } from "next/router";
import React from "react";
import { Button, Card, Col, Container, Row } from "react-bootstrap";

import CodeMiningForm from "../CodeMiningForm";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import Link from "next/link";

const EditCodeMining = () => {
  const router = useRouter();
  const { id } = router.query;
  return (
    <>
      <Container fluid className="p-6">
        <Row className="align-items-center my-4">
          <Col>
            <h3>Edit Category</h3>
          </Col>
          <Col className="text-end">
            <Link href="/admin/code-mining" passHref>
              <Button variant="danger" className="">
                {" "}
                <MdOutlineKeyboardBackspace className="me-2 fs-4" />
                Back
              </Button>
            </Link>
          </Col>
        </Row>

        <Card className="shadow-sm">
          <Card.Body>
            <CodeMiningForm tempId={id} />
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default EditCodeMining;
