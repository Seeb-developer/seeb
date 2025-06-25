import { useState } from 'react';
import { apiRequest } from '../../utils/api';
import { showToast } from '../../utils/constent';

const useCreateRazorpayOrder = () => {
    const [loading, setLoading] = useState(false);
    const [orderDetails, setOrderDetails] = useState(null);

    const createRazorpayOrder = async (userId, amount, onSuccess) => {
        try {
            setLoading(true);
            const response = await apiRequest("POST", "/razorpay-order/create", {
                user_id: userId,
                amount: amount // Ensure the amount is in paise (₹1 = 100 paise)
            });
            console.log("Razorpay Order Created:", response.status);
            if (response.status === 201) {
                setOrderDetails(response.data);
                showToast("success", "Order created successfully!");
                if (onSuccess) onSuccess(response.data);
            } else {
                // showToast("error", response.message || "Something went wrong Please try again");
                setOrderDetails(null);
            }
        } catch (error) {
            // showToast("error", "Something went wrong Please try again");
            setOrderDetails(null);
        } finally {
            setLoading(false);
        }
    };

    return { createRazorpayOrder, orderDetails, loading };
};

export default useCreateRazorpayOrder;
