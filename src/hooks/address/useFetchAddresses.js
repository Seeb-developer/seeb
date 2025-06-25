import { useEffect, useState } from 'react';
import { apiRequest } from '../../utils/api';
import { showToast } from '../../utils/constent';

const useFetchAddresses = (userId) => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const response = await apiRequest("GET", `/customer-address/${userId}`);
            if (response.status === 200) {
                setAddresses(response.data);
            } else {
                showToast("error", "Failed to fetch addresses");
            }
        } catch (error) {
            showToast("error", "Failed to fetch addresses");
        } finally {
            setLoading(false);
        }
    };

    return { addresses, loading, fetchAddresses, setLoading };
};

export default useFetchAddresses;
