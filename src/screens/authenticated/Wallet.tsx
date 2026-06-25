import { View, Text, ScrollView, TouchableOpacity, StatusBar, Image, Modal, TextInput, ActivityIndicator } from 'react-native'
import React, { useState, useCallback, useEffect } from 'react'
import Header from '../../components/Header'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { ArrowDownToLine, PlusCircle, ArrowUpRight, ArrowDownLeft, ChevronRight, Wallet as WalletIcon, X, Clock, AlertCircle } from 'lucide-react-native'
import EmptyPic from "../../assets/homeempty.png"
import { useSubmit } from "../../apiHooks/useSubmit"
import { useFetch } from "../../apiHooks/useFetch"
import { ALERT_TYPE, Toast } from 'react-native-alert-notification'
import { useFocusEffect } from '@react-navigation/native'

const Wallet: React.FC = () => {
    const { userdata } = useSelector((state: RootState) => state.auth) as { userdata: { role?: string } };
    const role = userdata?.role || 'customer';
    const isCustomer = role === 'customer';
    const primaryColorHex = isCustomer ? '#059669' : '#d97706';

    const [activeTab, setActiveTab] = useState<'Sab' | 'Aye' | 'Gaye'>('Sab');
    const tabs = ['Sab', 'Aye', 'Gaye'] as const;

    const { data, isLoading, error, refetch } = useFetch({
        endpoint: 'wallet/api/v1',
        isAuth: true,
    });
    const balance = data?.balance || 0;
    const transactions = data?.transactions || [];

    useEffect(() => {
        if (error) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: error.message || 'Wallet data nahi mil saka',
            });
        }
    }, [error]);

    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );

    const { mutateAsync: depositMutate, isPending: depositing } = useSubmit({
        method: 'POST',
        endpoint: 'wallet/api/v1/deposit',
        isAuth: true,
    });
    const { mutateAsync: withdrawMutate, isPending: withdrawing } = useSubmit({
        method: 'POST',
        endpoint: 'wallet/api/v1/withdraw',
        isAuth: true,
    });

    const [showAddModal, setShowAddModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState({ title: '', body: '' });

    const [amount, setAmount] = useState('');
    const [tid, setTid] = useState('');
    const [senderAccount, setSenderAccount] = useState('');

    const [withdrawBank, setWithdrawBank] = useState('');
    const [withdrawAccountNo, setWithdrawAccountNo] = useState('');
    const [withdrawAccountTitle, setWithdrawAccountTitle] = useState('');

    const handleAddSubmit = async () => {
        if (!amount || !tid || !senderAccount) return;
        try {
            await depositMutate({ amount: parseFloat(amount), senderAccount, tid });
            setShowAddModal(false);
            setSuccessMessage({
                title: 'Request Bhej Di Gayi',
                body: `Aapki Rs ${Number(amount).toLocaleString()} jama karne ki request admin ko bhej di gayi hai. Tasdeeq ke baad balance update ho jayega.`,
            });
            setAmount(''); setTid(''); setSenderAccount('');
            setShowSuccessModal(true);
            refetch();
        } catch (err: any) {
            Toast.show({ type: ALERT_TYPE.DANGER, title: 'Error', textBody: err.message || 'Deposit request fail ho gayi' });
        }
    };

    const handleWithdrawSubmit = async () => {
        if (!amount || !withdrawBank || !withdrawAccountNo || !withdrawAccountTitle) return;
        try {
            await withdrawMutate({ amount: parseFloat(amount), withdrawBank, withdrawAccountNo, withdrawAccountTitle });
            setShowWithdrawModal(false);
            setSuccessMessage({
                title: 'Withdraw Request Darj',
                body: `Aapki Rs ${Number(amount).toLocaleString()} nikalwane ki request darj ho gayi hai. 24 ghante mein aapke account mein bhej diye jayenge.`,
            });
            setAmount(''); setWithdrawBank(''); setWithdrawAccountNo(''); setWithdrawAccountTitle('');
            setShowSuccessModal(true);
            refetch();
        } catch (err: any) {
            Toast.show({ type: ALERT_TYPE.DANGER, title: 'Error', textBody: err.message || 'Withdraw request fail ho gayi' });
        }
    };

    const mappedTransactions = transactions.map((tx: any) => ({
        id: tx.id.toString(),
        title: tx.type === 'deposit' ? 'Jama Ki Request' : 'Nikalwane Ki Request',
        type: tx.type === 'deposit' ? 'in' : 'out',
        amount: Number(tx.amount).toLocaleString(),
        date: new Date(tx.created_at).toLocaleDateString('ur-PK', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        }),
        status: tx.status,
    }));

    const filteredTransactions = mappedTransactions.filter((tx: any) => {
        if (activeTab === 'Sab') return true;
        if (activeTab === 'Aye') return tx.type === 'in';
        if (activeTab === 'Gaye') return tx.type === 'out';
        return true;
    });

    return (
        <View className="flex-1 bg-[#f8fafc]">
            <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" translucent={false} />
            
            <View className="bg-[#f8fafc] z-20 pb-2">
                <Header />
                <View className="px-6 mt-2">
                    <Text className="text-gray-400 font-extrabold text-[10px] uppercase tracking-widest mb-1">
                        Maliyat ki Tafseel
                    </Text>
                    <Text className="text-gray-900 font-black text-3xl tracking-tight leading-none">
                        Mera Batwa
                    </Text>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120, paddingTop: 16 }}>
                <View className="px-5 mb-8">
                    <View 
                        style={{ backgroundColor: primaryColorHex }}
                        className="w-full rounded-[32px] p-6 shadow-lg shadow-black/10 relative overflow-hidden"
                    >
                        <View className="absolute -right-12 -top-12 w-40 h-40 bg-white/10 rounded-full" />
                        <View className="absolute right-12 -bottom-10 w-24 h-24 bg-black/10 rounded-full" />

                        <View className="flex-row justify-between items-start mb-8">
                            <View>
                                <Text className="text-white/80 font-bold text-xs uppercase tracking-widest mb-1.5">
                                    Mojooda Balance
                                </Text>
                                <View className="flex-row items-baseline mt-1">
                                    <Text className="text-white/90 font-bold text-xl mr-2">Rs</Text>
                                    <Text className="text-white font-black text-5xl tracking-tight">
                                        {balance.toLocaleString()}
                                    </Text>
                                </View>
                            </View>
                            <View className="bg-white/20 p-3.5 rounded-[20px] backdrop-blur-md">
                                <WalletIcon size={24} color="#ffffff" strokeWidth={2.5} />
                            </View>
                        </View>

                        <View className="flex-row gap-3">
                            <TouchableOpacity 
                                onPress={() => setShowAddModal(true)} activeOpacity={0.9}
                                className="flex-1 py-4 rounded-[20px] flex-row items-center justify-center bg-white shadow-sm"
                            >
                                <PlusCircle size={18} color={primaryColorHex} strokeWidth={2.5} />
                                <Text className="font-black text-sm ml-2" style={{ color: primaryColorHex }}>Jama Karein</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={() => setShowWithdrawModal(true)} activeOpacity={0.9}
                                className="flex-1 bg-black/20 py-4 rounded-[20px] flex-row items-center justify-center border border-white/20 backdrop-blur-md"
                            >
                                <ArrowDownToLine size={18} color="#ffffff" strokeWidth={2.5} />
                                <Text className="font-black text-sm text-white ml-2">Nikalwayen</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View className="px-5">
                    <View className="flex-row justify-between items-end mb-4 px-1">
                        <Text className="font-black text-gray-900 text-xl tracking-tight">Len Den ki Tafseel</Text>
                        <TouchableOpacity className="flex-row items-center bg-gray-200/60 px-3 py-1.5 rounded-full">
                            <Text className="font-extrabold text-[10px] text-gray-700 mr-1 uppercase tracking-wider">Filter</Text>
                            <ChevronRight size={14} color="#374151" strokeWidth={3} />
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row bg-gray-200/80 p-1.5 rounded-full border border-gray-100 mb-4">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab;
                            return (
                                <TouchableOpacity
                                    key={tab} onPress={() => setActiveTab(tab)} activeOpacity={0.8}
                                    className="flex-1 py-3 items-center rounded-full"
                                    style={isActive ? {
                                        backgroundColor: '#ffffff',
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.05,
                                        shadowRadius: 4,
                                        elevation: 2,
                                    } : { backgroundColor: 'transparent' }}
                                >
                                    <Text className="font-extrabold text-xs" style={{ color: isActive ? '#111827' : '#64748b' }}>
                                        {tab}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {isLoading ? (
                        <View className="items-center justify-center py-20">
                            <ActivityIndicator size="large" color={primaryColorHex} />
                        </View>
                    ) : filteredTransactions.length > 0 ? (
                        <View className="bg-white rounded-[32px] p-2 border border-gray-100 shadow-sm">
                            {filteredTransactions.map((tx: any, index: number) => {
                                const isIncome = tx.type === 'in';
                                const isPending = tx.status === 'pending';
                                return (
                                    <View 
                                        key={tx.id} 
                                        className={`flex-row items-center justify-between p-4 ${index !== filteredTransactions.length - 1 ? 'border-b border-gray-50' : ''}`}
                                    >
                                        <View className="flex-row items-center flex-1 pr-4">
                                            <View className={`p-3 rounded-[18px] mr-4 ${isPending ? 'bg-amber-50' : isIncome ? 'bg-emerald-50' : 'bg-red-50'}`}>
                                                {isPending ? <Clock size={20} color="#d97706" strokeWidth={2.5} /> :
                                                 isIncome ? <ArrowDownLeft size={20} color="#059669" strokeWidth={2.5} /> :
                                                 <ArrowUpRight size={20} color="#dc2626" strokeWidth={2.5} />}
                                            </View>
                                            <View>
                                                <Text className="font-black text-gray-900 text-sm mb-0.5">{tx.title}</Text>
                                                <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                    {tx.date} {isPending && '• PENDING'}
                                                </Text>
                                            </View>
                                        </View>
                                        <View className="items-end">
                                            <Text className={`font-black text-base ${isPending ? 'text-amber-600' : isIncome ? 'text-emerald-600' : 'text-gray-900'}`}>
                                                {isIncome ? '+' : '-'} Rs {tx.amount}
                                            </Text>
                                        </View>
                                    </View>
                                )
                            })}
                        </View>
                    ) : (
                        <View className="bg-white rounded-[28px] p-8 w-full items-center border border-gray-100 shadow-sm mt-2">
                            <View className="bg-gray-50 w-20 h-20 rounded-full items-center justify-center mb-4">
                                <Image source={EmptyPic} className="w-10 h-10 opacity-40" resizeMode="contain" />
                            </View>
                            <Text className="text-gray-900 text-lg font-black text-center mb-1">Koi len den nahi hua</Text>
                            <Text className="text-gray-500 text-xs text-center leading-relaxed font-medium px-4">
                                Aapki tamam amadani aur kharchay yahan dikhayi denge.
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Add Funds Modal – unchanged, but uses depositing */}
            <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
                <View className="flex-1 justify-end bg-black/60">
                    <View className="bg-white rounded-t-[40px] p-6 pb-10 shadow-2xl">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-2xl font-black text-gray-900">Jama Karein</Text>
                            <TouchableOpacity onPress={() => setShowAddModal(false)} className="bg-gray-100 p-2.5 rounded-full">
                                <X size={20} color="#374151" strokeWidth={2.5} />
                            </TouchableOpacity>
                        </View>

                        <View className="bg-blue-50 border border-blue-100 rounded-[20px] p-4 mb-6 flex-row items-start">
                            <AlertCircle size={20} color="#2563eb" className="mt-0.5 mr-3" />
                            <View className="flex-1">
                                <Text className="font-black text-blue-900 mb-1">Admin ke account mein bhejein:</Text>
                                <Text className="font-bold text-blue-800 text-xs leading-relaxed">Sadapay: 0331-8388805 (RaddiGo){"\n"}Paise bhej kar neechay TID darj karein.</Text>
                            </View>
                        </View>

                        <Text className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-2 ml-1">Raqam (PKR)</Text>
                        <TextInput
                            value={amount} onChangeText={setAmount} placeholder="Misaal: 1000"
                            placeholderTextColor="#cbd5e1" keyboardType="numeric"
                            className="bg-[#f8fafc] px-4 h-[56px] rounded-[20px] border-[2px] border-gray-100 font-black text-gray-900 text-lg mb-4 shadow-sm"
                        />

                        <Text className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-2 ml-1">Aapka Account Number</Text>
                        <TextInput
                            value={senderAccount} onChangeText={setSenderAccount} placeholder="Jis number se paise bheje"
                            placeholderTextColor="#cbd5e1" keyboardType="phone-pad"
                            className="bg-[#f8fafc] px-4 h-[56px] rounded-[20px] border-[2px] border-gray-100 font-bold text-gray-900 text-base mb-4 shadow-sm"
                        />

                        <Text className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-2 ml-1">Transaction ID (TID)</Text>
                        <TextInput
                            value={tid} onChangeText={setTid} placeholder="SMS mein aane wali TID darj karein"
                            placeholderTextColor="#cbd5e1"
                            className="bg-[#f8fafc] px-4 h-[56px] rounded-[20px] border-[2px] border-gray-100 font-bold text-gray-900 text-base mb-8 shadow-sm"
                        />

                        <TouchableOpacity 
                            disabled={depositing || !amount || !tid || !senderAccount} 
                            onPress={handleAddSubmit} 
                            className={`w-full py-4 rounded-[24px] items-center justify-center flex-row ${(!amount || !tid || !senderAccount) ? 'bg-gray-200' : ''}`}
                            style={(!amount || !tid || !senderAccount) ? {} : { backgroundColor: primaryColorHex }}
                        >
                            {depositing ? <ActivityIndicator size="small" color="#ffffff" /> :
                                <Text className={`font-black text-lg ${(!amount || !tid || !senderAccount) ? 'text-gray-400' : 'text-white'}`}>Request Bhejein</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Withdraw Modal – unchanged, but uses withdrawing */}
            <Modal visible={showWithdrawModal} transparent animationType="slide" onRequestClose={() => setShowWithdrawModal(false)}>
                <View className="flex-1 justify-end bg-black/60">
                    <View className="bg-white rounded-t-[40px] p-6 pb-10 shadow-2xl">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-2xl font-black text-gray-900">Pese Nikalwayen</Text>
                            <TouchableOpacity onPress={() => setShowWithdrawModal(false)} className="bg-gray-100 p-2.5 rounded-full">
                                <X size={20} color="#374151" strokeWidth={2.5} />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-2 ml-1">Nikalwane wali Raqam (PKR)</Text>
                        <TextInput
                            value={amount} onChangeText={setAmount} placeholder="Misaal: 500"
                            placeholderTextColor="#cbd5e1" keyboardType="numeric"
                            className="bg-[#f8fafc] px-4 h-[56px] rounded-[20px] border-[2px] border-gray-100 font-black text-gray-900 text-lg mb-4 shadow-sm"
                        />

                        <Text className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-2 ml-1">Bank Ya Wallet Ka Naam</Text>
                        <TextInput
                            value={withdrawBank} onChangeText={setWithdrawBank} placeholder="JazzCash, EasyPaisa, ya Meezan Bank"
                            placeholderTextColor="#cbd5e1"
                            className="bg-[#f8fafc] px-4 h-[56px] rounded-[20px] border-[2px] border-gray-100 font-bold text-gray-900 text-base mb-4 shadow-sm"
                        />

                        <Text className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-2 ml-1">Account Number</Text>
                        <TextInput
                            value={withdrawAccountNo} onChangeText={setWithdrawAccountNo} placeholder="Aapka account number"
                            placeholderTextColor="#cbd5e1" keyboardType="phone-pad"
                            className="bg-[#f8fafc] px-4 h-[56px] rounded-[20px] border-[2px] border-gray-100 font-bold text-gray-900 text-base mb-4 shadow-sm"
                        />

                        <Text className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-2 ml-1">Account Title (Naam)</Text>
                        <TextInput
                            value={withdrawAccountTitle} onChangeText={setWithdrawAccountTitle} placeholder="Account holder ka naam"
                            placeholderTextColor="#cbd5e1"
                            className="bg-[#f8fafc] px-4 h-[56px] rounded-[20px] border-[2px] border-gray-100 font-bold text-gray-900 text-base mb-8 shadow-sm"
                        />

                        <TouchableOpacity 
                            disabled={withdrawing || !amount || !withdrawBank || !withdrawAccountNo || !withdrawAccountTitle} 
                            onPress={handleWithdrawSubmit} 
                            className={`w-full py-4 rounded-[24px] items-center justify-center flex-row ${(!amount || !withdrawBank || !withdrawAccountNo || !withdrawAccountTitle) ? 'bg-gray-200' : ''}`}
                            style={(!amount || !withdrawBank || !withdrawAccountNo || !withdrawAccountTitle) ? {} : { backgroundColor: primaryColorHex }}
                        >
                            {withdrawing ? <ActivityIndicator size="small" color="#ffffff" /> :
                                <Text className={`font-black text-lg ${(!amount || !withdrawBank || !withdrawAccountNo || !withdrawAccountTitle) ? 'text-gray-400' : 'text-white'}`}>Submit Request</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Success Modal – unchanged */}
            <Modal visible={showSuccessModal} transparent animationType="fade" onRequestClose={() => setShowSuccessModal(false)}>
                <View className="flex-1 justify-center items-center bg-black/60 px-5">
                    <View className="bg-white rounded-[32px] p-6 w-full max-w-sm shadow-2xl items-center border border-gray-100">
                        <View className="w-20 h-20 bg-amber-50 rounded-full items-center justify-center mb-5">
                            <Clock size={36} color="#d97706" strokeWidth={2.5} />
                        </View>
                        <Text className="text-2xl font-black text-gray-900 mb-2 text-center tracking-tight">{successMessage.title}</Text>
                        <Text className="text-gray-500 text-center text-sm leading-relaxed mb-8 px-2 font-bold">{successMessage.body}</Text>
                        <TouchableOpacity onPress={() => setShowSuccessModal(false)} className="w-full bg-gray-900 py-4 rounded-[20px] items-center justify-center">
                            <Text className="font-black text-white text-base">Theek hai</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default Wallet