// import axios from 'axios'


// export const BACKEND_URI = import.meta.env.VITE_BACKEND_URI || 'http://localhost:4500';

// const BASE_URL = `${BACKEND_URI}/api/v1`;

// // ✅ Helper to get token from localStorage
// const getAuthToken = () => {
//     const loginInfo = JSON.parse(localStorage.getItem("loginInfo"));
//     return loginInfo?.token || null;
// };

// export const apiService = {
//     // GET
//     getBankManagementTypesList: async (endpoint) => {
//         try {
//             const bankManagementTypes = await axios.get(`${BASE_URL}/${endpoint}`)
//             return bankManagementTypes.data
//         } catch (err) {
//             throw { error: err.message }
//         }
//     },
//     // POST
//     postFormInfoToServer: async (endpoint, data, config = {}) => {
//         try {
//             const bankData = await axios.post(`${BASE_URL}/${endpoint}`, data, config)
//             return bankData.data
//         } catch (err) {
//             throw {
//                 message: err.response?.data?.message || err.message,
//                 status: err.response?.status || 500,
//                 data: err.response?.data || null
//             };
//         }
//     },
//     // [ VIDEO POST ]
//     // postVideoInfoToServer: async (endpoint, data, config = {}) => {
//     //     try {
//     //         const bankData = await axios.post(`${BASE_URL}/${endpoint}`, data, config)
//     //         return bankData.data
//     //     } catch (err) {
//     //         throw { message: err.message }
//     //     }
//     // },

//     // GET
//     getInfoFromServer: async (endpoint) => {
//         try {
//             const bankDetails = await axios.get(`${BASE_URL}${endpoint}`)
//             return bankDetails.data
//         } catch (err) {
//             throw new Error(err.message)

//         }

//     },
//     // GET
//     getParamsData: async (endpoint, bank, field) => {
//         try {
//             const bankDetails = await axios.get(`${BASE_URL}/${endpoint}?bank_name=${bank}&management_type=${field}`)
//             return bankDetails.data
//         } catch (err) {
//             throw { error: err.message }

//         }

//     },
//     // GET
//     getITParamsData: async (endpoint, name, field) => {
//         try {
//             const bankDetails = await axios.get(`${BASE_URL}/${endpoint}?it_name=${name}&it_type=${field}`)
//             return bankDetails.data
//         } catch (err) {
//             throw { error: err.message }

//         }

//     },
//     //UPDATE
//     updatingDescriptionAndColorByName: async (endpoint, updatingData) => {
//         try {
//             const updateDesc = await axios.put(`${BASE_URL}/${endpoint}`, updatingData)
//             return updateDesc.data

//         } catch (err) {
//             throw { message: err.message }
//         }
//     },

//     updatingById: async (endpoint, id, updatingData) => {
//         try {
//             const serverResponse = await axios.put(`${BASE_URL}/${endpoint}/${id}`, updatingData);
//             return serverResponse.data;
//         } catch (err) {
//             const errorMessage = err.response?.data?.message || err.message || 'Something went wrong!';
//             throw new Error(errorMessage);
//         }
//     },


//     // updatingById: async (endpoint, id, updatingData) => {
//     //     try {
//     //         const serverResponse = await axios.put(`${BASE_URL}/${endpoint}/${id}`, updatingData)
//     //         return serverResponse.data
//     //     } catch (err) {
//     //         throw Error('Something went wrong!')

//     //     }
//     // },

//     // DELETE BY ID
//     deletingById: async (endpoint, id) => {
//         try {
//             const serverResponse = await axios.delete(`${BASE_URL}${endpoint}/${id}`)
//             return serverResponse

