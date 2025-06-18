import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import Swal from "sweetalert2";
 

const QRScanner = () => {
  const videoRef = useRef(null);
  const [scanResult, setScanResult] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [hasError, setHasError] = useState(false);
  const codeReader = useRef(null);

  useEffect(() => {
    // Request camera permissions and initialize scanner
    const startScanner = async () => {
      try {
        setIsScanning(true);
        codeReader.current = new BrowserMultiFormatReader();

        // Check if camera is available
        const devices = await codeReader.current.listVideoInputDevices();
        if (devices.length === 0) {
          throw new Error("No camera devices found.");
        }

        const selectedDeviceId = devices[0].deviceId; // Select the first available camera
        await codeReader.current.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current,
          (result, error) => {
            if (result) {
              setScanResult(result.getText());
              if (navigator.vibrate) {
                navigator.vibrate(200); // Vibrate when a QR code is detected
              }
            }
            if (error && !(error instanceof ZXing.NotFoundException)) {
              console.error(error);
              Swal.fire({
                icon: "error",
                title: "Error Occurred",
                text: "Error occurred: " + error.message,
                confirmButtonColor: "#d33",
              });// Alert on error
            }
          }
        );
      } catch (error) {
        console.log("error occurred",error);

        setHasError(true);
        Swal.fire({
          icon: "error",
          title: "Error Occurred",
          text: "Error occurred: " + error.message,
          confirmButtonColor: "#d33",
        }); // Alert if something goes wrong
    }
    
    };

    startScanner();

    // Clean up the scanner on unmount
    return () => {
      if (codeReader.current) {
        codeReader.current.reset();
      }
    };
  }, []);

  return (
    <div>
      <h1>QR Scanner</h1>
      {hasError ? (
        <p>Camera or scanner error occurred. Please try again.</p>
      ) : null}
      <video ref={videoRef} style={{ width: "100%", height: "auto" }} />
      <p>Scan Result: {scanResult}</p>
    </div>
  );
};

export default QRScanner;
