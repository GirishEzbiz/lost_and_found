import { useEffect, useState } from "react";
import { Container, Row, Col, Button, Form, Card } from "react-bootstrap";
import Select from "react-select";
import { Editor } from "@tinymce/tinymce-react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import RichTextEditor from "pages/components/Editor";





const CreateMessageTemplate = () => {
    const [formData, setFormData] = useState({
        sku: null,
        brand: null,
        success: "",
        invalid: "",
        notActive: "",
        expired: "",
        fake: "",
        blacklisted: "",
    });

    const [skus, setskus] = useState([])
    const [brands, setBrands] = useState([])
    const router = useRouter()

    useEffect(() => {
        fetchData()
    }, [])
    const fetchData = async () => {
        try {

            let response = await fetch("/api/admin/sku")
            let data = await response.json()
            setskus(data?.skus)
            let response2 = await fetch("/api/admin/brands")
            let data2 = await response2.json()
            setBrands(data2?.brands)
        } catch (error) {

        }
    }

    const handleSubmit = async (e) => {
        try {
            e.preventDefault()

            let data = await fetch('/api/admin/response_message', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData)
            })
            if (data.status == 201) {
                // Show a success message using SweetAlert
                Swal.fire({
                    title: 'Success!',
                    text: 'Response message template created successfully.',
                    icon: 'success',
                    confirmButtonText: 'OK',
                }).then(() => {
                    setTimeout(() => {
                        router.push("/admin/response-message");
                    }, 1000);
                });
            } else {
                // Handle error if response is not successful
                Swal.fire({
                    title: 'Error!',
                    text: 'Something went wrong. Please try again.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
            }

        } catch (error) {
            console.log(error.message)
        }
    }



    const SkusData = [
        ...skus.map(item => ({
            label: item.name,
            value: item.id
        })),
    ];
    const BrandsData = [
        ...brands.map(item => ({
            label: item.name,
            value: item.id
        })),
    ];
    const handleEditorChange = (field, content) => {
        setFormData((prev) => ({ ...prev, [field]: content }));
    };


    return (

        <Container fluid className="mt-4" style={{ width: "95%" }}>
             <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-4">Create Response Message</h4>
                            
            
                            <Button
                                variant="danger"
                                onClick={()=>router.push("/admin/response-message")}
                                
                                className=" px-3"  // 🔧 Reduced vertical & horizontal padding
                                style={{ fontSize: "0.875rem" }} // optional: make font slightly smaller
                            >
                               Back
                            </Button>
                        </div>
            <Card className="p-4">

                {/* Show Brand Dropdown First */}
                <Row className="mb-3">
                    <Col md={4}>
                        <Form.Label>Brand</Form.Label>
                        <Select
                            id="brands"
                            options={BrandsData}
                            value={formData.brand}
                            onChange={(selected) =>
                                setFormData((prev) => ({ ...prev, brand: selected, sku: null }))
                            }
                            styles={{
                                menu: (provided) => ({ ...provided, zIndex: 9999 })
                            }}
                            placeholder="Select Brand"
                        />
                    </Col>
                    {formData.brand && (

                        <Col md={4}>
                            <Form.Label>SKU Name</Form.Label>
                            <Select
                                id="skus"
                                options={SkusData}
                                value={formData.sku}
                                onChange={(selected) =>
                                    setFormData((prev) => ({ ...prev, sku: selected }))
                                }
                                styles={{
                                    menu: (provided) => ({ ...provided, zIndex: 9999 })
                                }}
                                placeholder="Select SKU"
                            />
                        </Col>

                    )}
                </Row>



                {formData.brand && formData.sku && (
                    <>
                        <div className="row">
                            {[
                                { label: "Success Message", key: "success" },
                                { label: "Invalid Message", key: "invalid" },
                                { label: "Not Active-Disabled Message", key: "notActive" },
                                { label: "Expired Code Message", key: "expired" },
                                { label: "Fake Code Message", key: "fake" },
                                { label: "BlackListed Message", key: "blacklisted" },
                            ].map((field) => (
                                <div key={field.key} className="col-md-6 mb-4">
                                    <Form.Label>{field.label}</Form.Label>
                                    {/* <Editor
                                        apiKey="ie7yp6nve5r1iv3viajs7i1uz5pfq1mf6mr2g6szz158f0go"
                                        value={formData[field.key]}
                                        init={{
                                            height: 200,
                                            menubar: false,
                                            plugins: ["link", "lists", "autolink", "preview", "code"],
                                            toolbar:
                                                "undo redo | formatselect | bold italic underline | alignleft aligncenter alignright | bullist numlist | preview | code",
                                        }}
                                        onEditorChange={(content) =>
                                            handleEditorChange(field.key, content)
                                        }
                                    /> */}

                                       <RichTextEditor
                                                                            value={formData[field.key]}
                                                                            onEditorChange={(content) => handleEditorChange(field.key, content)}
                                                                            height={200}
                                                                        />
                                </div>
                            ))}
                        </div>

                        <div className="text-end">
                            <Button variant="success" onClick={handleSubmit}  >
                                Create Template
                            </Button>
                        </div>
                    </>
                )}
            </Card>
        </Container>
    );


};

export default CreateMessageTemplate;
