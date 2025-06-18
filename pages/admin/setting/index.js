import { useState, useEffect } from "react";
import { Form, Button, Row, Col, Card, Spinner } from "react-bootstrap";
import { Editor } from "@tinymce/tinymce-react";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import RichTextEditor from "pages/components/Editor";

export default function Setting() {
  const [pageLimit, setPageLimit] = useState(10);
  const [consent, setConsent] = useState("");
  const [initialState, setInitialState] = useState({
    pageLimit: 10,
    consent: "",
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/setting")
      .then((res) => res.json())
      .then((data) => {
        setPageLimit(data.records_per_page);
        setConsent(data.fidner_consent);
        setInitialState({
          pageLimit: data.records_per_page,
          consent: data.fidner_consent,
        });
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch("/api/admin/setting", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        records_per_page: pageLimit,
        fidner_consent: consent,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Settings updated successfully!",
          confirmButtonColor: "#3085d6",
        });
        setInitialState({ pageLimit, consent });
      })
      .catch((err) => console.error("❌ Error updating:", err));
  };

  const handleCancel = () => {
    setPageLimit(initialState.pageLimit);
    setConsent(initialState.consent);
    router.push("/admin");
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" /> Loading settings...
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4" style={{ width: "95%"}} >
      <div className="header mb-4">
        <h1 className="h3">Settings</h1>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="pageLimit">
                  <Form.Label>Default Page Limit</Form.Label>
                  <Form.Control
                    type="number"
                    min={1}
                    value={pageLimit}
                    onChange={(e) => setPageLimit(e.target.value)}
                    placeholder="Enter default page limit"
                  />
                </Form.Group>
              </Col>  
            </Row>

            <Row className="mb-4">
              <Col>
                <Form.Group controlId="consentEditor">
                  <Form.Label>Consent Message</Form.Label>
                  {/* <Editor
                    apiKey="ie7yp6nve5r1iv3viajs7i1uz5pfq1mf6mr2g6szz158f0go"
                    value={consent}
                    onEditorChange={(content) => setConsent(content)}
                    init={{
                      height: 250,
                      menubar: false,
                      convert_urls: false,
                      relative_urls: false,
                      remove_script_host: false,
                      plugins: "image code link lists",
                      toolbar:
                        "blocks | bold italic underline | alignleft aligncenter alignright alignjustify | " +
                        "bullist numlist | forecolor image | code",
                      content_style:
                        "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                    }}
                  /> */}

                   <RichTextEditor
        value={consent}
        onEditorChange={setConsent}
        height={250}
      />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex gap-3">
              <Button style={{ backgroundColor: '#a22191' , color: '#fff' , border: 'none' }} type="submit">
                Update
              </Button>
              <Button variant="secondary" type="button" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
