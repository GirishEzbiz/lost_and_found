import Link from "next/link";
import Support from "pages/support";
import React, { useEffect, useState } from "react";
import Loading from "utils/Loading";
import { Button, Card } from "react-bootstrap";
import { IoQrCode } from "react-icons/io5";
import { useRouter } from "next/router";
import GoBack from "../backButton";
import useTranslate from "utils/useTranslate";

const Items = () => {
  const router = useRouter();
  const [items, setItems] = useState([]); // Store fetched items
  const [search, setSearch] = useState(""); // Search filter
  const [loading, setLoading] = useState(true); // Loading state

  const translatedText = useTranslate({
    listItem: "List Item",
    searchItem: "Search item",
    addItem: "+ Add Item",
    noItems: "No items linked yet. Start by scanning your QR code to add items to your account.",
    category: "Category",
    itemLost: "Item Lost",
    itemFound: "Item Found",
    expiresOn: "Expires on:",
    renew: "Renew",
    extend: "Extend",
  });



  useEffect(() => {
    // Fetch items from API
    const fetchItems = async () => {
      try {
        const response = await fetch("/api/getItems"); // API endpoint
        const data = await response.json();

        // Ensure that `data` is an array
        if (Array.isArray(data)) {
          setItems(data);
        } else {
          console.error("Received data is not an array", data);
        }
      } catch (error) {
        console.error("Error fetching items:", error);
      }
      finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []); // Runs once on mount

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const filteredItems = Array.isArray(items)
    ? items.filter(
      (item) =>
        item.item_name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase())
    )
    : [];

  const handleSearchChangeIcon = () => {
    router.push("/dashboard/scanner");
  };

  const handleItemDetails = (item_id) => {
    router.push(`/dashboard/items/${item_id}`);
  };

  // ✅ Check if item expires within 14 days
  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expirationDate = new Date(expiryDate);
    const diffDays = (expirationDate - today) / (1000 * 60 * 60 * 24);
    return diffDays > 0 && diffDays <= 14; // Returns true if expiring within 14 days
  };

  // ✅ Check if item expires within 14 days
  const isExpiringLater = (expiryDate) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expirationDate = new Date(expiryDate);
    const diffDays = (expirationDate - today) / (1000 * 60 * 60 * 24);
    return diffDays > 14; // Returns true if expiring after 14 days
  };


  return (
    <>
      <div className="d-flex align-items-center bg-white p-3">
        <GoBack />
        <div className="w-100">
          <h4 className="mb-0" style={{ marginLeft: "1%" }}>
          {translatedText.listItem || "List Item"}
          </h4>
        </div>
      </div>
      <div
        className="container pt-5"
        style={{ marginBottom: "20%", minHeight: "800px" }}
      >
        <div className="mb-4">
          <div className="position-relative">
            <input
              type="text"
              id="search"
              className="form-control"
              placeholder={translatedText.searchItem || "Search item"}
              value={search}
              onChange={handleSearchChange}
            />
            <IoQrCode
              onClick={handleSearchChangeIcon}
              style={{
                position: "absolute",
                top: "50%",
                right: "10px",
                transform: "translateY(-50%)",
                color: "#6c757d",
                fontSize: "1.5rem",
              }}
            />
          </div>
        </div>

        <Link href="/dashboard/add-item" className="d-flex justify-content-end">
  <Button className="me-1" style={{ backgroundColor: '#A22191', border : 'none' }}>
    {translatedText.addItem}
  </Button>
</Link>


        <div className="my-4">
          {loading ? (
            <Loading />
          ) : (
            <div className="row">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, index) => {
                  let status = "";
                  let bgColor = "";

                  if (item.is_lost === 1) {
                    status = translatedText.itemLost || "Item Lost";
                    bgColor = "bg-danger";  
                  }
                  if (item.is_found === 1) {
                    status = translatedText.itemFound || "Item Found";
                    bgColor = "bg-success";  
                  }


                  return (

                    <div className="col-12 mb-4" key={index}>
                      <Card className="custom-card position-relative shadow-sm border rounded-3 p-0 py-0">
                        {/* Status Badge */}
                        {status && (
                          <span
                            className={`badge position-absolute  start-0 m-2 ${bgColor}`}
                            style={{ fontSize: "0.9rem", padding: "5px 5px", top: "-1px", }}

                          >
                            {status}
                          </span>
                        )}

                        {/* Flexbox Container for Image and Text */}
                        <div className="d-flex align-items-center gap-0">
                          {/* Left Side - Image */}
                          <div className="image-container">
                            <Card.Img
                              onClick={() => handleItemDetails(item.id)}
                              src={item.image_url || "/default-image.jpg"} // Fallback Image
                              alt={item.item_name}
                              className="fixed-image rounded-0"
                              style={{ width: "120px", height: "140px" }}
                            />
                          </div>

                          {/* Right Side - Text Content */}
                          <Card.Body className="p-2">
                            {/* Title & Category on the same line */}
                            <div className="title-category">
                              <Card.Title
                                as="h5"
                                onClick={() => handleItemDetails(item.id)}
                                className="fw-bold text-black cursor-pointer mb-0 mt-3"

                              >
                                {item.item_name}
                              </Card.Title>
                              {/* <span className="category-text">
              <strong >Category:</strong> {item.category00000000000000000000000000000000000000000000000000000000000000000000000000       }
            </span> */}

                              <div className="d-flex align-items-center">
                                <Card.Subtitle className="text-muted   me-1 mb-0 " style={{ marginTop: "8px" }}>
                                {translatedText.category || "Category"}:
                                </Card.Subtitle>
                                <Card.Text className="fw-bold mb-0" style={{ fontSize: "12px" }}>
                                  {item.category_name}
                                </Card.Text>
                              </div>

                            </div>

                            {/* Expiry Warning & CTA Button */}
                            {isExpiringSoon(item.expiry_date) && (
                              <div className="mt-1 alert alert-warning p-2 rounded d-flex align-items-center justify-content-between " >
                                <span className="text-danger fw-bold " style={{ fontSize: "10px", whiteSpace: "nowrap" }}>
                                {translatedText.expiresOn || "Expires on:"}
                                  <br />
                                  {new Date(item.expiry_date).toLocaleDateString()}
                                </span>



                                <Link href={`/dashboard/renew-subscription/${item.id}`} passHref>
                                  <Button variant="danger" className="fw-bold shadow-sm btn btn-sm ms-3 rounded" >
                                  {translatedText.renew || "Renew"}
                                  </Button>
                                </Link>
                              </div>

                            )}

                            {/* Expiry Warning & CTA Button */}
                            {isExpiringLater(item.expiry_date) && (
                              <div className="mt-1 alert  p-2 rounded d-flex align-items-center justify-content-between " style={{ backgroundColor: '#FEF7FF'}} >
                                <span className="text-success fw-bold " style={{ fontSize: "10px", whiteSpace: "nowrap" }}>
                                {translatedText.expiresOn || "Expires on:"}
                                  <br />
                                  {new Date(item.expiry_date).toLocaleDateString()}
                                </span>



                                <Link href={`/dashboard/renew-subscription/${item.id}`} passHref>
                                  <Button variant="success" className="fw-bold shadow-sm btn btn-sm ms-3 rounded" >
                                  {translatedText.extend || "Extend"}
                                  </Button>
                                </Link>
                              </div>

                            )}
                          </Card.Body>
                        </div>
                      </Card>

                    </div>
                  )
                })


              ) : (
                <div className="col mb-4">
                <div className="text-center mt-10 w-100 ">
  {translatedText.noItems}
</div>

                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Support />




    </>
  );
};

export default Items;
