// import { useState, useEffect } from "react";
// import { Button, Form, Spinner } from "react-bootstrap";
// import { FaTrash } from "react-icons/fa";
// import CreatableSelect from "react-select/creatable"; // Import CreatableSelect

// const ItemCategoriesForm = ({ onSave,setDrawerOpen }) => {
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const [messages, setMessages] = useState([""]);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [categories, setCategories] = useState([]); // Store categories

//   // **Fetch existing categories from the database**
//   useEffect(() => {
//     const fetchCategories = async () => {
//       try { 
//         const response = await fetch("/api/admin/itemcategory"); // Fetch categories
//         const data = await response.json();

//         console.log("Fetched Categories (Before Removing Duplicates):", data.categories); // Debugging

//         if (data.categories && Array.isArray(data.categories)) {
//           // Remove duplicates using a Map
//           const uniqueCategories = Array.from(
//             new Map(data.categories.map(cat => [cat.category, cat])).values()
//           );
//           console.log("uniqueCategories",uniqueCategories);


//           const formattedCategories = uniqueCategories.map((category) => ({
//             value: category.id, // Use category name as value
//             label: category.category, // Display category name
//           }));

//           console.log("Formatted Categories for Dropdown (No Duplicates):", formattedCategories); // Debugging
//           setCategories(formattedCategories);
//         }
//       } catch (error) {
//         console.error("Error fetching categories:", error);
//       }
//     };

//     fetchCategories();
//   }, []);

//   // Handle category selection
//   const handleCategoryChange = (selectedOption) => {
//     console.log("Selected:", selectedOption);
//     setSelectedCategory(selectedOption);
//   };

//   // **Handle new category creation & save immediately**
// const handleCreateCategory = async (inputValue) => {
//   try {
//     const response = await fetch("/api/admin/itemcategory", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ name: inputValue }),
//     });

//     const data = await response.json();
//     if (response.ok) {
//       const newCategory = { value: data.categoryId, label: inputValue }; // Save category ID
//       setCategories((prev) => [...prev, newCategory]); // Add to dropdown
//       setSelectedCategory(newCategory); // Select the newly created category
//     } else {
//       alert("Error creating category: " + data.error);
//     }
//   } catch (error) {
//     console.error("Error creating category:", error);
//   }
// };


//   // Handle message input change
//   const handleMessageChange = (index, value) => {
//     const updatedMessages = [...messages];
//     updatedMessages[index] = value;
//     setMessages(updatedMessages);
//   };

//   // Handle removing a message input
//   const handleRemoveMessage = (index) => {
//     const updatedMessages = messages.filter((_, i) => i !== index);
//     setMessages(updatedMessages);
//   };

