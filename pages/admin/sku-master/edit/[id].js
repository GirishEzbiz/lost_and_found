import useToast from "hooks/useToast";
import Link from "next/link";
import { useRouter } from "next/router";
import SKUForm from "pages/admin/code-mining/create";
import { useState, useEffect } from "react";
import {
  Form,
  Button,
  Row,
  Col,
  Alert,
  Container,
  Card,
  Spinner, // Import Spinner for loading state
} from "react-bootstrap";
import SkuForm from "../SkuForm";
import { MdOutlineKeyboardBackspace } from "react-icons/md";

const EditSKU = () => {
  const router = useRouter();
  const { id } = router.query;


  return (
    <Container fluid className="" style={{ width: "95%"}}>
      <Row className="align-items-center my-4">
        <Col>
          <h3>Edit SKU</h3>
        </Col>
        <Col className="text-end">
        <Link href="/admin/sku-master" passHref>
            <Button variant="primary" className="" style={{background:"#a22191",border:"none",color:"white"}}> <MdOutlineKeyboardBackspace className="me-2 fs-4" />Back</Button>
          </Link>
        </Col>
      </Row>
      <Card className="shadow-sm">
        <Card.Body>
          <SkuForm skuId={id}/>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EditSKU;
