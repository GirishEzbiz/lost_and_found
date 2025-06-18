
import React from "react";
import { utils, writeFile } from "xlsx";

const ExportButton = ({ data, setError, filters, batchId }) => {
  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleDownload = async () => {
    if (!data || data.length === 0) {
      setError && setError("No data available for download.");
      return;
    }

    try {
      const currentDate = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD

      const response = await fetch("/api/admin/mark-downloaded", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brandId: filters.brand || null,
          skuId: filters.sku || null,
          batchId: batchId || null,
          qrCodes: data.map((item) => item.Encrypted_Code) || [],
          downloadedDate: currentDate,        
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark QR codes as downloaded.");
      }


    } catch (error) {
      setError && setError(error.message);
    
    }
  };

  const handleExport = async () => {
    if (
      !filters.brand &&
      !filters.sku &&
      !filters.fromDate &&
      !filters.toDate &&
      !batchId
    ) {
      setError &&
        setError("Please select at least one filter criteria before downloading.");
      return;
    }

    if (!data || data.length === 0) {
      setError && setError("No data available for export.");
      return;
    }

    // Create a new workbook
    const wb = utils.book_new(); // ✅ Corrected function call

    const qrBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;


    // Prepare data for export
    const exportData = data?.map((item, index) => ({
      "Serial No.": item.Serial_No,
      SKU: item.SKU_Name,
      Code: `${qrBaseUrl}/qr/${item.Encrypted_Code}`,
      "Encrypted Code": item.Encrypted_Code,
      "Assigning Date": formatDate(item.Assigning_Date),
      "Expiry Date": formatDate(item.Exp_Date),
      Status: item.Status,
    }));



    // Convert JSON to sheet
    const ws = utils.json_to_sheet(exportData);

    // Append the worksheet to the workbook
    utils.book_append_sheet(wb, ws, "Sheet1");

    // Write the file and trigger a download
    writeFile(wb, "exported_data.xlsx");

    // Call handleDownload() to mark as downloaded
    await handleDownload();
  };

  return (
    <div className="btn btn-outline-white ms-2" onClick={handleExport}>
      <span className="me-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="icon-xs"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
      </span>
      Download
    </div>
  );
};

export default ExportButton;