//         } catch (err) {
//             throw Error(err.message)
//         }
//     },
//     deletingByIdByAdmin: async (fullEndpointWithId, body = {}) => {
//         try {
//             const serverResponse = await axios.delete(`${BASE_URL}${fullEndpointWithId}`, {
//                 data: body // ✅ Correct way to send DELETE body
//             });
//             return serverResponse.data;
//         } catch (err) {
//             throw err.response?.data || new Error(err.message);
//         }
//     },
//     updatingSpecificVideoById: async (fullEndpointWithId, body = {}) => {
//         try {
//             const serverResponse = await axios.put(`${BASE_URL}${fullEndpointWithId}`, body);
//             return serverResponse;
//         } catch (err) {
//             throw Error(err.message);
//         }
//     },
//     // DELETE SPECIFIC VIDEO BY ID
//     deletingSpecificVideoById: async (fullEndpointWithId, body = {}) => {
//         try {
//             const serverResponse = await axios.delete(`${BASE_URL}${fullEndpointWithId}`, {
//                 data: body,
//             });
//             return serverResponse;
//         } catch (err) {
//             throw Error(err.message);
//         }
//     },

//     //  FILE UPLOADING FOR TECHNICAL BANKING SG (SALE GROWTH)
//     fileUploadingForField: async (endpoint, data, config) => {
//         try {
//             const fileUploadingData = await axios.post(`${BASE_URL}${endpoint}`, data, config)
//             return fileUploadingData

//         } catch (err) {
//             throw Error(err.message)
//         }

//     },

//     fetchCSV: async (url, endpoint) => {
//         try {
//             // console.log(`${BASE_URL}${endpoint}`)
//             const response = await axios.get(`${BASE_URL}${endpoint}`, {
//                 params: { url }
//             });
//             return response.data;
//         } catch (error) {
//             throw new Error('Failed to fetch CSV data');
//         }
//     },

//     fetchCSV2: async (endpoint, dates) => {
//         try {
//             const response = await axios.get(`${BASE_URL}${endpoint}`, {
//                 params: { dates },
//                 paramsSerializer: (params) => {
//                     return params.dates.map(date => `dates[]=${date}`).join('&');
//                 }
//             });
//             return response.data;
//         } catch (error) {
//             throw new Error('Failed to fetch CSV data');
//         }
//     },
//     fetchCSVDataFromDateRequest: async (endpoint, requestDate) => {
//         // const { from_date, to_date } = requestDate
//         // const {to_date } = requestDate
//         try {
//             const response = await axios.get(`${BASE_URL}${endpoint}`, {
//                 params: requestDate,
//             });
//             return response.data;
//         } catch (error) {
//             throw new Error('Oops ! No Data Found');
//         }
//     },


//     // =================================== DATABASE OPERATION EXCUATE HERE ======================================= //

//     //---->>> DELETE OR TRUNCATE TABLE 
//     truncateTable: async (endpoint) => {
//         try {
//             const serverResponse = await axios.post(`${BASE_URL}/${endpoint}`)
//             // console.log(serverResponse.data)
//             return serverResponse
//         } catch (err) {
//             throw Error('Something went wrong!')
//         }

//     }

// }



import axios from "axios";

export const BACKEND_URI =
    import.meta.env.VITE_BACKEND_URI || "http://localhost:4500";

const BASE_URL = `${BACKEND_URI}/api/v1`;

// ✅ Helper to get token from localStorage
const getAuthToken = () => {
    const loginInfo = JSON.parse(localStorage.getItem("loginInfo"));
    return loginInfo?.token || null;
};

// ✅ Create an axios instance
const api = axios.create({
    baseURL: BASE_URL,
});

