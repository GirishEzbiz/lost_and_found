import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function QRScanner() {
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 5,
    });

    scanner.render(success, error);

    function success(result) {
      scanner.clear();
      setScanResult(result);
      window.location.href = result; // Automatically navigate to the scanned URL
    }

    function error(error) {
      console.warn(error);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-green-500 flex flex-col justify-center items-center text-black ">
      {scanResult ? (
        <div className="text-center">
          <p className="text-lg mb-4">Redirecting to:</p>
          <a
            href={scanResult}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xl text-blue-200 underline"
          >
            {scanResult}
          </a>
        </div>
      ) : (
        <div
          id="reader"
          className="bg-transparent border-2 border-blue-600 rounded-lg   p-8 mb-8"
          style={{
     
            borderStyle: "dashed",
            borderRadius: "10px",
            backgroundColor: "rgba(224, 110, 43, 0.8)",
          }} 

        >
       
        </div>


      )}

       
    </div>
  );
}

