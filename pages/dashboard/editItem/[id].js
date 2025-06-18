
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios"; // To handle HTTP requests
import Support from "pages/support";
import Cookies from "js-cookie"; // To manage cookies
import GoBack from "../backButton";
import Link from "next/link";
import { Button } from "react-bootstrap";
import { IoMdQrScanner } from "react-icons/io";
import Image from "next/image";
import useTranslate from "utils/useTranslate";
import { FaPencilAlt } from "react-icons/fa";

const EditItem = () => {
  const router = useRouter();
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState(""); // Dropdown value
  const [categoryMsg, setCategoryMsg] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [image, setImage] = useState(null); // Store image file
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [categorys, setCategories] = useState([]);

  const [errors, setErrors] = useState({
    itemName: false,
    category: false,
    description: false,
    latitude: false,
    longitude: false,
    image: false,
  });
  const translatedText = useTranslate({
    editItem: "Edit Item",
    itemName: "Item Name",
    category: "Category",
    message: "Message",
    description: "Description",
    latitude: "Latitude",
    longitude: "Longitude",
    updateItem: "Update Item",
    submitting: "Submitting...",
    pleaseEnter: "Please enter",
    selectCategory: "Select a category",
    itemImage: "Item Image",
    customMessage: "Enter Custom message",
    itemdescription: "Enter Item Description"
  });


  const { id } = router.query

  const getCategories = async () => {
    try {
      let response = await fetch("/api/updateItem");
      let data = await response.json();
      if (response.ok) {
        setCategories(data.categories);
      }
    } catch (error) {

    }
  }
  useEffect(() => {
    getCategories()
  }, [])
  const categories = [
    "Electronics",
    "Fashion",
    "Home & Kitchen",
    "Beauty & Health",
    "Grocery",
    "Books & Stationery",
    "Sports & Outdoors",
    "Toys & Baby Products",
    "Automotive",
    "Others",
  ];




  useEffect(() => {
    if (id) {
      fetchItems();
    }
  }, [id]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/getItems?item_id=${id}`);
      const data = await response.json();



      const item = data[0];


      setItemName(item.item_name || "");
      setCategory(item.category_id?.toString() || "");
      setCategoryMsg(item.message || "");
      setDescription(item.description || "");
      setLatitude(item.latitude || "");
      setLongitude(item.longitude || "");

      // Agar API se image ka URL aa raha hai to set karo
      if (item.image_url) {
        setImage(item.image_url);
      }

    } catch (error) {
      // Log the error with a custom message, stack trace, and function name
      console.log("error fetching items", error);

    }
    finally {
      setLoading(false);
    }
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    setErrors((prevErrors) => ({ ...prevErrors, image: false })); // Reset error
  };

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



    setLoading(true);
    const formData = new FormData();
    formData.append("itemId", id);
    formData.append("itemName", itemName);
    formData.append("category", category);
    formData.append("categoryMsg", categoryMsg);
    formData.append("description", description);
    formData.append("latitude", latitude);
    formData.append("longitude", longitude);
    formData.append("image", image); // Append image file to FormData

    try {


      const response = await axios.put("/api/updateItem", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Specify the content type
        },
      });

      if (response.status === 200) {

        setMessage(response.data.message);
        router.push("/dashboard/items"); // Redirect after successful submission
      }
    } catch (error) {
      // Log the error with a custom message, error message, and stack trace
      console.log("error uploading items", error);

      setMessage("Error adding the item. Please try again.");
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="d-flex align-items-center bg-white p-3">
        <GoBack />
        <div className="w-100">
          <h4 className="mb-0" style={{ marginLeft: "5%" }}>
            {translatedText.editItem}
          </h4>
        </div>
      </div>
      <div className="container py-5 form-container" style={{ minHeight: "800px" }}>


        <form onSubmit={handleSubmit}>
          {message && <div className="alert alert-info">{message}</div>}

          <div className="mt-3">
            <div className="mb-2">
              <label className="form-label">{translatedText.itemImage}</label>
            </div>

            <div style={{ position: "relative", width: "100px", height: "100px" }}>
              {image ? (
                <img
                  src={
                    typeof image === "string"
                      ? image
                      : image instanceof Blob
                        ? URL.createObjectURL(image)
                        : ""
                  }
                  alt="Item Preview"
                  className="border rounded"
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  className="border rounded bg-light d-flex align-items-center justify-content-center text-muted"
                  style={{
                    width: "100px",
                    height: "100px",
                    fontSize: "0.8rem",
                  }}
                >
                  No Image
                </div>
              )}

              {/* Pencil Icon Button */}
              <div
                onClick={() => document.getElementById("imageInput").click()}
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  backgroundColor: "#fff",
                  width: "26px",
                  height: "26px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                  zIndex: 1,
                }}
              >
                <FaPencilAlt color="orange" size={12} />
              </div>

            </div>

            {/* Hidden File Input */}
            <input
              id="imageInput"
              type="file"
              className="d-none"
              accept="image/*"
              onChange={handleImageChange}
              capture="environment"
            />

            {/* Error Display */}
            {errors.image && (
              <small className="text-danger d-block mt-1">Please upload an image.</small>
            )}
          </div>



          <div className="mb-3 mt-3">
            <label htmlFor="itemName" className="form-label fw-bold">
              {translatedText.itemName}
            </label>
            <input
              type="text"
              className={`form-control ${errors.itemName ? "border border-danger" : ""}`}
              id="itemName"
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value);
                handleInputChange(e, "itemName");
              }}
              placeholder="Enter Your Item Name"
            />
            {errors.itemName && <small className="text-danger">Please enter item name.</small>}
          </div>

          <div className="mb-3">
            <label htmlFor="category" className="form-label fw-bold">
              {translatedText.category}
            </label>
            <select
              className={`form-select ${errors.category ? "border border-danger" : ""}`}
              id="category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                handleInputChange(e, "category");
              }}
            >
              <option value="" disabled>
                {translatedText.selectCategory}
              </option>
              {categorys.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {errors.category && <small className="text-danger">Please select a category.</small>}
          </div>

          {category && (
            <div className="mb-3">
              <label htmlFor="categoryMsg" className="form-label fw-bold">
                {translatedText.message}
              </label>
              <textarea
                type="text"
                className="form-control"
                id="categoryMsg"
                value={categoryMsg}
                onChange={(e) => setCategoryMsg(e.target.value)}
                placeholder={translatedText.customMessage}
              ></textarea>
            </div>
          )}

          <div className="mb-3">
            <label htmlFor="description" className="form-label fw-bold">
              {translatedText.description}
            </label>
            <textarea
              className={`form-control ${errors.description ? "border border-danger" : ""}`}
              id="description"
              rows="2"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                handleInputChange(e, "description");
              }}
              placeholder="Enter Item Description "
            ></textarea>
            {errors.description && <small className="text-danger">Please enter a description.</small>}
          </div>

          <div className="row g-3 d-none" >
            <div className="col-md-6 col-6">
              <label htmlFor="latitude" className="form-label fw-bold">
                {translatedText.latitude}
              </label>
              <input
                type="text"
                className={`form-control ${errors.latitude ? "border border-danger" : ""}`}
                id="latitude"
                value={latitude}
                readOnly
                placeholder={translatedText.latitude}
              />
              {errors.latitude && <small className="text-danger">Latitude is required.</small>}
            </div>
            <div className="col-md-6 col-6">
              <label htmlFor="longitude" className="form-label fw-bold">
                {translatedText.longitude}
              </label>
              <input
                type="text"
                className={`form-control ${errors.longitude ? "border border-danger" : ""}`}
                id="longitude"
                value={longitude}
                readOnly
                placeholder={translatedText.longitude}
              />
              {errors.longitude && <small className="text-danger">Longitude is required.</small>}
            </div>
          </div>

          <button
            type="submit"
            className=" w-100 mt-5 btn"
            style={{ backgroundColor: "#FCB454", color: "#fff" }}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Update Item"}
          </button>
        </form>
      </div>

      <div className="fixed-footer">
        <Support />
      </div>
    </>
  );
};

export default EditItem;
