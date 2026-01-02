import axios from "axios";

// export const axiosInstance = axios.create({
//   baseURL:
//     import.meta.env.MODE === "development"
//       ? "http://localhost:4000/api/v1"
//       : "/",
//   withCredentials: true,
// });


export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:4000/api/v1"
      : "https://luanvantotnghiep-soto.onrender.com/api/v1",
  withCredentials: true,
});
console.log("Axios Base URL lib:", axiosInstance.defaults.baseURL);