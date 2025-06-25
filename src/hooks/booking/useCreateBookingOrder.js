import { useState } from 'react';
import { apiRequest } from '../../utils/api';
import { showToast } from '../../utils/constent';


const useCreateBookingOrder = () => {
    const [loading, setLoading] = useState(false);
    const [orderDetails, setOrderDetails] = useState(null);

    const createBookingOrder = async (bookingData, onSuccess) => {
        setLoading(true);
        console.log(bookingData)
        try {
            const response = await apiRequest("POST", "/booking/store", {
                ...bookingData,
                payment_status: 'pending', // Ensuring default status
            });

            console.log("Booking Created:", response.status);
            // setLoading(false);
            if (response.status === 201) {
                setOrderDetails(response.data);
                if (onSuccess) onSuccess(response.data);
            } else {
                showToast("error", response.message || "Something went wrong, please try again.");
                setOrderDetails(null);
            }
        } catch (error) {
            showToast("error", "Something went wrong, please try again.");
            setOrderDetails(null);
        } finally {
            setLoading(false);
        }
    };

    return { createBookingOrder, orderDetails, loading, setLoading };
};

export default useCreateBookingOrder;
