
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Button, Table, Form, Card, Spinner } from "react-bootstrap";
import { Trash, PlusCircle, ArrowLeft, Save } from "react-bootstrap-icons"; // Icons for buttons
import Swal from "sweetalert2";

function AlertsTable() {
  const router = useRouter();
  const [rows, setRows] = useState([]); // Store rows for keys and messages
  const { brand_id } = router.query; // Get brand_id from URL
  const [allKeys, setAllKeys] = useState([]); // Store message keys
  const [isLoading, setIsloading] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      if (!brand_id) return;
  
      try {
        const res = await fetch(`/api/admin/alerts?brand_id=${brand_id}`);
        const data = await res.json();
  
        // ✅ Extract messages
        let rowsData = [];
        if (data.messages) {
          rowsData = data.messages.map((alert) => ({
            message_key: alert.message_key,
            message: alert.message,
          }));
        }
  
        // ✅ Ensure all message keys are included
        if (data.allKeysData) {
          setAllKeys(data.allKeysData);
  
          // Merge message keys into rowsData
          data.allKeysData.forEach((keyData) => {
            if (!rowsData.some((row) => row.message_key === keyData.message_key)) {
              rowsData.push({ message_key: keyData.message_key, message: "" });
            }
          });
        }
  
        setRows(rowsData); // ✅ Update rows with merged data
      } catch (error) {
      console.log("error fetching alertss",error);
      
    }
    
    };
  

    fetchAlerts();
  }, [brand_id]);

  // Add new row (new message key)
  const addRow = () => {
    setRows([...rows, { message_key: "", message: "" }]);
  };

  // Handle changes to the message key or message
  const handleValue = (key, value, field) => {
    setRows((prev) => {
      const existingRow = prev.find((row) => row.message_key === key);
      if (existingRow) {
        return prev.map((row) =>
          row.message_key === key ? { ...row, [field]: value } : row
        );
      } else {
        return [...prev, { message_key: key, message: value }];
      }
    });
  };

  // Handle saving the updated data (insert or update in DB)
  const handleSubmit = async () => {
    if (!brand_id) {
      Swal.fire({
        icon: "warning",
        title: "Missing Brand ID",
        text: "Brand ID is missing!",
        confirmButtonColor: "#d33",
      });
      return;
    }

    const changedAlerts = rows.filter(
      (row) => row.message_key && row.message.trim()
    );

    if (changedAlerts.length === 0) {
      Swal.fire({
        icon: "info",
        title: "No Changes",
        text: "No changes detected!",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    setIsloading(true);

    try {
      const response = await fetch("/api/admin/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand_id, alerts: changedAlerts }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Alerts saved successfully!",
          confirmButtonColor: "#3085d6",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.error || "Failed to save alerts.",
          confirmButtonColor: "#d33",
        });
      }

      setIsloading(false);
    } catch (error) {
      console.log("error sending alertss",error);
      setIsloading(false);
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "An error occurred. Please try again.",
        confirmButtonColor: "#d33",
      });
  }
  
  };

  return (


    // <div className="container-fluid mt-5" style={{ width: "95%!important" }}>
    //   <Card className=" p-4 border-0 rounded-3">
    //     <h2 className="text-center fw-bold mb-4">Alerts Management</h2>

    //     <div className="d-flex justify-content-between">
    //       <div style={{ width: "100%" }}>
    //         <h5>Messages</h5>
    //         <Table bordered hover responsive className="text-center">
    //           <thead className="bg-dark text-light">
    //             <tr>
    //               <th>#</th>
    //               <th>Message Key</th>
    //               <th>Message</th>
    //             </tr>
    //           </thead>
    //           <tbody>
    //             {rows.map((row, index) => (
    //               <tr key={index}>
    //                 <td>{++index}</td>
    //                 <td>
    //                   <Form.Control
    //                     type="text"
    //                     className="border-0 fw-bold bg-light"
    //                     value={row.message_key || ""}
    //                     onChange={(e) =>
    //                       handleValue(
    //                         row.message_key,
    //                         e.target.value,
    //                         "message_key"
    //                       )
    //                     }
    //                     placeholder="Enter message key"
    //                   />
    //                 </td>
    //                 <td>
    //                   <Form.Control
    //                     type="text"
    //                     className="border-0 bg-light"
    //                     value={row.message || ""}
    //                     onChange={(e) =>
    //                       handleValue(
    //                         row.message_key,
    //                         e.target.value,
    //                         "message"
    //                       )
    //                     }
    //                     placeholder="Enter message"
    //                   />
    //                 </td>
    //               </tr>
    //             ))}
    //           </tbody>
    //         </Table>
    //       </div>
    //     </div>

    //     <div className="d-flex justify-content-center gap-3 mt-3">
    //       <Button variant="success" onClick={addRow} className="px-4">
    //         <PlusCircle className="me-1" /> Add Row
    //       </Button>

    //       <Button
    //         variant="primary"
    //         className="px-4"
    //         onClick={handleSubmit}
    //         disabled={isLoading} // Disablesss button when loading
    //       >
    //         {isLoading ? (
    //           <>
    //             <Spinner animation="border" size="sm" className="me-2" />{" "}
    //             Saving...
    //           </>
    //         ) : (
    //           <>
    //             <Save className="me-1" /> Save Changes
    //           </>
    //         )}
    //       </Button>
    //       <Button
    //         variant="secondary"
    //         onClick={() => router.push("/admin/brands")}
    //         className="px-4"
    //       >
    //         <ArrowLeft className="me-1" /> Back
    //       </Button>
    //     </div>
    //   </Card>
    // </div>

      // my table  ui 

      <div className="container-fluid mt-5" style={{ width: "95%" }}>
      <Card className="p-4 border-0 rounded-3 shadow-sm bg-white">
      <div className="d-flex justify-content-between align-items-center mb-4">
  <h3 className="text-start m-0" style={{ color: "#212B36", fontWeight: "500" }}>
    Alerts Management
  </h3>
  <Button
  onClick={() => router.push("/admin/brands")}
  className="px-4 shadow-sm  "
  style={{
    backgroundColor: "#a22191",  // ✅ Use backgroundColor
    border: "none",
    color: "white",
  }}
>
  <ArrowLeft className="me-1" /> Back
</Button>

</div>
    
        <div className="d-flex justify-content-between">
          <div style={{ width: "100%" }}>
            
    
            <Table bordered responsive className="text-center table-modern ">
              <thead className=" text-white table-light rounded-top" >
                <tr>
                  <th>#</th>
                  <th>Message Key</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index} className="bg-light custom-row">
                    <td className="fw-bold">{index + 1}</td>
                    <td>
                      <Form.Control
                        type="text"
                        className="table-input fw-semibold"
                        value={row.message_key || ""}
                        onChange={(e) =>
                          handleValue(row.message_key, e.target.value, "message_key")
                        }
                        placeholder="Enter message key"
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="text"
                        className="table-input-message"
                        value={row.message || ""}
                        onChange={(e) =>
                          handleValue(row.message_key, e.target.value, "message")
                        }
                        placeholder="Enter message"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
    
        <div className="d-flex justify-content-center gap-3 mt-4">
          <Button variant="success" onClick={addRow} className="px-4 shadow-sm">
            <PlusCircle className="me-1" /> Add Row
          </Button>
    
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 shadow-sm  "
            style={{background:"#a22191",border:"none",color:"white"}}
          >
            {isLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="me-1" /> Save Changes
              </>
            )}
            
          </Button>
    
          {/* <Button
            onClick={() => router.push("/admin/brands")}
            className="px-4 shadow-sm btn-back"
          >
            <ArrowLeft className="me-1" /> Back
          </Button> */}
        </div>
    
        <style>{`



.table-modern {
  border-collapse: separate;
  border-spacing: 0;
  border: none;
}

.table-modern th,
.table-modern td {
  border-top: 1px solid #dee2e6 !important;
  border-left: none !important;
  border-right: none !important;
  border-bottom: none !important;
}

.table-modern thead th {
  border-top: none !important;
}

          .table-modern th,
          .table-modern td {
            vertical-align: middle;
          }
    
          .custom-row {
            border-radius: 8px;
            transition: background 0.2s ease;
          }
    
          .custom-row:hover {
            background-color: #f1f2f4 !important;
          }
    
          .table-input {
            background-color: #ffffff;
            border: 1px solid #dee2e6;
            border-radius: 6px;
            padding: 6px 10px;
            font-size: 14px;
            transition: 0.2s ease;
          }
    
          .table-input:focus {
            border-color: #624bff;
            box-shadow: 0 0 0 0.15rem rgba(98, 75, 255, 0.2);
            outline: none;
          }
    
          .table-input-message {
            background-color: #ffffff;
            border: 1px solid #dee2e6;
            border-radius: 10px;
            padding: 10px 12px;
            font-size: 14px;
            font-weight: 500;
            transition: 0.2s ease;
          }
    
          .table-input-message:focus {
            border-color: #624bff;
            box-shadow: 0 0 0 0.15rem rgba(98, 75, 255, 0.2);
            outline: none;
          }
    
          .btn-save {
            background-color:rgb(112, 69, 241) !important;
            color: #fff;
            border: none;
            font-weight: 500;
            border-radius: 6px;
          }
    
          .btn-save:hover {
            background-color: #4e3ad6 !important;
              color: #fff;
          }
    
          .btn-back {
            background-color: #624bff !important;
            color: #fff !important;
            border: none;
            font-weight: 500;
            border-radius: 6px;
          }
    
          .btn-back:hover {
            background-color: #4e3ad6 !important;
          }

          
        `}</style>
      </Card>
    </div>
    
  );
}

export default AlertsTable;
