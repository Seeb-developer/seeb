import React, { useState, useRef, useEffect, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Image,
    ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import dayjs from 'dayjs';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Feather';
import Modal from 'react-native-modal';
import { getFirestore, collection, doc, addDoc, onSnapshot, query, orderBy, writeBatch, setDoc } from 'firebase/firestore';
import { auth } from '../../../firebaseConfig';
import { serverTimestamp } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '../../utils/api';
import NavBar from '../../component/header/NavBar';
import { API_URL } from "@env";
import { Top } from '../../utils/constent';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../../hooks/context/UserContext';

const ChatTicket = ({ route }) => {
    const navigation = useNavigation();

    const [ticket, setTicket] = useState(null);
    const [messages, setMessages] = useState();
    const [input, setInput] = useState('');
    const [showActions, setShowActions] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [ticketId, setTicketId] = useState(null)

    const { userId } = useContext(UserContext);

    const flatListRef = useRef();

    const id = route?.params?.ticketId || ""; // fallback if no param passed


    useEffect(() => {
        const fetchTicket = async () => {
            try {
                const res = await apiRequest('GET', `tickets/ticket/${id}`);
                // console.log(res.data.ticket)
                const { ticket } = res.data;
                setTicket(ticket);
                setTicketId(ticket?.ticket_uid)
            } catch (err) {
                console.error('❌ Failed to load ticket:', err);
            }
        };

        fetchTicket();
    }, [id]);


    const openCamera = async () => {
        const options = {
            mediaType: 'photo',
            maxWidth: 800,
            maxHeight: 800,
            quality: 0.8,
        };
        setTimeout(async () => {
            launchCamera(options, (response) => {
                if (response.didCancel) {
                    console.log('User cancelled camera');
                } else if (response.errorCode) {
                    console.error('Camera error: ', response.errorMessage);
                } else {
                    const uri = response.assets?.[0]?.uri;
                    if (uri) setSelectedImage(uri);
                }
                setShowActions(false);
            });

        }, 400);
    };

    const openGallery = async () => {
        const options = {
            mediaType: 'photo',
            maxWidth: 800,
            maxHeight: 800,
            quality: 0.8,
        };

        launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.errorCode) {
                console.error('Gallery error: ', response.errorMessage);
            } else {
                const uri = response.assets?.[0]?.uri;
                if (uri) setSelectedImage(uri);
            }
            setShowActions(false);
        });
    };


    const uploadImageToBackend = (uri, onProgress = () => { }) =>
        new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.open('POST', `${API_URL}tickets/upload-image`);

            xhr.onload = () => {
                if (xhr.status === 200 || xhr.status === 201) {
                    try {
                        const res = JSON.parse(xhr.responseText);
                        // console.log('✅ Upload success:', res);
                        resolve(res?.file_path || null);
                    } catch (e) {
                        reject(new Error('Invalid JSON response from server'));
                    }
                } else {
                    reject(new Error(`Upload failed with status ${xhr.status}`));
                }
            };

            xhr.onerror = () => reject(new Error('Upload failed due to network error'));

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const progress = Math.round((event.loaded / event.total) * 100);
                    onProgress(progress); // Use this in UI
                }
            };

            const formData = new FormData();
            formData.append('file', {
                uri: Platform.OS === 'ios' && !uri.startsWith('file://') ? `file://${uri}` : uri,
                name: 'chat-image.jpg',
                type: 'image/jpeg',
            });

            xhr.setRequestHeader('Accept', 'application/json');
            xhr.send(formData);
        });



    const addMessageToFirestore = async () => {

        const db = getFirestore();
        const user = auth.currentUser;

        if (!input.trim() && !selectedImage) return;

        try {
            setUploading(true);
            let imageUrl = null;

            if (selectedImage) {
                imageUrl = await uploadImageToBackend(selectedImage);
            }

            const messageData = {
                user_id: user.uid,
                ticket_id: id,
                sender_id: userId || null, // Replace with actual customer_id if stored
                sender_type: 'customer',
                message: input,
                image: imageUrl,
                timestamp: serverTimestamp(),
                is_read_by_admin: false,
                is_read_by_user: true,
            };

            await addDoc(collection(db, 'tickets', ticketId, 'messages'), messageData);

            // 2. Add message to Backend
            const backendPayload = {
                ticket_id: id,
                sender_id: userId,
                sender_type: 'customer',
                message: input,
                file: imageUrl, // if imageUrl is from backend already, this will be valid
            };

            const res = await apiRequest('POST', 'tickets/add-message', backendPayload);
            console.log("tickect save in data base", res)

            setSelectedImage(null);
            setInput('');
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        } catch (err) {
            console.error('❌ Image upload/send failed:', err);
        } finally {
            setUploading(false);
        }
    };

    const unreadMessageIdsRef = useRef([]);

    useEffect(() => {
        if (!ticketId) return; // 🛑 Do nothing until ticketId is ready

        const db = getFirestore();
        const user = auth.currentUser;

        const ticketRef = doc(db, 'tickets', ticketId);
        const messagesRef = collection(ticketRef, 'messages');
        const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            const newMessages = snapshot.docs.map((docSnap) => {
                const data = docSnap.data();

                if (data.sender_type === 'admin' && !data.is_read_by_user) {
                    unreadMessageIdsRef.current.push(docSnap.id);
                }
                console.log('ticketId', ticketId, 'unreadMessageIdsRef', unreadMessageIdsRef.current);
                return {
                    id: docSnap.id,
                    ...data,
                    isNew: data.sender_type === 'admin' && !data.is_read_by_user,
                };
            });

            setMessages(newMessages);
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
        });

        return () => unsubscribe();
    }, [ticketId]);


    // 1. Set ticketId after fetching from API
    useEffect(() => {
        const fetchTicket = async () => {
            try {
                const res = await apiRequest('GET', `tickets/ticket/${id}`);
                const { ticket } = res.data;
                setTicket(ticket);
                setTicketId(ticket?.ticket_uid); // ✅ Firestore ticket UID
            } catch (err) {
                console.error('❌ Failed to load ticket:', err);
            }
        };

        fetchTicket();
    }, [id]);

    // 2. Add beforeRemove AFTER ticketId is available
    useEffect(() => {
        if (!ticketId) return; // ✅ wait until ticketId is set

        const unsubscribe = navigation.addListener('beforeRemove', async () => {
            const db = getFirestore();
            const batch = writeBatch(db);

            try {
                if (unreadMessageIdsRef.current.length === 0) {
                    console.warn('❌ No unread messages to mark as read');
                    return;
                }

                unreadMessageIdsRef.current.forEach((msgId) => {
                    const msgRef = doc(db, 'tickets', ticketId, 'messages', msgId);
                    batch.update(msgRef, { is_read_by_user: true });
                });

                await batch.commit();

                await apiRequest('POST', 'tickets/mark-as-read', {
                    ticket_id: id, // Backend ID
                    viewer_type: 'customer',
                });

                console.log('✅ Marked unread messages as read');
                unreadMessageIdsRef.current = [];

            } catch (err) {
                console.error('🔥 Failed to mark messages as read:', err);
            }
        });

        return unsubscribe;
    }, [navigation, ticketId]); // ✅ track ticketId



    const updateTypingStatus = async (isTyping) => {

        const db = getFirestore();

        if (!userId) {
            console.warn('❌ No customer ID found');
            return;
        }

        try {
            const typingRef = doc(db, 'tickets', ticketId, 'typing_status', 'customer');
            await setDoc(typingRef, {
                typing: isTyping,
                updated_at: serverTimestamp(),
            });
            console.log('✅ Typing status updated');
        } catch (err) {
            console.error('🔥 Failed to update typing status:', err);
        }
    };



    const [adminTyping, setAdminTyping] = useState(false);

    useEffect(() => {
        if (!ticketId) return;
        const db = getFirestore();
        const typingRef = doc(db, 'tickets', ticketId, 'typing_status', 'admin');

        const unsubscribe = onSnapshot(typingRef, (docSnap) => {
            if (docSnap.exists()) {
                setAdminTyping(docSnap.data().typing);
            }
        });

        return unsubscribe;
    }, [ticketId]);

    const typingTimeoutRef = useRef(null);
    const isTypingRef = useRef(false); // 👈 tracks if typing is already true

    const displayMessages = adminTyping
        ? [...(messages || []), {
            id: 'typing',
            sender_type: 'admin',
            message: 'typing...',
            timestamp: new Date(),
            is_typing: true,
        }]
        : messages || [];


    const renderMessage = ({ item }) => {
        const isUser = item.sender_type === 'customer';
        const bubbleStyle = isUser
            ? styles.userBubble
            : [styles.supportBubble, item.isNew && styles.newAdminBubble];

        const isTypingMessage = item.is_typing;

        return (
            <View style={[styles.messageBubble, bubbleStyle]}>
                {isTypingMessage ? (
                    <Text style={[styles.messageText, { fontStyle: 'italic', color: '#999' }]}>
                        typing....
                    </Text>
                ) : (
                    <>
                        {item.image && (
                            <Image
                                source={{ uri: API_URL + item.image }}
                                style={{ width: 180, height: 180, borderRadius: 8, marginBottom: 6 }}
                                resizeMode='contain'
                            />
                        )}
                        {item.message && (
                            <Text style={styles.messageText}>{item.message}</Text>
                        )}
                        <Text style={styles.messageTime}>
                            {dayjs(item.timestamp?.toDate?.() || item.timestamp).format('DD MMM YYYY, hh:mm A')}
                        </Text>
                    </>
                )}
            </View>
        );
    };


    if (!ticket) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#FF9800" />
                <Text style={{ padding: 20, color: '#555' }}>Loading ticket details...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        // keyboardVerticalOffset={50}
        >
            <View style={styles.container}>
                <NavBar title={`Ticket #${ticket?.ticket_uid}`} press={() => navigation.goBack()} />

                <View style={styles.ticketDetails}>
                    <Text style={styles.subject}>{ticket?.subject}</Text>
                    <Text style={styles.meta}>Category: {ticket?.category}</Text>
                    <Text style={styles.meta}>Status: {ticket?.status?.toUpperCase()}</Text>
                    <Text style={styles.meta}>
                        Created: {dayjs(ticket?.created_at).format('D MMM YYYY, hh:mm A')}
                    </Text>

                </View>
                <FlatList
                    ref={flatListRef}
                    data={displayMessages}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.messageList}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />


                {/* <View style={{ position: 'relative' }}>
                    {showActions && (
                        <View style={styles.floatingMenu}>
                            <TouchableOpacity style={styles.menuItem} onPress={openCamera}>
                                <Ionicons name="camera-outline" size={18} color="#FF9800" />
                                <Text style={styles.menuLabel}>Camera</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.menuItem} onPress={openGallery}>
                                <Ionicons name="image-outline" size={18} color="#FF9800" />
                                <Text style={styles.menuLabel}>Gallery</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.menuItem} onPress={openDocument}>
                                <Ionicons name="document-outline" size={18} color="#FF9800" />
                                <Text style={styles.menuLabel}>Document</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View> */}
                {selectedImage && (
                    <View style={styles.previewBubble}>
                        <Image
                            source={{ uri: selectedImage }}
                            style={styles.previewImage}
                            resizeMode="cover"
                        />

                        {uploading && (
                            <View style={styles.uploadOverlay}>
                                <View style={styles.progressContainer}>
                                    <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
                                </View>
                                <Text style={styles.progressText}>{uploadProgress}%</Text>
                            </View>
                        )}

                        {!uploading && (
                            <TouchableOpacity onPress={() => setSelectedImage(null)} style={styles.removePreviewBtn}>
                                <Ionicons name="close" size={18} color="#fff" />
                            </TouchableOpacity>
                        )}
                    </View>
                )}
                <View style={styles.inputRow}>
                    <TouchableOpacity onPress={() => setShowActions(!showActions)} style={styles.attachmentButton}>
                        <Ionicons name="attach" size={22} color="#555" />
                    </TouchableOpacity>

                    <TextInput
                        style={styles.input}
                        value={input}
                        onChangeText={(text) => {
                            setInput(text);

                            // Start typing only once
                            if (!isTypingRef.current && text.length > 0) {
                                updateTypingStatus(true);
                                isTypingRef.current = true;
                            }

                            // Clear previous timeout
                            if (typingTimeoutRef.current) {
                                clearTimeout(typingTimeoutRef.current);
                            }

                            // Stop typing after 2s of inactivity
                            typingTimeoutRef.current = setTimeout(() => {
                                updateTypingStatus(false);
                                isTypingRef.current = false;
                            }, 2000);
                        }}
                        placeholder="Type a message..."
                        placeholderTextColor="#999"
                        onFocus={() => {
                            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 300);
                        }}
                    />

                    <TouchableOpacity onPress={addMessageToFirestore} style={styles.sendButton}>
                        <Ionicons name="send" size={20} color="#fff" />
                    </TouchableOpacity>
                    <Modal
                        isVisible={showActions}
                        onBackdropPress={() => setShowActions(!showActions)}
                        style={{ justifyContent: 'flex-end', margin: 0 }}
                    >
                        <View style={styles.bottomSheet}>
                            <View style={styles.sheetHeader}>
                                <Text style={styles.sheetTitle}>Upload Document</Text>
                                <TouchableOpacity onPress={() => setShowActions(!showActions)}>
                                    <Text style={styles.cancelText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.optionRow}>
                                <TouchableOpacity style={styles.optionBox} onPress={() => {
                                    setShowActions(!showActions)
                                    openCamera()
                                }}>
                                    <Icon name="camera" size={24} color="#2F6DFB" />
                                    <Text style={styles.optionLabel}>Camera</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.optionBox} onPress={openGallery}>
                                    <Icon name="image" size={24} color="#2F6DFB" />
                                    <Text style={styles.optionLabel}>Gallery</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', paddingTop: Top },
    ticketDetails: {
        padding: 16,
        backgroundColor: '#f6f6f6',
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    subject: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    meta: { fontSize: 13, color: '#666' },
    messageList: { padding: 16, flexGrow: 1 },
    messageBubble: {
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
        maxWidth: '75%',
    },
    userBubble: {
        backgroundColor: '#e1f5fe',
        alignSelf: 'flex-end',
    },
    supportBubble: {
        backgroundColor: '#f1f1f1',
        alignSelf: 'flex-start',
    },
    messageText: { fontSize: 14, color: '#333' },
    messageTime: {
        fontSize: 11,
        color: '#888',
        marginTop: 4,
        textAlign: 'right',
    },
    inputRow: {
        flexDirection: 'row',
        padding: 12,
        borderTopWidth: 1,
        borderColor: '#eee',
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        height: 44,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 25,
        fontSize: 14,
        backgroundColor: '#fafafa',
    },
    sendButton: {
        marginLeft: 10,
        backgroundColor: '#FF9800',
        borderRadius: 25,
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    attachmentButton: {
        paddingHorizontal: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    floatingMenu: {
        position: 'absolute',
        bottom: 3, // Above the input bar
        left: 10,
        // backgroundColor: '#fff',
        paddingVertical: 8,
        // paddingHorizontal: 10,
        borderRadius: 8,
        zIndex: 999,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },

    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        backgroundColor: '#fff',
        marginBottom: 3,
        paddingHorizontal: 10,
        borderRadius: 10
    },

    menuLabel: {
        color: '#000',
        fontSize: 14,
        marginLeft: 8,
    },
    bottomSheet: {
        backgroundColor: '#fff',
        padding: 20,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },

    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },

    sheetTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#222',
    },

    cancelText: {
        fontSize: 14,
        color: '#F00',
        fontWeight: '500',
    },

    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20
    },
    optionBox: {
        alignItems: 'center',
        padding: 14,
        borderWidth: 1,
        borderColor: '#DADADA',
        borderRadius: 12,
        width: '45%',
        backgroundColor: '#F9F9F9',
    },

    optionLabel: {
        marginTop: 6,
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    previewBubble: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 12,
        marginBottom: 6,
        padding: 6,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        alignSelf: 'flex-start',
        maxWidth: '70%',
        position: 'relative',
    },

    previewImage: {
        width: 70,
        height: 70,
        borderRadius: 6,
    },

    removePreviewBtn: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#ff4d4d',
        borderRadius: 12,
        padding: 2,
    },
    uploadOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },

    progressContainer: {
        width: '80%',
        height: 6,
        backgroundColor: '#ccc',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 6,
    },

    progressBar: {
        height: 6,
        backgroundColor: '#FF9800',
    },

    progressText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
    newAdminBubble: {
        borderColor: '#FF9800',
        borderWidth: 1.5,
    },


});

export default ChatTicket;
