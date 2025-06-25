import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const AddonGroup = ({ groupedAddons, selectedAddons, setSelectedAddons, totalSqFt }) => {
    return (
        <View>
            {Object.entries(groupedAddons).map(([groupName, addons]) => (
                <View key={groupName} style={styles.groupContainer}>
                    <Text style={styles.groupTitle}>{groupName}</Text>

                    {addons.map(addon => {
                        const isRequired = addon.is_required === "1";
                        const isUnit = addon.price_type === "unit";
                        const addonId = addon.id;
                        const selectedQty = selectedAddons[addonId]?.qty
                            || (isUnit
                                ? 1
                                : Math.ceil((parseFloat(addon.qty || 0) / 100) * totalSqFt)
                            );
                        const totalPrice = parseFloat(addon.price) * selectedQty;
                        // console.log("Addon:", addon.qty, "Selected Qty:", selectedQty, "Total Price:", totalPrice);
                        return (
                            <View key={addonId} style={styles.addonCard}>
                                <View style={styles.addonHeader}>
                                    <TouchableOpacity
                                        disabled={isRequired}
                                        onPress={() => {
                                            setSelectedAddons(prev => {
                                                const updated = { ...prev };
                                                if (updated[addonId]?.selected) {
                                                    updated[addonId] = { ...updated[addonId], selected: false };
                                                } else {
                                                    updated[addonId] = {
                                                        ...addon,
                                                        ...updated[addonId],
                                                        selected: true,
                                                        qty: selectedQty,
                                                    };
                                                }

                                                return updated;
                                            });
                                        }}
                                    >
                                        <Icon
                                            name={selectedAddons[addonId]?.selected ? "check-box" : "check-box-outline-blank"}
                                            size={22}
                                            color={selectedAddons[addonId]?.selected ? "#007aff" : "#ccc"}
                                        />
                                    </TouchableOpacity>

                                    <View style={{ flex: 1, marginLeft: 10 }}>
                                        <Text style={styles.addonTitle}>
                                            {addon.name} <Text style={styles.addonPrice}>₹{totalPrice.toFixed(2)}</Text>
                                        </Text>
                                        {addon.description && <Text style={styles.addonDesc}>{addon.description}</Text>}

                                        <Text style={styles.addonMeta}>
                                            {isUnit ? "Qty" : "sqft"}: {selectedQty} | ₹{parseFloat(addon.price).toFixed(2)} per {isUnit ? "unit" : "sqft"}
                                        </Text>

                                        {!isRequired && isUnit && selectedAddons[addonId] && (
                                            <View style={styles.qtyRow}>
                                                <TouchableOpacity onPress={() => {
                                                    setSelectedAddons(prev => {
                                                        const qty = Math.max(1, prev[addonId].qty - 1);
                                                        return {
                                                            ...prev,
                                                            [addonId]: {
                                                                ...prev[addonId],
                                                                qty,
                                                                selected: true,
                                                            },
                                                        };
                                                    });
                                                }}>
                                                    <Text style={styles.qtyButton}>-</Text>
                                                </TouchableOpacity>

                                                <Text style={styles.qtyValue}>{selectedQty}</Text>

                                                <TouchableOpacity onPress={() => {
                                                    setSelectedAddons(prev => {
                                                        const qty = prev[addonId].qty + 1;
                                                        return {
                                                            ...prev,
                                                            [addonId]: {
                                                                ...prev[addonId],
                                                                qty,
                                                                selected: true,
                                                            },
                                                        };
                                                    });
                                                }}>
                                                    <Text style={styles.qtyButton}>+</Text>
                                                </TouchableOpacity>

                                            </View>
                                        )}
                                    </View>
                                </View>
                            </View>
                        );
                    })}
                </View>
            ))}

        </View>
    );
};

export default AddonGroup;

const styles = StyleSheet.create({
    groupContainer: {
        marginBottom: 16,
        // paddingHorizontal: 10
    },
    groupTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#444',
        marginBottom: 6
    },
    addonCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        marginBottom: 8
    },
    addonHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start'
    },
    addonTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: '#222'
    },
    addonPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#007aff'
    },
    addonDesc: {
        fontSize: 13,
        color: '#666',
        marginTop: 4
    },
    addonMeta: {
        fontSize: 13,
        color: '#888',
        marginTop: 4
    },
    qtyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6
    },
    qtyButton: {
        fontSize: 18,
        width: 28,
        height: 28,
        borderRadius: 4,
        textAlign: 'center',
        lineHeight: 28,
        backgroundColor: '#eee',
        color: '#333',
        marginHorizontal: 6
    },
    qtyValue: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333'
    }
});

