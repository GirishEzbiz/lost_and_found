// components/CustomQRReader.js
import { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import jsQR from "jsqr";

export default function CustomQRReader() {
  const [scanResult, setScanResult] = useState("");
  const webcamRef = useRef(null);

  useEffect(() => {
    const scanQRCode = () => {
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          const img = new Image();
          img.src = imageSrc;
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(
              0,
              0,
              canvas.width,
              canvas.height
            );
            const code = jsQR(imageData.data, canvas.width, canvas.height);
            if (code) {
              setScanResult(code.data);
            }
          };
        }
      }
    };

    const interval = setInterval(scanQRCode, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2>Custom QR Code Scanner</h2>
      <Webcam ref={webcamRef} screenshotFormat="image/png" />
      <p>Scanned Code: {scanResult || "No result yet"}</p>
    </div>
  );
}
