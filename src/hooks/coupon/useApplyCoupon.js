import { useState } from 'react';
import { apiRequest } from '../../utils/api';
import { showToast } from '../../utils/constent';

const useApplyCoupon = () => {
    const [loading, setLoading] = useState(false);
    const [discountAmount, setDiscountAmount] = useState(0);
    // const [f, setError] = useState(0);

    const applyCoupon = async (userId, couponCode, totalAmount, onSuccess) => {
        try {
            setLoading(true);
            console.log(userId, couponCode, totalAmount);
            const response = await apiRequest("POST", "/coupon/use-coupon", {
                user_id: userId,
                coupon_code: couponCode,
                cart_total: totalAmount
            });
    
            console.log("Coupon Response:", response);
    
            // ✅ Explicitly handle 400 response without throwing an error
            if (response.status === 400) {
                showToast("error", response.message || "Invalid coupon code");
                setDiscountAmount(0);
                return; // Prevent further execution
            }
    
            if (response.status === 200) {
                setDiscountAmount(response?.discount || 0); // Store discount amount
                showToast("success", "Coupon applied successfully!");
                if (onSuccess) onSuccess(response);
            } else {
                showToast("error", response.message || "Failed to apply coupon");
                setDiscountAmount(0);
            }
        } catch (error) {
            console.error("Error applying coupon:", error);
            
            // ✅ Handle specific HTTP error response structure
            if (error.response) {
                const { status, data } = error.response;
                showToast("error", data?.message || `Error ${status}: Failed to apply coupon`);
            } else {
                showToast("error", "Failed to apply coupon. Please try again.");
            }
    
            setDiscountAmount(0);
        } finally {
            setLoading(false);
        }
    };
    
    return { applyCoupon, discountAmount, loading, setDiscountAmount };
};

export default useApplyCoupon;
