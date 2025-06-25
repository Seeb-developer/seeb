import React, { useEffect, useState, useContext } from 'react';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    Image,
    TouchableOpacity,
    Alert,
    StyleSheet
} from 'react-native';
import { apiRequest } from '../../utils/api';
import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment'; // to format created_at dates
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../../hooks/context/UserContext';
import { API_URL } from '@env'; // Ensure you have your API URL set up
import { SafeAreaView } from 'react-native-safe-area-context';
import NavBar from '../../component/header/NavBar';

const SavedFloorPlans = () => {
    const { userId } = useContext(UserContext);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        fetchSavedPlans();
    }, []);

    const fetchSavedPlans = async () => {
        try {
            const res = await apiRequest('GET', `floor-plans/user-id/${userId}`);
            if (res.status === 200 && Array.isArray(res.data)) {
                setPlans(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch plans:', err);
        } finally {
            setLoading(false);
        }
    };

    const deletePlan = async (id) => {
        Alert.alert("Delete Plan", "Are you sure you want to delete this floor plan?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        const res = await apiRequest('DELETE', `floor-plans/${id}`);
                        if (res.status === 200) {
                            setPlans(prev => prev.filter(p => p.id !== id));
                        } else {
                            Alert.alert("Error", res.message || "Failed to delete.");
                        }
                    } catch (err) {
                        Alert.alert("Error", "Something went wrong while deleting.");
                    }
                },
            },
        ]);
    };

    const renderPlan = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('SavedFloorPlanDetails', { planData: item })}
        >
            <Image
                source={{ uri: API_URL + item.floorplan_image }}
                style={styles.image}
                resizeMode="cover"
            />
            <View style={{ flex: 1, paddingLeft: 12 }}>
                <Text style={styles.name}>{item.room_name}</Text>
                <Text style={styles.meta}>Size: {item.room_size}</Text>
                <Text style={styles.meta}>Colors: {item.primary_color}, {item.accent_color}</Text>
                <Text style={styles.date}>Date: {moment(item.created_at).format('MMM D, YYYY')}</Text>
            </View>
            <TouchableOpacity onPress={() => deletePlan(item.id)}>
                <Icon name="delete" size={22} color="#dc2626" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    if (loading) {
        return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <NavBar title="Saved Floor Plans" />
            <View style={{ flex: 1, padding: 16 }}>
                {/* <Text style={styles.heading}>Saved Floor Plans</Text> */}
                {plans.length === 0 ? (
                    <Text style={{ textAlign: 'center', marginTop: 30 }}>No saved plans yet.</Text>
                ) : (
                    <FlatList
                        data={plans}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderPlan}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    heading: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        alignItems: 'center',
    },
    image: {
        width: 90,
        height: 70,
        borderRadius: 8,
        backgroundColor: '#f1f1f1',
    },
    name: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#000',
    },
    meta: {
        fontSize: 13,
        color: '#555',
        marginTop: 2,
    },
    date: {
        fontSize: 12,
        color: '#000',
        marginTop: 4,
    },
});

export default SavedFloorPlans;
