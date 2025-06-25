import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    FlatList
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import moment from "moment"; // To handle dates
import DateTimePicker from "@react-native-community/datetimepicker"; // For custom date selection

const DateSlotModal = ({ visible, onClose, onSelectDate }) => {
    const [selectedDate, setSelectedDate] = useState(moment().add(1, "days").format("YYYY-MM-DD"));
    const [showCalendar, setShowCalendar] = useState(false);

    // Generate the next 4 dates dynamically (Starting from Tomorrow)
    const availableDates = [...Array(4)].map((_, i) =>
        moment().add(i + 1, "days").format("YYYY-MM-DD")
    );

    const handleDateChange = (event, date) => {
        setShowCalendar(false);
        if (date) {
            setSelectedDate(moment(date).format("YYYY-MM-DD"));
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
            <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
                    <Icon name="close" size={26} color="#FF5733" />
                </TouchableOpacity>
                <View style={styles.modalContainer}>
                    
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>📅 When are you planning to start ?</Text>
                    </View>

                    {/* Date Selection (Single Row) */}
                    <FlatList
                        data={availableDates}
                        keyExtractor={(item) => item}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.dateList}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.dateItem,
                                    selectedDate === item && styles.selectedDate
                                ]}
                                onPress={() => setSelectedDate(item)}
                            >
                                <Text
                                    style={[
                                        styles.dateText,
                                        selectedDate === item && styles.selectedDateText
                                    ]}
                                >
                                    {moment(item).format("ddd")}
                                </Text>
                                <Text
                                    style={[
                                        styles.dateText,
                                        selectedDate === item && styles.selectedDateText
                                    ]}
                                >
                                    {moment(item).format("MMM D")}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />

                    {/* Custom Date Picker */}
                    <TouchableOpacity
                        style={styles.calendarButton}
                        onPress={() => setShowCalendar(true)}
                    >
                        <Icon name="event" size={22} color="#007BFF" />
                        <Text style={styles.calendarText}>Pick a Date</Text>
                    </TouchableOpacity>

                    {showCalendar && (
                        <DateTimePicker
                            value={new Date()}
                            mode="date"
                            display="default"
                            minimumDate={new Date()}
                            onChange={handleDateChange}
                        />
                    )}

                    {/* Confirm Button */}
                    <TouchableOpacity
                        style={styles.confirmButton}
                        onPress={() => {
                            if (selectedDate) {
                                onSelectDate(selectedDate);
                                onClose();
                            }
                        }}
                    >
                        <Text style={styles.confirmButtonText}>Confirm Date</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    closeIcon: {
        bottom: 10,
        alignSelf: 'flex-end',
        right: 18,
        zIndex: 10,
        backgroundColor: '#fff',
        padding: 8,
        borderRadius: 20,
    },
    modalContainer: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        padding: 20,
        maxHeight: "60%",
        elevation: 10,
        paddingBottom: 70,
    },
    header: {
        // flexDirection: "row",
        // justifyContent: "space-between",
        alignItems: "center",
        marginVertical: 15,
        marginBottom: 25,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    dateList: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 15,
    },
    dateItem: {
        backgroundColor: "#f9f9f9",
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        marginHorizontal: 5,
        alignItems: "center",
    },
    dateText: {
        fontSize: 16,
        color: "#333",
    },
    selectedDate: {
        backgroundColor: "#007BFF",
    },
    selectedDateText: {
        color: "#fff",
    },
    calendarButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#007BFF",
        marginBottom: 15,
    },
    calendarText: {
        fontSize: 16,
        color: "#007BFF",
        marginLeft: 8,
    },
    confirmButton: {
        backgroundColor: "#FF5733",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
    },
});

export default DateSlotModal;
