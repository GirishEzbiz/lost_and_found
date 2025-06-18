import axios from "axios";
 

export const apiRequest = async (url, token, method, data = null) => {
  try {
    const config = {
      method,
      url,
      headers: {
        // Authorization: `${token}`,
        "Content-Type": "application/json",
        // "Content-Type": "multipart/form-data",
      },
      // Token already attassched in Cookie  like=>  token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNhdHlhbS5yYWlAZX
      data, // Include data for POST/PUT requests
    };

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.log("api req error", error);


    throw error.response?.data || { message: "An error occurred" };
  }
};  