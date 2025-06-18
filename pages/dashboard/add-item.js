import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios"; // To handle HTTP requests
import Support from "pages/support";
import Cookies from "js-cookie"; // To manage cookies
import GoBack, { BackButton } from "./backButton";
import Link from "next/link";
import { Button } from "react-bootstrap";
import { IoMdQrScanner } from "react-icons/io";
import useTranslate from "utils/useTranslate";
import { FiUpload } from "react-icons/fi";
import { FiEdit } from "react-icons/fi";
import Swal from "sweetalert2";


const AddItem = () => {
  const router = useRouter();
  const [itemName, setItemName] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");

  const [category, setCategory] = useState(""); // Dropdown value
  const [categoryMsg, setCategoryMsg] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [image, setImage] = useState(null); // Store image file
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState({}); // ✅ Store alert messages
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({
    itemName: false,
    category: false,
    description: false,
    latitude: false,
    longitude: false,
    image: false,
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setSelectedFileName(file.name); // 👈 Store file name (optional)

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result); // 👈 Show image preview
      };
      reader.readAsDataURL(file);
    }
  };


  const texts = useTranslate({
    addItem: "Connect item",
    submitting: "Submitting...",
    scan: "Scan",
    category: "Category",
    categoryerror: "Please select a category.",
    itemerror: "Please enter item name.",
    descriptionerror: "Please enter item description.",
    latitude: "Latitude",
    longitude: "Longitude",
    latitudeerror: "Latitude is required.",
    longitudeerror: "Longitude is required.",
    itemImage: "Item Image",
    uploadImageError: "Please upload an image.",
    itemName: "Item Name",
    message: "Message",
    customMessaage: "Enter Custom message",
    enterItemName: "Enter item name",
    selectCategory: "Select Category",
    itemDescription: "Item Description",
    enterDescription: "Enter item description",
    locationNotSupported: "Geolocation is not supported by this browser.",
    retrievingLocationError: "Unable to retrieve your location.",
    pleaseScanQR: "Please Scan QR.",
    allFieldsRequired: "Please fill in all fields and upload an image.",
    errorAddingItem: "Error adding the item. Please try again.",
  });


  useEffect(() => {
    const fetchMessages = async () => {
      const brandId = Cookies.get("scanned_brand_id"); // ✅ Get stored brand_id from cookies

      if (!brandId) return;

      try {
        const response = await fetch(`/api/brand/alerts?brand_id=${brandId}`);
        const data = await response.json();

        if (data.alerts && Array.isArray(data.alerts)) {
          const messagesObj = {};
          data.alerts.forEach((msg) => {
            messagesObj[msg.message_key] = msg.message;
          });

          setMessages(messagesObj);
        }
      } catch (error) {
        console.error("❌ Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, []);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/admin/itemcategory"); // Fetch categories
        const data = await response.json();


        if (data.categories && Array.isArray(data.categories)) {
          const formattedCategories = data.categories.map((category) => ({
            id: category.id, // ✅ Category ID
            category: category.category, // ✅ Category Name
            message: category.message, // ✅ Optional: Message
          }));

          setCategories(formattedCategories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);


  const getMessage = (key) => messages[key] || ""; // ✅ Get message dynamically

  // Handle image file selection


  // Function to fetch the current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (error) => {
          console.warn("Location access denied or unavailable.");
          setMessage("");
          setLongitude("");
        }
      );
    } else {
      console.warn("Geolocation is not supported.");
      setLatitude("");
      setLongitude("");
    }
  };

  // Call getCurrentLocation on component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);
  useEffect(() => {
    setQrCode(Cookies.get("current_qr"));
  }, []);

  // Real-time Validation: Reset error on input
  const handleInputChange = (e, field) => {
    const value = e.target.value;
    if (value) {
      setErrors((prevErrors) => ({ ...prevErrors, [field]: false }));
    }
  };

  // Real-time Validation
  const validateFields = () => {
    const newErrors = {
      itemName: !itemName,
      category: !category,
      description: !description,
      image: !image,
    };

    setErrors(newErrors);
    return Object.values(newErrors).includes(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Run validation
    if (validateFields()) {
      setMessage("Please fill in all fields and upload an image.");
      return;
    }

    if (!qrCode) {
      setMessage("Please Scan QR.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("itemName", itemName);
    formData.append("category_id", category.id); // ✅ Send category_id
    formData.append("categoryMsg", categoryMsg);
    formData.append("description", description);
    formData.append("latitude", latitude);
    formData.append("longitude", longitude);
    formData.append("image", image); // Append image file to FormData
    formData.append("qrCode", qrCode); // Append QR code to FormData

    try {
      const response = await axios.post("/api/addItem", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Specify the content type
        },
      });

      if (response.status === 201) {
        Cookies.remove("current_qr");

        setMessage(response.data.message);
        router.push("/dashboard/items");
        if (getMessage("AFTER_LINKING_QR")) {
          Swal.fire({
            icon: "success",
            title: "QR Linked Successfully",
            text: `✅ ${getMessage("AFTER_LINKING_QR")}`,
            confirmButtonColor: "#3085d6",
          });
        }
      } // Redirect after successful submission
    } catch (error) {
      setMessage("Error adding the item. Please try again.");
      console.error("Error uploading item:", error);


      // ✅ Show failure alert if linking fails
      if (getMessage("IF_LINKING_FAILS")) {
        Swal.fire({
          icon: "error",
          title: "Linking Failed",
          text: `❌ ${getMessage("IF_LINKING_FAILS")}`,
          confirmButtonColor: "#d33",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    // Navigate directly to the dashboard page
    router.push("/dashboard/items"); // Adjust the URL if necessary
  };

  return (
    <>
      <div className="d-flex align-items-center bg-white p-3">
        {/* <GoBack /> */}
        <BackButton onClick={handleBack} />
        <div className="w-100">
          <h4 className="mb-0" style={{ marginLeft: "5%" }}>
            {texts.addItem}
          </h4>
        </div>
      </div>
      <div
        className="container py-5 form-container"
        style={{ minHeight: "800px" }}
      >
        {!qrCode && (
          <Link
            href="/dashboard/scanner"
            className="d-flex justify-content-end"
          >
            <Button variant="dark" className="mb-3">
              <IoMdQrScanner className="me-2" /> {texts.scan}
            </Button>
          </Link>
        )}

        <form onSubmit={handleSubmit}>
          {message && <div className="alert alert-info">{message}</div>}

          <div className="mt-3 position-relative mx-auto w-100" style={{ maxWidth: "350px" }}>

            <label className="form-label">{texts.itemImage}</label>

            {!previewImage ? (
              <div
                className={`px-3 py-2 d-flex justify-content-center align-items-center flex-column text-center ${errors.image ? "border border-danger" : ""}`}
                style={{
                  border: "2px dotted #A22191",
                  backgroundColor: "transparent",
                  height: "100px",
                  width: "100%",
                  cursor: "pointer",
                  borderRadius: "0.375rem"
                }}
                onClick={() => document.getElementById("imageUploadInput").click()}
              >

                <div className="d-flex align-items-center gap-2">
                  <FiUpload size={18} color="#A22191" />
                  <span className=" fw-medium" style={{ color: '#A22191'}}>Upload Image</span>
                </div>
              </div>
            ) : (
              <div className="position-relative">
                <img
                  src={previewImage}
                  alt="Uploaded Preview"
                  className="img-thumbnail mx-auto d-block"
                  style={{
                    width: "150px",
                    height: "150px",
                    objectFit: "cover",
                    borderRadius: "0.375rem",
                  }}
                />

                <button
                  type="button"
                  className="  position-absolute"
                  style={{
                    top: "5px",
                    right: "5px",
                    background: "transparent",
                    border: "none",
                    color: "#A22191",
                  }}
                  onClick={() => document.getElementById("imageUploadInput").click()}
                >
                  <FiEdit size={16} />
                </button>
              </div>
            )}

            <input
              id="imageUploadInput"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              capture="environment"
              style={{ display: "none" }}
            />

            {errors.image && (
              <small className="text-danger mt-1 d-block">{texts.uploadImageError}</small>
            )}
          </div>



          <div className="mb-3 mt-3">
            <label htmlFor="itemName" className="form-label fw-bold">
              {texts.itemName}
            </label>
            <input
              type="text"
              className={`form-control ${errors.itemName ? "border border-danger" : ""
                }`}
              id="itemName"
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value);
                handleInputChange(e, "itemName");
              }}
              placeholder={texts.enterItemName}
            />
            {errors.itemName && (
              <small className="text-danger">Please enter item name.</small>
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="category" className="form-label fw-bold">
              {texts.category}
            </label>
            <select
              className={`form-select ${errors.category ? "border border-danger" : ""}`}
              id="category"
              value={category ? category.id : ""} // ✅ Ensure correct value binding (category_id)
              onChange={(e) => {
                const selectedCategory = categories.find(
                  (cat) => cat.id === Number(e.target.value) // ✅ Find selected category object
                );


                setCategory(selectedCategory); // ✅ Store selected category object
                handleInputChange(e, "category");
              }}
            >
              <option value="" disabled>
                {texts.selectCategory}
              </option>
              {/* {categories.map((cat) => (
                <option key={cat.id} value={cat.id}> 
                  {cat.category} 
                </option>
              ))} */}

              {categories
                .slice() // original array mutate na ho isliye copy le rahe
                .sort((a, b) => {
                  if (a.category === 'Others') return 1;
                  if (b.category === 'Others') return -1;
                  return 0;
                })
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.category}
                  </option>
                ))}

            </select>

            {errors.category && (
              <small className="text-danger">{texts.categoryerror}</small>
            )}
          </div>





          {category && (
            <div className="mb-3">
              <label htmlFor="categoryMsg" className="form-label fw-bold">
                {texts.message}
              </label>
              <input
                type="text"
                className="form-control"
                id="categoryMsg"
                value={categoryMsg}
                onChange={(e) => setCategoryMsg(e.target.value)}
                placeholder={texts.customMessaage}
              />
            </div>
          )}

          <div className="mb-3">
            <label htmlFor="description" className="form-label fw-bold">
              {texts.itemDescription}
            </label>
            <textarea
              className={`form-control ${errors.description ? "border border-danger" : ""
                }`}
              id="description"
              rows="2"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                handleInputChange(e, "description");
              }}
              placeholder={texts.enterDescription}
            ></textarea>
            {errors.description && (
              <small className="text-danger">{texts.descriptionerror}</small>
            )}
          </div>

          <div className="row g-3 d-none">
            <div className="col-md-6 col-6">
              <label htmlFor="latitude" className="form-label fw-bold">
                {texts.latitude}
              </label>
              <input
                type="text"
                className={`form-control ${errors.latitude ? "border border-danger" : ""
                  }`}
                id="latitude"
                value={latitude}
                readOnly
                placeholder={texts.latitude}
              />
              {errors.latitude && (
                <small className="text-danger">{texts.latitudeerror}</small>
              )}
            </div>

            <div className="col-md-6 col-6">
              <label htmlFor="longitude" className="form-label fw-bold">
                {texts.longitude}
              </label>

              <input
                type="text"
                className={`form-control ${errors.longitude ? "border border-danger" : ""
                  }`}
                id="longitude"
                value={longitude}
                readOnly
                placeholder={texts.longitude}
              />

              {errors.longitude && (
                <small className="text-danger">{texts.longitudeerror}</small>
              )}
            </div>

          </div>

          <button
            type="submit"
            className=" w-100 mt-5 btn"
            style={{ backgroundColor: "#A22191", color: "#fff" }}
            disabled={loading}
          >
            {loading ? texts.submitting : texts.addItem}

          </button>
        </form>
      </div>

      <div className="fixed-footer">
        <Support />
      </div>
    </>
  );
};

export default AddItem;
