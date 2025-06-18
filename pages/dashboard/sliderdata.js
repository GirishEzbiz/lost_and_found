// import React, { useEffect, useState } from "react";
// import { Card, Row, Col } from "react-bootstrap";
// import { 
//     AiOutlineQrcode, 
//     AiOutlineExclamationCircle, 
//     AiOutlineCheckCircle, 
//     AiOutlineUndo 
// } from "react-icons/ai";

// const DataCards = () => {
//     const [stats, setStats] = useState([
//         { id: 1, number: "0", label: "Total Items", icon: <AiOutlineQrcode size={22} />, color: "#6c757d" }, 
//         { id: 2, number: "0", label: "Total Lost", icon: <AiOutlineExclamationCircle size={22} />, color: "#6c757d" }, 
//         { id: 3, number: "0", label: "Total Found", icon: <AiOutlineCheckCircle size={22} />, color: "#6c757d" }, 
//         { id: 4, number: "0", label: "Recovery Rate", icon: <AiOutlineUndo size={22} />, color: "#6c757d" }, 
//     ]);

//     const fetchUserItems = async () => {
//         try {
//             const response = await fetch("/api/user-items");
//             const data = await response.json();
            
//             setStats([
//                 { id: 1, number: data.total_qr_assigned || "0", label: "Total Items", icon: <AiOutlineQrcode size={22} />, color: "#6c757d" },
//                 { id: 2, number: data.total_lost_count || "0", label: "Total Lost", icon: <AiOutlineExclamationCircle size={22} />, color: "#6c757d" },
//                 { id: 3, number: data.total_found_count || "0", label: "Total Found", icon: <AiOutlineCheckCircle size={22} />, color: "#6c757d" },
//                 { id: 4, number: `${parseInt(data.recovery_rate)}%`|| "0", label: "Recovery Rate", icon: <AiOutlineUndo size={22} />, color: "#6c757d" },
//             ]);

//         } catch (error) {
//             // Log the error with details like message, stack, and function name
//             console.log("error fetching user items", error);

            
//             // You can also log just the message if you don't need the stack trace
//             console.error("Error fetching data:", error.message);
//         }
        
//     };

//     useEffect(() => {
//         fetchUserItems();
//     }, []);

//     return (
//         <div className="d-flex justify-content-center align-items-center">
//             <Row className="g-3" style={{ width: "100%", maxWidth: "400px" }}>
//                 {stats.map((item) => (
//                     <Col xs={6} key={item.id}>
//                         <Card 
//                             className="text-dark shadow-sm"
//                             style={{ 
//                                 borderRadius: "8px", 
//                                 border: "1px solid #ddd", 
//                                 background: "#fff", 
//                                 padding: "8px"
//                             }}
//                         >
//                             <div className="d-flex align-items-center">
//                                 <div
//                                     className="icon-box"
//                                     style={{
//                                         width: "40px",
//                                         height: "40px",
//                                         display: "flex",
//                                         alignItems: "center",
//                                         justifyContent: "center",
//                                         borderRadius: "8px",
//                                         border: "1px solid #ddd",
//                                         color: item.color,
//                                         background: "#f1f1f1",
//                                         marginRight: "10px"
//                                     }}      
//                                 >
//                                     {item.icon}
//                                 </div>
//                                 <div>
//                                     <h6 
//                                         className="mb-0 text-nowrap" 
//                                         style={{ fontSize: "12px", fontWeight: "600", color: "#7f7f7f" }}
//                                     >
//                                         {item.label}
//                                     </h6>
//                                     <span style={{ fontSize: "18px", fontWeight: "bold", color: "#212529" }}>
//                                         {item.number}
//                                     </span>
//                                 </div>
//                             </div>
//                         </Card>
//                     </Col>
//                 ))}
//             </Row>
//         </div>
//     );
// };

// export default DataCards;


import React, { useEffect, useState } from "react";
import { Card, Row, Col } from "react-bootstrap";
import { 
    AiOutlineQrcode, 
    AiOutlineExclamationCircle, 
    AiOutlineCheckCircle, 
    AiOutlineUndo 
} from "react-icons/ai";
import useTranslate from "utils/useTranslate";

const DataCards = () => {
    const translatedText = useTranslate({
        "Total Items": "Total Items",
        "Total Lost": "Total Lost",
        "Total Found": "Total Found",
        "Recovery Rate": "Recovery Rate"
    });

    const [stats, setStats] = useState([
        { id: 1, number: "0", label: "Total Items", icon: <AiOutlineQrcode size={22} />, color: "#6c757d" }, 
        { id: 2, number: "0", label: "Total Lost", icon: <AiOutlineExclamationCircle size={22} />, color: "#6c757d" }, 
        { id: 3, number: "0", label: "Total Found", icon: <AiOutlineCheckCircle size={22} />, color: "#6c757d" }, 
        { id: 4, number: "0", label: "Recovery Rate", icon: <AiOutlineUndo size={22} />, color: "#6c757d" }, 
    ]);

    const fetchUserItems = async () => {
        try {
            const response = await fetch("/api/user-items");
            const data = await response.json();
            
            setStats([
                { id: 1, number: data.total_qr_assigned || "0", label: "Total Items", icon: <AiOutlineQrcode size={22} />, color: "#6c757d" },
                { id: 2, number: data.total_lost_count || "0", label: "Total Lost", icon: <AiOutlineExclamationCircle size={22} />, color: "#6c757d" },
                { id: 3, number: data.total_found_count || "0", label: "Total Found", icon: <AiOutlineCheckCircle size={22} />, color: "#6c757d" },
                { id: 4, number: `${data.recovery_rate? parseInt(data.recovery_rate):"0"}%` || "0", label: "Recovery Rate", icon: <AiOutlineUndo size={22} />, color: "#6c757d" },
            ]);

        } catch (error) {
            console.log("error fetching user items", error);
            console.error("Error fetching data:", error.message);
        }
    };

    useEffect(() => {
        fetchUserItems();
    }, []);

    return (
        <div className="d-flex justify-content-center align-items-center py-5">
        <Row className="g-3" style={{ width: "100%", maxWidth: "400px" }}>
          {stats.map((item) => (
            <Col xs={6} key={item.id}>
              <Card
                className="shadow-sm"
                style={{
                  borderRadius: "12px",
                  border: "1px solid #A22191",
                  background: "#fff",
                  padding: "10px",
                  transition: "transform 0.2s ease",
                  cursor: "pointer"
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                <div className="d-flex align-items-center">
                  <div
                    className="icon-box"
                    style={{
                      width: "42px",
                      height: "42px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "10px",
                      border: "1px solid #F3C6ED",
                      color: item.color || "#FFA500",
                      background: "#FEF7FF",
                      marginRight: "12px"
                    }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <h6
                      className="mb-0 text-nowrap"
                      style={{ fontSize: "12px", fontWeight: "600", color: "#A22191" }}
                    >
                      {translatedText[item.label] || item.label}
                    </h6>
                    <span
                      style={{
                        fontSize: "18px",
                        fontWeight: "bold",
                        color: "#212529",
                        lineHeight: "1.2"
                      }}
                    >
                      {item.number}
                    </span>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
      
    );
};

export default DataCards;
