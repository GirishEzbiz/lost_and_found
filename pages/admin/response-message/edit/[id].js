import { useEffect, useState } from "react";
import { Container, Row, Col, Button, Form, Card, Spinner } from "react-bootstrap";
import Select from "react-select";
import { useRouter } from "next/router";
import { Editor } from "@tinymce/tinymce-react";
import Swal from "sweetalert2";
import RichTextEditor from "pages/components/Editor";

const EditMessageTemplate = () => {
    let router = useRouter();
    const { id } = router.query;
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

    const [skus, setSkus] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [back, setBack] = useState(false);// To handle loading state

    useEffect(() => {
        const loadAll = async () => {
            const { skuList, brandList } = await fetchData(); // ✅ wait for data

            if (id) {
                await fetchMessageTemplate(id, skuList, brandList); // ✅ pass the lists
            }

            setLoading(false); // ✅ only finish loading when everything is ready
        };

        if (id) loadAll();
    }, [id]);


    const fetchData = async () => {
        try {
            let response = await fetch("/api/admin/sku");
            let data = await response.json();
            const skuList = data?.skus || [];

            let response2 = await fetch("/api/admin/brands");
            let data2 = await response2.json();
            const brandList = data2?.brands || [];

            setSkus(skuList);
            setBrands(brandList);

            return { skuList, brandList }; // ✅ return loaded lists
        } catch (error) {
            console.error("Error fetching SKUs and Brands", error);
            return { skuList: [], brandList: [] };
        }
    };

    const handleBack = () => {
        setBack(true)
        router.push("/admin/response-message");
        setBack(false)
    }
    // const fetchMessageTemplate = async (idss) => {
    //     try {
    //         let response = await fetch(`/api/admin/response_message/${idss}`);
    //         let data = await response.json();
    //         console.log(data);
    //         if (data.success && data.data && data.data[0]) {
    //             const { sku_id, brand_id, message } = data.data[0];

    //             // Ensure the message fields are parsed properly
    //             setFormData({
    //                 sku: { label: sku_id, value: sku_id },
    //                 brand: { label: brand_id, value: brand_id },
    //                 success: message.success || "",
    //                 invalid: message.invalid || "",
    //                 notActive: message.notActive || "",
    //                 expired: message.expired || "",
    //                 fake: message.fake || "",
    //                 blacklisted: message.blacklisted || "",
    //             });
    //         }
    //     } catch (error) {
    //         console.error("Error fetching message template", error);
    //     } finally {
    //         setLoading(false); // Finished loading
    //     }
    // };
    const fetchMessageTemplate = async (idss, skuList, brandList) => {
        try {
            let response = await fetch(`/api/admin/response_message/${idss}`);
            let data = await response.json();

            if (data.success && data.data && data.data[0]) {
                const { sku_id, brand_id, message } = data.data[0];
                const parsedMessage = JSON.parse(message || '{}');

                const matchedSku = skuList.find(s => s.id === sku_id);
                const matchedBrand = brandList.find(b => b.id === brand_id);

                setFormData({
                    sku: matchedSku ? { label: matchedSku.name, value: matchedSku.id } : null,
                    brand: matchedBrand ? { label: matchedBrand.name, value: matchedBrand.id } : null,
                    success: parsedMessage.success || "",
                    invalid: parsedMessage.invalid || "",
                    notActive: parsedMessage.notActive || "",
                    expired: parsedMessage.expired || "",
                    fake: parsedMessage.fake || "",
                    blacklisted: parsedMessage.blacklisted || "",
                });
            }
        } catch (error) {
            console.error("Error fetching message template", error);
        }
    };



    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            setLoading(true);

            let response = await fetch(`/api/admin/response_message/${id}`, {
                method: "PATCH", // Use PATCH method for update
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            let data = await response.json();

            if (data.success) {
                Swal.fire({
                    title: 'Success',
                    text: 'Message template updated successfully!',
                    icon: 'success',
                    confirmButtonText: 'OK',
                }).then(() => {
                    router.push("/admin/response-message");
                });
            } else {
                Swal.fire({
                    title: 'Error',
                    text: 'Failed to update message template.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
            }
        } catch (error) {
            console.error("Error updating message template", error);
        } finally {
            setLoading(false);
        }
    };

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

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <Container fluid className="mt-4" style={{ width: "95%" }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0">Edit Response Message</h4>

                <Button
                    variant="danger"
                    onClick={handleBack}
                    disabled={back}
                    className=" px-3"  // 🔧 Reduced vertical & horizontal padding
                    style={{ fontSize: "0.875rem" }} // optional: make font slightly smaller
                >
                    {back ? <Spinner size="sm" /> : "Back"}
                </Button>
            </div>


            <Card className="p-4">
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
                            <Button
                                variant="success"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? "Updating..." : "Update Template"}
                            </Button>
                        </div>

                    </>
                )}
            </Card>
        </Container>
    );
};

export default EditMessageTemplate;