//   // **Save messages when clicking "Save Messages" button**
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!selectedCategory) {
//       alert("Please select or create a category.");
//       return;
//     }

//     setIsSubmitting(true);

//     console.log(selectedCategory);


//     const payload = {
//       categoryId: selectedCategory.value,
//       messages: messages.filter((msg) => msg.trim() !== ""), // Remove empty messages
//     };

//     try {
//       const response = await fetch("/api/admin/itemcategory", {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(payload),
//       });

//       const data = await response.json();
//       if (response.ok) {
//         setDrawerOpen(false);
//         setMessages([""]); // Reset messages
//         setSelectedCategory(null); // Reset category

//         onSave(); // Refresh parent component
//       } else {
//         alert("Error: " + data.error);
//       }
//     } catch (error) {
//       console.error("Error saving messages:", error);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <Form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow-sm">
//       {/* Category Selection with Create Option */}
//       <Form.Group className="mb-3">
//         <Form.Label>Select or Create Category</Form.Label>
//         <CreatableSelect
//           value={selectedCategory}
//           onChange={handleCategoryChange}
//           onCreateOption={handleCreateCategory}
//           options={categories} // Showing existing categories
//           isClearable
//           placeholder="Choose or create a category"
//           createOptionPosition="first"
//         />
//       </Form.Group>

//       {/* Messages Input */}
//       <Form.Group className="mb-3">
//         <Form.Label>Messages</Form.Label>
//         {messages.map((message, index) => (
//           <div key={index} className="d-flex align-items-center mb-2">
//             <Form.Control
//               as="textarea"
//               rows={2}
//               placeholder={`Message ${index + 1}`}
//               value={message}
//               onChange={(e) => handleMessageChange(index, e.target.value)}
//               className="me-2"
//             />
//             {messages.length > 1 && (
//               <Button
//                 variant="danger"
//                 onClick={() => handleRemoveMessage(index)}
//                 className="btn-sm"
//               >
//                 <FaTrash size={14} />
//               </Button>
//             )}
//           </div>
//         ))}
//       </Form.Group>

//       {/* Save Button */}
//       <Button variant="primary" type="submit" disabled={isSubmitting} className="btn-sm">
//         {isSubmitting ? <Spinner animation="border" size="sm" /> : "Save Messages"}
//       </Button>
//     </Form>
//   );
// };

// export default ItemCategoriesForm;




import { useState, useEffect } from "react";
import { Button, Form, InputGroup, Spinner } from "react-bootstrap";
import CreatableSelect from "react-select/creatable";
import Swal from "sweetalert2";

const ItemCategoriesForm = ({ onSave, setDrawerOpen, selectedCategory: preSelectedCategory, setToastMessage, setToastVariant, setShowToast }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [messages, setMessages] = useState([{ message: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [scanLimit, setScanLimit] = useState("");
  const [scanDuration, setScanDuration] = useState('');
  const isEditMode = !!preSelectedCategory;

  useEffect(() => {
    const el = document.querySelector(".scroll-message-area");
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/admin/itemcategory");
        const data = await response.json();

        if (data.categories && Array.isArray(data.categories)) {
          const uniqueCategories = Array.from(
            new Map(data.categories.map(cat => [cat.category, cat])).values()
          );

          const formattedCategories = uniqueCategories.map((category) => ({
            value: category.id,
            label: category.category,
          }));

          setCategories(formattedCategories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    if (!isEditMode) {
      fetchCategories();
    }
  }, [isEditMode]);

  useEffect(() => {
    if (preSelectedCategory) {
      setSelectedCategory({
        value: preSelectedCategory.id,
        label: preSelectedCategory.category,
      });

      if (preSelectedCategory.messages && preSelectedCategory.messages.length > 0) {
        const formattedMessages = preSelectedCategory.messages.map((m) => ({
          message: m.message,
          massageId: m.massageId,
        }));
        setMessages(formattedMessages);
      }
      if (preSelectedCategory.scan_limit) {
        setScanLimit(preSelectedCategory.scan_limit.toString());
      }if (preSelectedCategory.scan_duration) {
        setScanDuration(preSelectedCategory.scan_duration.toString());
      }
    }
  }, [preSelectedCategory]);

  const handleCreateCategory = async (inputValue) => {
    try {
      const response = await fetch("/api/admin/itemcategory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: inputValue }),
      });

      const data = await response.json();
      if (response.ok) {
        const newCategory = { value: data.categoryId, label: inputValue };
        setCategories((prev) => [...prev, newCategory]);
        setSelectedCategory(newCategory);
      } else {
        Swal.fire({
          icon: "error",
          title: "Category Creation Failed",
          text: "Error creating category: " + data.error,
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  const handleMessageChange = (index, value) => {
    const updatedMessages = [...messages];
    updatedMessages[index].message = value;
    setMessages(updatedMessages);
  };

  const handleRemoveMessage = (index) => {
    const target = messages[index];

    // If message has massageId, delete from backend
    if (target.massageId) {
      Swal.fire({
        title: "Delete this message?",
        text: "This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          deleteMessage(target.massageId, index);

        }
      });
    } else {
      // Just remove from UI if not saved yet
      const updatedMessages = messages.filter((_, i) => i !== index);
      setMessages(updatedMessages);
    }
  };

  const deleteMessage = async (messageId, indexToRemove) => {
    try {
      const response = await fetch(`/api/admin/itemcategory?id=${messageId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        const updatedMessages = messages.filter((_, i) => i !== indexToRemove);
        setMessages(updatedMessages);
      } else {
        Swal.fire({
          icon: "error",
          title: "Deletion Failed",
          text: "Error deleting message: " + data.error,
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategory) {
      Swal.fire({
        icon: "info",
        title: "Category Required",
        text: "Please select or create a category.",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    setIsSubmitting(true);

    const payload = {
      categoryId: selectedCategory.value,
      scan_limit: isEditMode ? parseInt(scanLimit || "0", 10) : undefined,
      scan_duration: isEditMode ? parseInt(scanDuration || "0", 10) : undefined,
      messages: messages
        .map((m) => m.message.trim())
        .filter((msg) => msg !== ""),
    };

    try {
      const response = await fetch("/api/admin/itemcategory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      // if (response.ok) {
      setDrawerOpen(false);
      setMessages([{ message: "" }]);
      setSelectedCategory(null);
      setToastMessage("Category updated successfully!");
      setToastVariant("success");
      setShowToast(true);
      onSave();


      // } else {
      //   alert("Error: " + data.error);
      // }
    } catch (error) {
      console.error("Error saving messages:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="p-0 bg-white rounded shadow-sm" style={{ height: "100%" }}>
      <div style={{ maxHeight: "65vh", overflowY: "auto", padding: "1rem" }}>
        {/* Category Select */}
        <Form.Group className="mb-3">
          <Form.Label style={{ color: "#444!important"}}>
            {isEditMode
              ? `Selected Category: ${preSelectedCategory?.category}`
              : "Select or Create Category"}
          </Form.Label>
                                    
          <CreatableSelect
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e)}
            onCreateOption={handleCreateCategory}
            options={categories}
            isClearable={!isEditMode}
            isDisabled={isEditMode}
            placeholder="Choose or create a category"
            createOptionPosition="first"
          />
        </Form.Group>
        {isEditMode && (
          <Form.Group className="mb-3">
            <Form.Label>Scan Limit & Duration</Form.Label>
            <InputGroup className="mb-3">
              <Form.Control
                type="number"
                min="0"
                placeholder="Enter scan limit"
                value={scanLimit}
                onChange={(e) => setScanLimit(e.target.value)}
                style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
              />
              <Form.Select
                value={scanDuration}
                onChange={(e) => setScanDuration(e.target.value)}
                style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
              >
                <option value="">Select duration</option>
                <option value="1">Within 1 hours</option>
                <option value="3">Within 3 hours</option>
                <option value="6">Within 6 hours</option>
              </Form.Select>
            </InputGroup>

          </Form.Group>
        )}
        {/* Messages Input */}
        <Form.Group className="mb-3">
          <Form.Label style={{ color: "#444!important"}}>Messages</Form.Label>
          {messages.map((msgObj, index) => (
            <div key={index} className="d-flex align-items-center mb-2">
              <Form.Control
                as="textarea"
                rows={2}
                placeholder={`Message ${index + 1}`}
                value={msgObj.message}
                onChange={(e) => handleMessageChange(index, e.target.value)}
                className="me-2"
              />
              {messages.length > 1 && (
                <div
                  className="btn btn-ghost btn-icon btn-sm rounded-circle"
                  onClick={() => handleRemoveMessage(index)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Trash Icon SVG */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="icon-xs"
                  >
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </div>
              )}
            </div>
          ))}
          <Button
            variant="secondary"
            onClick={() => setMessages([...messages, { message: "" }])}
            className="btn-sm mt-2"
          >
            + Add Another Message
          </Button>
        </Form.Group>
      </div>

      {/* Bottom Save Button */}
      <div className="d-flex justify-content-end p-3 border-top bg-white sticky-bottom">
        <Button   type="submit" disabled={isSubmitting} className="btn-sm" style={{ background: "#a22191", border: "#a22191", color: "#fff" }}>
          {isSubmitting ? <Spinner animation="border" size="sm" /> : "Save Messages"}
        </Button>
      </div>
    </Form>


  );
};

export default ItemCategoriesForm;
