import { useState } from 'react';
import { apiRequest } from '../../utils/api';
import { showToast } from '../../utils/constent';

const useSetDefaultAddress = () => {
    const [loading, setLoading] = useState(false);

    const setDefaultAddress = async (userId, addressId, onSuccess) => {
        try {
            setLoading(true);
            const response = await apiRequest("PUT", `/customer-address/change-default/${addressId}`);

            if (response.status === 200) {
                // showToast("success", "Default address updated successfully");
                if (onSuccess) onSuccess(); // Callback after success
            } else {
                showToast("error", response.message || "Failed to set default address");
            }
        } catch (error) {
            showToast("error", "Failed to set default address");
        } finally {
            setLoading(false);
        }
    };

    return { setDefaultAddress, loading };
};

export default useSetDefaultAddress;
