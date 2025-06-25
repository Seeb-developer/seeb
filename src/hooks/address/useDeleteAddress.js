import { useState } from 'react';
import { apiRequest } from '../../utils/api';
import { showToast } from '../../utils/constent';

const useDeleteAddress = () => {
    const [loading, setLoading] = useState(false);

    const deleteAddress = async (addressId, onSuccess) => {
        try {
            setLoading(true);
            const response = await apiRequest("DELETE", `/customer-address/${addressId}`);
            
            if (response.status === 200) {
                showToast("success", "Address deleted successfully");
                if (onSuccess) onSuccess(); // Callback after successful deletion
            } else {
                showToast("error", response.message || "Failed to delete address");
            }
        } catch (error) {
            showToast("error", "Failed to delete address");
        } finally {
            setLoading(false);
        }
    };

    return { deleteAddress, loading };
};

export default useDeleteAddress;
