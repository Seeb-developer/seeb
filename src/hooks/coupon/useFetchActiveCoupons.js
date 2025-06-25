import { useEffect, useState } from 'react';
import { apiRequest } from '../../utils/api';
import { showToast } from '../../utils/constent';

const useFetchActiveCoupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActiveCoupons();
    }, []);

    const fetchActiveCoupons = async () => {
        try {
            setLoading(true);
            const response = await apiRequest("GET", "/coupon/active");

            if (response.status === 200 && response.data.length > 0) {
                setCoupons(response.data);
            } else {
                // showToast("info", "No active coupons available");
                setCoupons([]);
            }
        } catch (error) {
            // showToast("error", "Failed to fetch active coupons");
        } finally {
            setLoading(false);
        }
    };

    return { coupons, loading, fetchActiveCoupons };
};

export default useFetchActiveCoupons;
