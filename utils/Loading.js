import React from "react";

const Loading = ({ fullScreen = false }) => {
  return (
    <div
      className={`${
        fullScreen
          ? "s position-fixed top-0 left-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center"
          : "d-flex justify-content-center align-items-center"
      }`}
      style={{ minHeight: fullScreen ? "100vh" : "auto" }}
    >
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};

export default Loading;
