import { useEffect, useState } from 'react';
import { apiRequest } from '../../utils/api';
import { showToast } from '../../utils/constent';

const useFetchDefaultAddress = (userId) => {
    const [defaultAddress, setDefaultAddress] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDefaultAddress();
    }, []);

    const fetchDefaultAddress = async () => {
        try {
            setLoading(true);
            const response = await apiRequest("GET", `/customer-address/default/${userId}`);
            
            if (response.status === 200 && response.data) {
                setDefaultAddress(response.data);
            } else {
                showToast("error", "No default address found");
            }
        } catch (error) {
            showToast("error", "Failed to fetch default address");
        } finally {
            setLoading(false);
        }
    };

    return { defaultAddress, loading, fetchDefaultAddress };
};

export default useFetchDefaultAddress;
