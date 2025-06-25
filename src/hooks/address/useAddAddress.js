import { useState } from 'react';
import { apiRequest } from '../../utils/api';
import { showToast } from '../../utils/constent';

const useAddAddress = () => {
    const [loading, setLoading] = useState(false);

    const addAddress = async (userId, addressData, onSuccess) => {
        try {
            setLoading(true);
            const response = await apiRequest("POST", "/customer-address", {
                user_id: userId,
                house: addressData.houseNumber,
                landmark: addressData.landmark || "",
                address: addressData.fullAddress,
                address_label: addressData.label,
                is_default: 1
            });

            if (response.status === 201) {
                showToast("success", "Address added successfully");
                if (onSuccess) onSuccess(); // Callback after successful addition
            } else {
                showToast("error", response.message || "Failed to add address");
            }
        } catch (error) {
            showToast("error", "Failed to add address");
        } finally {
            setLoading(false);
        }
    };

    return { addAddress, loading };
};

export default useAddAddress;
