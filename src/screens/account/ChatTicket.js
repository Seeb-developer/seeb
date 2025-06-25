import React, { useContext, useEffect, useState } from "react";
import {
    View, Text, TextInput, TouchableOpacity, FlatList,
    StyleSheet, KeyboardAvoidingView, Platform,
    TouchableWithoutFeedback, Keyboard
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

import {
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp
} from "firebase/firestore";
import { db } from "../../../ firebase";
import { UserContext } from "../../hooks/context/UserContext";
import { apiRequest } from "../../utils/api";
import { SafeAreaView } from "react-native-safe-area-context";

const ChatTicket = ({ navigation, route }) => {
    const { data } = route.params;
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const { userId, username } = useContext(UserContext)

    // const userId = "user_123"; // 🔁 Replace with logged-in user's ID

    useEffect(() => {
        const q = query(
            collection(db, "tickets", data.ticket_uid, "messages"),
            orderBy("createdAt", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            if (msgs.length == 0) {
                // console.log('No snapshots')
                setMessage(data.subject);
                sendMessage();
            }
            const processedMessages = formatMessages(msgs);
            setMessages(processedMessages);
            // setMessages(msgs);
        });

        return () => unsubscribe();
    }, []);

    const formatMessages = (messages) => {
        return messages.map((msg) => {
            const timestamp = msg.createdAt?.toDate?.();
            const timeString = timestamp
                ? `${timestamp.toLocaleDateString()} ${timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : '';
            return { ...msg, formattedTime: timeString };
        });
    };

    const sendMessage = async () => {
        if (message.trim() === "") return;

        try {
            const body = {
                message: message,
                ticket_id: data.id,
                user_id: userId,
                sender_id: '',
                created_by: username,
            };
            console.log(body);

            const response = await apiRequest("POST", "tickets/add-message", body);
            // console.log("add-message",response);
            // if (response.status === 201) {
            //     console.log("Message sent:", response.data);
            //     // return response.data;
            // } else {
            //     console.error("Failed to send message:", response.message);
            //     // return null;
            // }
        } catch (error) {
            console.error("Error sending message:", error.message);
            // return null;
        }

        try {
            await addDoc(collection(db, "tickets", data.ticket_uid, "messages"), {
                text: message,
                user_id: userId,
                sender_id: '',
                created_by: username,
                createdAt: serverTimestamp()
            });
            setMessage("");
        } catch (err) {
            console.error("Error sending message:", err);
        }
    };

    const renderItem = ({ item }) => {
        const isUser = item.user_id === userId;
        const timestamp = item.createdAt?.toDate?.();
        const timeString = timestamp
            ? `${timestamp.toLocaleDateString()} ${timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : '';

        return (
            <View
                style={[
                    styles.messageBubble,
                    isUser
                        ? { alignSelf: "flex-end", backgroundColor: "#007BFF" }
                        : { alignSelf: "flex-start", backgroundColor: "#ccc" }
                ]}
            >
                <Text style={[styles.usernameText, { color: isUser ? "#fff" : "#333", }]}>{isUser ? "You" : item.created_by || "User"}</Text>
                <Text style={[styles.messageText, { color: isUser ? "#fff" : "#333", }]}>{item.text}</Text>
                <Text style={styles.timeText}>{item.formattedTime}</Text>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <SafeAreaView style={{flex:1}}> 
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={[styles.innerContainer, { marginBottom: Platform.OS === 'ios' ? 0 : 30 }]}>
                        {/* ✅ Navbar */}
                        <View style={styles.navbar}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                                <Icon name="arrow-back" size={24} color="#333" />
                            </TouchableOpacity>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.ticketIdText}>{data.ticket_uid}</Text>
                                {/* <Text style={styles.subjectText}>{data.subject}</Text> */}
                            </View>
                        </View>


                        {/* ✅ Chat Area */}
                        <FlatList
                            data={messages}
                            keyExtractor={(item) => item.id}
                            renderItem={renderItem}
                            contentContainerStyle={styles.chatContainer}
                        />

                        {/* ✅ Chat Input */}
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Type your issue here..."
                                placeholderTextColor="#888"
                                value={message}
                                onChangeText={setMessage}
                                multiline
                            />
                            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                                <Icon name="send" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
};

export default ChatTicket;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f6f7fb" },
    innerContainer: { flex: 1 },

    navbar: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        backgroundColor: "#fff",
        elevation: 3
    },

    backButton: { marginRight: 10 },

    headerText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        flex: 1,
        textAlign: "center"
    },

    chatContainer: {
        flexGrow: 1,
        padding: 15,
        justifyContent: "flex-end"
    },

    messageBubble: {
        backgroundColor: "#007BFF",
        padding: 12,
        borderRadius: 12,
        marginVertical: 5,
        alignSelf: "flex-end",
        maxWidth: "80%"
    },

    messageText: {
        color: "#fff",
        fontSize: 16
    },

    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 10,
        borderTopWidth: 1,
        borderColor: "#ddd",
        margin: 10,
        borderRadius: 10
    },

    input: {
        flex: 1,
        backgroundColor: "#f1f1f1",
        padding: 12,
        borderRadius: 25,
        fontSize: 16,
        color: "#333"
    },

    sendButton: {
        backgroundColor: "#007BFF",
        padding: 12,
        borderRadius: 50,
        marginLeft: 10
    },
    ticketIdText: {
        fontSize: 14,
        color: "#007BFF",
        fontWeight: "bold",
        textAlign: "center"
    },
    subjectText: {
        fontSize: 16,
        color: "#333",
        fontWeight: "600",
        textAlign: "center"
    },
    usernameText: {
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 4,
        fontSize: 12
    },

    timeText: {
        fontSize: 10,
        color: "#eee",
        marginTop: 6,
        textAlign: "right"
    },
});
