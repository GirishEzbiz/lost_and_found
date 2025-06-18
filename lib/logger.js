// import pino from "pino";

// // Create Pino logger
// const logger = pino({
//   level: "info",
//   transport: {
//     targets: [
//       {
//         target: "pino-pretty", // Logs in console
//         options: { colorize: true },
//       },
//     ],
//   },
// });

// // Function to send logs to the backend API
// async function logToDatabase(level, message, stack, functionName) {
//   try {
//     await fetch("/api/test", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ level, message, stack, functionName }),
//     });
//   } catch (error) {
//     logger.error({ message: "Failed to log to database", stack: error.stack, function: "logToDatabase" });
//   }
// }

// // Override default Pino methods to also send logs to the backend
// const originalError = logger.error;
// logger.error = function (errorData) {
//   if (typeof errorData === "string") {
//     errorData = { message: errorData };
//   }
//   const { message, stack, function: functionName } = errorData;
  
//   // Send log to backend API
//   logToDatabase("error", message, stack || "", functionName || "Unknown");

//   // Call original Pino error function
//   originalError.call(logger, errorData);
// };

// export default logger;


import pino from "pino";
import path from "path";

// Define the log file path (logs/error.log)
const logFilePath = path.join(process.cwd(), 'logs', 'error.log');

// Create Pino logger
const logger = pino({
  level: "info",
  transport: {
    targets: [
      {
        target: "pino-pretty", // Logs in console
        options: { colorize: true },
      },
      {
        target: 'pino/file', // Logs to a file
        options: { destination: logFilePath }, // Log file destination
      },
    ],
  },
});

// Function to log error to file (optional if you want additional custom error logging)
async function logToFile(level, message, stack, functionName) {
  try {
    // Extract the first line of the stack trace (error message)
    const shortStack = (stack || "").split('\n').slice(0, 2).join('\n');

    const logMessage = `${new Date().toISOString()} - ${level.toUpperCase()} - ${message} - Stack: ${shortStack} - Function: ${functionName || "Unknown"}\n`;
    require('fs').appendFileSync(logFilePath, logMessage);
  } catch (error) {
    logger.error({ message: "Failed to log to file", stack: error.stack, function: "logToFile" });
  }
}

// Override default Pino methods to also log to file (optional)
const originalError = logger.error;
logger.error = function (errorData) {
  if (typeof errorData === "string") {
    errorData = { message: errorData };
  }
  const { message, stack, function: functionName } = errorData;

  // Optionally log to file as well (shortened stack trace)
  logToFile("error", message, stack || "", functionName || "Unknown");

  // Call the original Pino error function
  originalError.call(logger, errorData);
};

export default logger;

