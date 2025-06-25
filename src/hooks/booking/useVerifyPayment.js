import { useState } from 'react';
import { apiRequest } from '../../utils/api';
import { showToast } from '../../utils/constent';

const useVerifyPayment = () => {
    const [loading, setLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null);

    const verifyPayment = async (paymentData, onSuccess) => {
        try {
            setLoading(true);
            const response = await apiRequest("POST", "/booking/verify-payment", {
                ...paymentData,
            });

            console.log("Payment Verification:", response.status);

            if (response.status === 200) {
                setPaymentStatus(response.data);
                if (onSuccess) onSuccess(response.data);
                showToast("success", "Payment verified successfully!");
            } else {
                showToast("error", response.message || "Payment verification failed, please try again.");
                setPaymentStatus(null);
            }
        } catch (error) {
            showToast("error", "Something went wrong, please try again.");
            setPaymentStatus(null);
        } finally {
            setLoading(false);
        }
    };

    return { verifyPayment, paymentStatus, loading };
};

export default useVerifyPayment;
