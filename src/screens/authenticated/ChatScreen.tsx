import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import socketService from '../../services/socketService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Send, CheckCheck, User, MessageSquare } from 'lucide-react-native';
import { ChatMessage } from '../../types/integration';

const ChatScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const { orderId, recipientName, recipientId } = route.params || {};

    const { userdata } = useSelector((state: RootState) => state.auth) as { userdata: { id: number | string; username?: string; role?: string } };
    const { isConnected } = useSelector((state: RootState) => state.socket);

    const myUserId = Number(userdata?.id) || 1;
    const role = userdata?.role || 'customer';
    const isCustomer = role === 'customer';
    const accentColor = isCustomer ? '#059669' : '#d97706';
    const accentLight = isCustomer ? '#ecfdf5' : '#fffbeb';

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [isRecipientTyping, setIsRecipientTyping] = useState(false);
    const [loading, setLoading] = useState(true);

    const typingTimeoutRef = useRef<any>(null);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        if (!orderId) return;

        // 1. Join Chat Room
        socketService.emit('joinChat', { orderId: Number(orderId), userId: myUserId });

        // 2. Request Chat History
        socketService.emit('getChatHistory', { orderId: Number(orderId), userId: myUserId });

        // 3. Mark messages read
        socketService.emit('markRead', { orderId: Number(orderId), readerId: myUserId });

        // Event listeners
        const handleChatJoined = (data: any) => {
            setLoading(false);
        };

        const handleChatHistory = (data: any) => {
            setLoading(false);
            if (data?.messages && Array.isArray(data.messages)) {
                setMessages(data.messages);
            }
        };

        const handleNewMessage = (msg: ChatMessage) => {
            if (msg.orderId === Number(orderId) || (msg as any).order_id === Number(orderId)) {
                setMessages(prev => {
                    if (prev.some(m => m.id === msg.id)) return prev;
                    return [...prev, msg];
                });
                socketService.emit('markRead', { orderId: Number(orderId), readerId: myUserId });
            }
        };

        const handleUserTyping = (data: any) => {
            if (data.userId !== myUserId) {
                setIsRecipientTyping(true);
            }
        };

        const handleUserStoppedTyping = (data: any) => {
            if (data.userId !== myUserId) {
                setIsRecipientTyping(false);
            }
        };

        const handleMessagesMarkedRead = (data: any) => {
            if (data.readerId !== myUserId) {
                setMessages(prev => prev.map(m => ({ ...m, is_read: true })));
            }
        };

        socketService.on('chatJoined', handleChatJoined);
        socketService.on('chatHistory', handleChatHistory);
        socketService.on('newMessage', handleNewMessage);
        socketService.on('userTyping', handleUserTyping);
        socketService.on('userStoppedTyping', handleUserStoppedTyping);
        socketService.on('messagesMarkedRead', handleMessagesMarkedRead);

        return () => {
            socketService.off('chatJoined', handleChatJoined);
            socketService.off('chatHistory', handleChatHistory);
            socketService.off('newMessage', handleNewMessage);
            socketService.off('userTyping', handleUserTyping);
            socketService.off('userStoppedTyping', handleUserStoppedTyping);
            socketService.off('messagesMarkedRead', handleMessagesMarkedRead);
        };
    }, [orderId, myUserId]);

    const handleInputChange = (text: string) => {
        setInputText(text);

        if (!isConnected) return;

        socketService.emit('typing', { orderId: Number(orderId), userId: myUserId });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socketService.emit('stopTyping', { orderId: Number(orderId), userId: myUserId });
        }, 1500);
    };

    const handleSend = () => {
        if (!inputText.trim() || !orderId) return;

        const payload = {
            orderId: Number(orderId),
            senderId: myUserId,
            receiverId: Number(recipientId) || 0,
            message: inputText.trim(),
        };

        // Optimistic local add
        const tempMsg: ChatMessage = {
            id: Date.now(),
            orderId: Number(orderId),
            senderId: myUserId,
            senderName: userdata?.username || 'Me',
            receiverId: Number(recipientId) || 0,
            message: inputText.trim(),
            is_read: false,
            created_at: new Date().toISOString(),
        };

        setMessages(prev => [...prev, tempMsg]);
        setInputText('');

        socketService.emit('sendMessage', payload);
        socketService.emit('stopTyping', { orderId: Number(orderId), userId: myUserId });
    };

    const renderMessageItem = ({ item }: { item: ChatMessage }) => {
        const isMine = item.senderId === myUserId || (item as any).sender_id === myUserId;
        const formattedTime = item.created_at
            ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '';

        return (
            <View style={[styles.msgContainer, isMine ? styles.myMsgContainer : styles.theirMsgContainer]}>
                <View
                    style={[
                        styles.msgBubble,
                        isMine
                            ? { backgroundColor: accentColor, borderBottomRightRadius: 4 }
                            : { backgroundColor: '#ffffff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#f1f5f9' },
                    ]}
                >
                    <Text style={[styles.msgText, isMine ? { color: '#ffffff' } : { color: '#0f172a' }]}>
                        {item.message}
                    </Text>
                    <View style={styles.msgFooter}>
                        <Text style={[styles.msgTime, isMine ? { color: 'rgba(255,255,255,0.7)' } : { color: '#94a3b8' }]}>
                            {formattedTime}
                        </Text>
                        {isMine && (
                            <CheckCheck
                                size={14}
                                color={item.is_read ? '#6ee7b7' : 'rgba(255,255,255,0.7)'}
                                style={{ marginLeft: 4 }}
                            />
                        )}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color="#0f172a" strokeWidth={2.5} />
                </TouchableOpacity>

                <View style={styles.headerInfo}>
                    <View style={[styles.avatar, { backgroundColor: accentLight }]}>
                        <User size={20} color={accentColor} strokeWidth={2.5} />
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>{recipientName || 'Order Chat'}</Text>
                        <Text style={styles.headerSubtitle}>
                            {isRecipientTyping ? 'typing...' : `Order #${orderId}`}
                        </Text>
                    </View>
                </View>

                <View style={styles.headerBadge}>
                    <MessageSquare size={16} color={accentColor} />
                </View>
            </View>

            {/* Message Body */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                {loading ? (
                    <View style={styles.centerLoading}>
                        <ActivityIndicator size="large" color={accentColor} />
                        <Text style={styles.loadingText}>Chat room load ho raha hai...</Text>
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                        renderItem={renderMessageItem}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyTitle}>Koi paighām nahi</Text>
                                <Text style={styles.emptySub}>Aap yahan order ki tafseel ke silsilay mein baat kar saktay hain.</Text>
                            </View>
                        }
                    />
                )}

                {/* Input Bar */}
                <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
                    <TextInput
                        value={inputText}
                        onChangeText={handleInputChange}
                        placeholder="Paighām likhein..."
                        placeholderTextColor="#cbd5e1"
                        style={styles.textInput}
                        multiline
                    />
                    <TouchableOpacity
                        onPress={handleSend}
                        disabled={!inputText.trim()}
                        style={[
                            styles.sendBtn,
                            inputText.trim() ? { backgroundColor: accentColor } : { backgroundColor: '#e2e8f0' },
                        ]}
                    >
                        <Send size={18} color={inputText.trim() ? '#ffffff' : '#94a3b8'} strokeWidth={2.5} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#f8fafc' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 12,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        elevation: 2,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#f8fafc',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    headerTitle: { fontSize: 16, fontWeight: '900', color: '#0f172a' },
    headerSubtitle: { fontSize: 12, fontWeight: '700', color: '#64748b' },
    headerBadge: { padding: 8, backgroundColor: '#f8fafc', borderRadius: 12 },
    centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 8, fontSize: 12, fontWeight: '800', color: '#64748b' },
    msgContainer: { marginVertical: 4, width: '100%', flexDirection: 'row' },
    myMsgContainer: { justifyContent: 'flex-end' },
    theirMsgContainer: { justifyContent: 'flex-start' },
    msgBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    msgText: { fontSize: 15, fontWeight: '700', lineHeight: 20 },
    msgFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4 },
    msgTime: { fontSize: 10, fontWeight: '700' },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
    emptyTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a', marginBottom: 4 },
    emptySub: { fontSize: 12, fontWeight: '600', color: '#64748b', textAlign: 'center', paddingHorizontal: 32 },
    inputBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        paddingHorizontal: 16,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        gap: 10,
    },
    textInput: {
        flex: 1,
        backgroundColor: '#f8fafc',
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: '#f1f5f9',
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 15,
        fontWeight: '600',
        color: '#0f172a',
        maxHeight: 100,
    },
    sendBtn: {
        width: 46,
        height: 46,
        borderRadius: 23,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default ChatScreen;