// ✅ Automatically attach token to all requests
api.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const apiService = {
    // GET
    getBankManagementTypesList: async (endpoint) => {
        try {
            const res = await api.get(`/${endpoint}`);
            return res.data;
        } catch (err) {
            throw { error: err.message };
        }
    },

    // POST
    postFormInfoToServer: async (endpoint, data, config = {}) => {
        try {
            const res = await api.post(`/${endpoint}`, data, config);
            return res.data;
        } catch (err) {
            throw {
                message: err.response?.data?.message || err.message,
                status: err.response?.status || 500,
                data: err.response?.data || null,
            };
        }
    },

    // GET
    getInfoFromServer: async (endpoint) => {
        try {
            const res = await api.get(endpoint);
            return res.data;
        } catch (err) {
            // throw new Error(err.message);
            throw {
                message: err.response?.data?.message || err.message,
                status: err.response?.status || 500,
                data: err.response?.data || null,
            };
        }
    },

    // GET with params
    getParamsData: async (endpoint, bank, field) => {
        try {
            const res = await api.get(`/${endpoint}`, {
                params: { bank_name: bank, management_type: field },
            });
            return res.data;
        } catch (err) {
            throw { error: err.message };
        }
    },

    getITParamsData: async (endpoint, name, field) => {
        try {
            const res = await api.get(`/${endpoint}`, {
                params: { it_name: name, it_type: field },
            });
            return res.data;
        } catch (err) {
            throw { error: err.message };
        }
    },

    // UPDATE
    updatingDescriptionAndColorByName: async (endpoint, updatingData) => {
        try {
            const res = await api.put(`/${endpoint}`, updatingData);
            return res.data;
        } catch (err) {
            throw { message: err.message };
        }
    },

    updatingById: async (endpoint, id, updatingData) => {
        try {
            const res = await api.put(`/${endpoint}/${id}`, updatingData);
            return res.data;
        } catch (err) {
            const errorMessage =
                err.response?.data?.message || err.message || "Something went wrong!";
            throw new Error(errorMessage);
        }
    },

    // DELETE
    deletingById: async (endpoint, id) => {
        try {
            const res = await api.delete(`${endpoint}/${id}`);
            return res.data;
        } catch (err) {
            throw Error(err.message);
        }
    },

    deletingByIdByAdmin: async (fullEndpointWithId, body = {}) => {
        try {
            const res = await api.delete(fullEndpointWithId, { data: body });
            return res.data;
        } catch (err) {
            throw err.response?.data || new Error(err.message);
        }
    },

    updatingSpecificVideoById: async (fullEndpointWithId, body = {}) => {
        try {
            const res = await api.put(fullEndpointWithId, body);
            return res.data;
        } catch (err) {
            throw Error(err.message);
        }
    },

    deletingSpecificVideoById: async (fullEndpointWithId, body = {}) => {
        try {
            const res = await api.delete(fullEndpointWithId, { data: body });
            return res.data;
        } catch (err) {
            throw Error(err.message);
        }
    },

    // FILE UPLOADING
    fileUploadingForField: async (endpoint, data, config) => {
        try {
            const res = await api.post(endpoint, data, config);
            return res.data;
        } catch (err) {
            throw Error(err.message);
        }
    },

    // CSV Fetching
    fetchCSV: async (url, endpoint) => {
        try {
            const res = await api.get(endpoint, { params: { url } });
            return res.data;
        } catch (error) {
            throw new Error("Failed to fetch CSV data");
        }
    },

    fetchCSV2: async (endpoint, dates) => {
        try {
            const res = await api.get(endpoint, {
                params: { dates },
                paramsSerializer: (params) =>
                    params.dates.map((date) => `dates[]=${date}`).join("&"),
            });
            return res.data;
        } catch (error) {
            throw new Error("Failed to fetch CSV data");
        }
    },

    fetchCSVDataFromDateRequest: async (endpoint, requestDate) => {
        try {
            const res = await api.get(endpoint, { params: requestDate });
            return res.data;
        } catch (error) {
            throw new Error("Oops ! No Data Found");
        }
    },

    // TRUNCATE TABLE
    truncateTable: async (endpoint) => {
        try {
            const res = await api.post(`/${endpoint}`);
            return res.data;
        } catch (err) {
            throw Error("Something went wrong!");
        }
    },
};
