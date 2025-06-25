import axios from 'axios';
import {  API_URL, PROD_API_URL } from '@env';
import RNFetchBlob from 'react-native-blob-util';

// Determine the correct base URL based on the environment
const BASE_URL = API_URL;

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 30000, // 10 seconds timeout
    headers: {
        'Content-Type': 'application/json',
    },
});
export const apiRequest = async (method, endpoint, data = null, params = null, token = null, extraHeaders = {}) => {
    try {
        const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
        // console.log("API Request:", data)
        const headers = {
            ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...extraHeaders,
        };

        if (method.toUpperCase() === 'GET') {
            params = { ...params, _t: Date.now() };
        }

        const sanitizedURL = `${BASE_URL.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;

        const axiosConfig = {
            method,
            url: sanitizedURL,
            headers,
            timeout: 30000,
            ...(method.toUpperCase() === 'GET' ? { params } : { data }),
        };

        const response = await axios(axiosConfig);
        return response.data;
    } catch (error) {
        console.log("Raw Axios Error:", error.toJSON?.() || error);

        console.error("API Error:", {
            status: error.response?.status || "Unknown",
            data: error.response?.data || "No response data",
            message: error.message || "Unknown error",
        });

        return {
            status: error.response?.status || 500,
            message: error.response?.data?.message || "Something went wrong",
            details: error.message || "Unknown error",
        };
    }
};



export const downloadImageUrl = async (url, filename = "downloaded_image.png") => {
    try {
        // Request storage permission for Android
        const { fs } = RNFetchBlob;
        const path = Platform.OS === 'ios' ? fs.dirs.DocumentDir : fs.dirs.DownloadDir;
        const filePath = `${path}/${filename}`;

        // Start download
        const res = await RNFetchBlob.config({
            fileCache: true,
            path: filePath,
            addAndroidDownloads: {
                useDownloadManager: true,  // Show download notification
                notification: true,
                title: filename,
                description: "Downloading image...",
                mime: "image/png",
                path: filePath,
            },
        }).fetch("GET", url);
        if (Platform.OS === "ios") {
            // Open file immediately after download
            RNFetchBlob.ios.openDocument(filePath);
        }

        // Alert.alert("Download Complete", `File saved to: ${res.path()}`);
        console.log("Download Complete:", res.path());

        return res.path();  // Returns the saved file path
    } catch (error) {
        console.error("Download Error:", error);
        Alert.alert("Download Failed", "Something went wrong!");
    }
};


export default api;
