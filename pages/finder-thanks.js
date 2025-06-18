// // import { IoIosArrowBack, IoMdCheckmarkCircleOutline } from "react-icons/io";

// // const Contact = () => {
// //   return (
// //     <>
// //       <div className="container py-4">
// //         <div className="text-center">
// //           <IoMdCheckmarkCircleOutline
// //             size={60}
// //             style={{ color: "green", marginBottom: "20px" }}
// //           />
// //           <h4 style={{ color: "green" }}>Thank You for Your Contribution!</h4>
// //           <p className="mt-3" style={{ fontSize: "16px", color: "#333" }}>
// //             Your submission has been successfully sent. We appreciate your help
// //             in reconnecting this item with its rightful owner.
// //           </p>
// //         </div>
// //       </div>
// //     </>
// //   );
// // };

// // export default Contact;


// import { useEffect, useState } from "react";
// import { useRouter } from "next/router";
// import Cookies from "js-cookie";
// import { IoMdCheckmarkCircleOutline } from "react-icons/io";
// import { Button } from "react-bootstrap";

// const ThankYouContact = () => {
//   const router = useRouter();
//   const [translated, setTranslated] = useState({
//     heading: "",
//     message: ""
//   });
//   const [totalTime, setTotalTime] = useState(null);

//   useEffect(() => {
//     const scanTime = localStorage.getItem('qr_scan_time');
//     if (scanTime) {
//       const now = Date.now();
//       const diffInSeconds = Math.floor((now - scanTime) / 1000);
//       setTotalTime(diffInSeconds);
//       // Clear the storage after calculation
//       localStorage.removeItem('qr_scan_time');
//     }

//     Cookies.remove("unique_user_id")
//   }, []);

//   const fallbackText = {
//     heading: "Thank You for Your Contribution!",
//     message:
//       "Your submission has been successfully sent. We appreciate your help in reconnecting this item with its rightful owner."
//   };

//   const selectedLang = Cookies.get("preferred_language") || "en";

//   useEffect(() => {
//     const translate = async () => {
//       // ✅ If language is English or already present in query
//       if (selectedLang === "en" || (router.query.heading && router.query.message)) {
//         setTranslated({
//           heading: router.query.heading || fallbackText.heading,
//           message: router.query.message || fallbackText.message
//         });
//         return;
//       }

//       try {
//         const response = await fetch(
//           `https://translation.googleapis.com/language/translate/v2?key=${process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY}`,
//           {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               q: [fallbackText.heading, fallbackText.message],
//               target: selectedLang
//             })
//           }
//         );

//         const data = await response.json();
//         const translatedText = data?.data?.translations || [];

//         setTranslated({
//           heading: translatedText[0]?.translatedText || fallbackText.heading,
//           message: translatedText[1]?.translatedText || fallbackText.message
//         });
//       } catch (err) {
//         console.error("Translation failed:", err);
//         setTranslated(fallbackText); // fallback
//       }
//     };

//     translate();
//   }, [router.query, selectedLang]);


//   const formatDuration = (seconds) => {
//     if (seconds < 60) {
//       return `${seconds} seconds`;
//     } else {
//       const minutes = (seconds / 60).toFixed(2);
//       return `${minutes} minutes`;
//     }
//   };


//   return (
//     <div className="container py-4 text-center">
//       <IoMdCheckmarkCircleOutline
//         size={60}
//         style={{ color: "green", marginBottom: "20px" }}
//       />
//       <h4 style={{ color: "green" }}>{translated.heading}</h4>
//       <p className="mt-3" style={{ fontSize: "16px", color: "#333" }}>
//         {translated.message}
//       </p>
//       <Button onClick={() => router.push("/dashboard")}>Back to home</Button>
//       {
//         totalTime && <p>"You helped someone in just {formatDuration(totalTime)} ."</p>
//       }
//     </div>
//   );
// };

// export default ThankYouContact;



import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { Button } from "react-bootstrap";
import Image from "next/image"; // for image placeholder

const ThankYouContact = () => {
  const router = useRouter();
  const [translated, setTranslated] = useState({
    heading: "",
    message: ""
  });
  const [totalTime, setTotalTime] = useState(null);

  useEffect(() => {
    const scanTime = localStorage.getItem('qr_scan_time');
    if (scanTime) {
      const now = Date.now();
      const diffInSeconds = Math.floor((now - scanTime) / 1000);
      setTotalTime(diffInSeconds);
      localStorage.removeItem('qr_scan_time');
    }

    Cookies.remove("unique_user_id");
  }, []);

  const fallbackText = {
    heading: "Thank You for Your Contribution!",
    message:
      "Your submission has been successfully sent. We appreciate your help in reconnecting this item with its rightful owner."
  };

  const selectedLang = Cookies.get("preferred_language") || "en";

  useEffect(() => {
    const translate = async () => {
      if (selectedLang === "en" || (router.query.heading && router.query.message)) {
        setTranslated({
          heading: router.query.heading || fallbackText.heading,
          message: router.query.message || fallbackText.message
        });
        return;
      }

      try {
        const response = await fetch(
          `https://translation.googleapis.com/language/translate/v2?key=${process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              q: [fallbackText.heading, fallbackText.message],
              target: selectedLang
            })
          }
        );

        const data = await response.json();
        const translatedText = data?.data?.translations || [];

        setTranslated({
          heading: translatedText[0]?.translatedText || fallbackText.heading,
          message: translatedText[1]?.translatedText || fallbackText.message
        });
      } catch (err) {
        console.error("Translation failed:", err);
        setTranslated(fallbackText);
      }
    };

    translate();
  }, [router.query, selectedLang]);

  const formatDuration = (seconds) => {
    if (seconds < 60) {
      return `${seconds} seconds`;
    } else {
      const minutes = (seconds / 60).toFixed(2);
      return `${minutes} minutes`;
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center min-vh-100"
      style={{
        background: "#f9f1fb",
        padding: "40px 20px",
        textAlign: "center",
      }}
    >
      <div className="container" style={{ maxWidth: "600px" }}>
        <div className="mb-4">
          {/* ✅ Image placeholder */}
          <Image
            src="/assets/thanks.png" // replace with your image path
            alt="Thank You"
            width={200}
            height={200}
            className="img-fluid mb-4"
          />
        </div>

        
        <h4 style={{ color: "green" }}>{translated.heading}</h4>
        <p className="mt-3" style={{ fontSize: "16px", color: "#333" }}>
          {translated.message}
        </p>

        <button
          onClick={() => router.push("/dashboard")}
          style={{
            backgroundColor: "#a22191",
            color: "#ffffff",
            padding: "10px 20px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            marginTop: "20px"
          }}
        >
          Back to home
        </button>

        {totalTime && (
          <p className="mt-3" style={{ fontSize: "14px", color: "#444" }}>
            You helped someone in just {formatDuration(totalTime)}.
          </p>
        )}
      </div>
    </div>
  );
};

export default ThankYouContact;
