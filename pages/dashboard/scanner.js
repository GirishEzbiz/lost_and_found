import QRScanner from "utils/QRScanner";
import GoBack, { BackButton } from "./backButton";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  const handleBack = () => {
    // Navigate directly to the dashboard page
    router.push("/dashboard/items"); // Adjust the URL if necessary
  };
  return (
    <>
      <div className="d-flex align-items-center  bg-white p-3">
        <BackButton onClick={handleBack} />
        <div className=" w-100 ">
          <h4 className="mb-0" style={{ marginLeft: "5%" }}>
            QR Code Scanner
          </h4>
        </div>
      </div>
      <div className="container my-4 ">
        <QRScanner />
      </div>
    </>
  );
}
