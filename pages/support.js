import Link from "next/link";
import React from "react";
import { FaHome, FaBox, FaBell, FaUserAlt } from "react-icons/fa";
import { IoQrCodeSharp } from "react-icons/io5";

export default function Support() {
  return (
    <div
      className="position-fixed bottom-0 start-0 end-0 px-3 py-1"
      style={{
        zIndex: 10,
        background: "linear-gradient(45deg, #ffffff, #f8f9fa)", // Gradient background
        boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.1)",
        borderRadius: "20px 20px 0 0",
      }}
    >
      <div
        className="d-flex justify-content-between align-items-center"
        style={{
          maxWidth: "600px", // Limit width for larger screens
          margin: "0 auto",
        }}
      >
        {/* Home Button */}
        <div className="text-center flex-grow-1">
          <Link href="/dashboard">
            <button className="btn border-0 bg-transparent d-flex flex-column align-items-center transition-all">
              <FaHome
                className="fs-3"
                style={{
                  color: "#6c757d",
                  transition: "transform 0.2s, color 0.2s",
                }}
              />
              <span
                className="mt-1 small fw-medium"
                style={{ color: "#6c757d" }}
              >
                Home
              </span>
            </button>
          </Link>
        </div>

        {/* Items Button */}
        <div className="text-center flex-grow-1">
          <Link href="/dashboard/items">
            <button className="btn border-0 bg-transparent d-flex flex-column align-items-center transition-all">
              <FaBox
                className="fs-3"
                style={{
                  color: "#6c757d",
                  transition: "transform 0.2s, color 0.2s",
                }}
              />
              <span
                className="mt-1 small fw-medium"
                style={{ color: "#6c757d" }}
              >
                Items
              </span>
            </button>
          </Link>
        </div>

        {/* QR Scanner Button */}
        <div
          className="position-relative"
          style={{ flexGrow: 1, zIndex: 5 }}
        >
          <Link href="/dashboard/scanner">
            <button
              className="btn border-0 d-flex justify-content-center align-items-center"
              style={{
                top: "-40px",
                left: "50%",
                transform: "translateY(-40%)",
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                background: "#A22191",
                boxShadow: "0 4px 15px rgba(245, 110, 0, 0.3)",
                color: "#fff",
                fontSize: "1.5rem",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-40%) scale(1.1)";
                e.currentTarget.style.boxShadow =
                  "0 6px 20px rgba(0, 0, 0, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(-40%) scale(1)";
                e.currentTarget.style.boxShadow =
                  "0 4px 15px rgba(0, 0, 0, 0.3)";
              }}
             
            >
              <IoQrCodeSharp />
            </button>
          </Link>
        </div>

        {/* Notifications Button */}
        <div className="text-center flex-grow-1">
          <Link href="/dashboard/alerts">
            <button className="btn border-0 bg-transparent d-flex flex-column align-items-center transition-all">
              <FaBell
                className="fs-3"
                style={{
                  color: "#6c757d",
                  transition: "transform 0.2s, color 0.2s",
                }}
              />
              <span
                className="mt-1 small fw-medium"
                style={{ color: "#6c757d" }}
              >
                Alerts
              </span>
            </button>
          </Link>
        </div>

        {/* Profile Button */}
        <div className="text-center flex-grow-1">
          <Link href="/dashboard/profile">
            <button className="btn border-0 bg-transparent d-flex flex-column align-items-center transition-all">
              <FaUserAlt
                className="fs-3"
                style={{
                  color: "#6c757d",
                  transition: "transform 0.2s, color 0.2s",
                }}
              />
              <span
                className="mt-1 small fw-medium"
                style={{ color: "#6c757d" }}
              >
                Profile
              </span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}



// import Link from "next/link";
// import React from "react";
// import { FaHome, FaBox, FaBell, FaUserAlt } from "react-icons/fa"; // Simplified icon choices
// import { IoQrCodeSharp } from "react-icons/io5"; // QR code scanner icon

// export default function Support() {
//   return (
//     <div className="container position-fixed bottom-0 start-0 end-0 p-0">
//       <div className="d-flex justify-content-around py-2 bg-white shadow-lg rounded-t-xl border-top">
//         {/* Home Button */}
//         <div className="text-center">
//           <Link href="/dashboard">
//             <button className="btn p-0 d-flex flex-column align-items-center border-0 bg-transparent hover:bg-primary hover:text-white rounded-3 transition duration-200 ease-in-out">
//               <FaHome className="fs-4 text-dark" />
//               <h6 className="mt-2 fs-6 text-muted">Home</h6>
//             </button>
//           </Link>
//         </div>

//         {/* Items Button */}
//         <div className="text-center">
//           <Link href="/dashboard/manage-items">
//             <button className="btn p-0 d-flex flex-column align-items-center border-0 bg-transparent hover:bg-primary hover:text-white rounded-3 transition duration-200 ease-in-out">
//               <FaBox className="fs-4 text-dark" />
//               <h6 className="mt-2 fs-6 text-muted">Items</h6>
//             </button>
//           </Link>
//         </div>

//         {/* QR Scanner Button */}
//         <div className="text-center position-relative d-flex justify-content-center align-items-center">
//           <Link href="/dashboard/scanner">
//             <button
//               className="btn border-0 bg-transparent position-absolute"
//               style={{
//                 top: "-18px", // Positioning the QR button above others
//                 left: "50%", // Centering horizontally
//                 transform: "translateX(-50%) scale(1.5)", // Enlarging the QR button
//                 zIndex: 3, // Ensuring it's above other buttons
//               }}
//             >
//               <IoQrCodeSharp className="fs-4 text-dark" />
//               <h6 className="mt-1 text-muted">Scan</h6>
//             </button>
//           </Link>
//         </div>

//         {/* Notifications Button */}
//         <div className="text-center">
//           <Link href="/dashboard/alerts">
//             <button className="btn p-0 d-flex flex-column align-items-center border-0 bg-transparent hover:bg-primary hover:text-white rounded-3 transition duration-200 ease-in-out">
//               <FaBell className="fs-4 text-dark" />
//               <h6 className="mt-2 fs-6 text-muted">Alerts</h6>
//             </button>
//           </Link>
//         </div>

//         {/* Profile Button */}
//         <div className="text-center">
//           <Link href="/dashboard/profile">
//             <button className="btn p-0 d-flex flex-column align-items-center border-0 bg-transparent hover:bg-primary hover:text-white rounded-3 transition duration-200 ease-in-out">
//               <FaUserAlt className="fs-4 text-dark" />
//               <h6 className="mt-2 fs-6 text-muted">Profile</h6>
//             </button>
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }

