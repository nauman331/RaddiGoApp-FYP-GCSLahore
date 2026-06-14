import { View, Text, ScrollView, TouchableOpacity, StatusBar, Image, Modal, TextInput, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import Header from '../../components/Header'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { ArrowDownToLine, PlusCircle, Building2, Smartphone, ArrowUpRight, ArrowDownLeft, ReceiptText, ChevronRight, Wallet as WalletIcon, X, CheckCircle2 } from 'lucide-react-native'
import EmptyPic from "../../assets/homeempty.png"

const Wallet: React.FC = () => {
    const { userdata } = useSelector((state: RootState) => state.auth) as { userdata: { role?: string } };
    const role = userdata?.role || 'customer';
    const isCollector = role === 'collector'; 

    const primaryColorHex = isCollector ? '#d97706' : '#059669'; 
    const primaryLightHex = isCollector ? '#fffbeb' : '#ecfdf5'; 

    const [activeTab, setActiveTab] = useState<'All' | 'In' | 'Out'>('All');
    const tabs = ['All', 'In', 'Out'] as const;

    // Modal States
    const [showAddModal, setShowAddModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    
    // Form States
    const [amount, setAmount] = useState('');
    const [selectedMethod, setSelectedMethod] = useState<'jazzcash' | 'easypaisa' | 'bank'>('jazzcash');
    const [loading, setLoading] = useState(false);

    const mockTransactions = [
        { id: '1', title: 'Raddi Sold', type: 'in', amount: '1,250', date: 'Today, 10:30 AM' },
        { id: '2', title: 'Withdrawal to JazzCash', type: 'out', amount: '2,000', date: 'Yesterday, 04:15 PM' },
        { id: '3', title: 'Bonus Reward', type: 'in', amount: '500', date: 'Jun 12, 09:00 AM' },
        { id: '4', title: 'Raddi Sold', type: 'in', amount: '850', date: 'Jun 10, 11:20 AM' },
    ];

    const filteredTransactions = mockTransactions.filter(tx => {
        if (activeTab === 'All') return true;
        return tx.type === activeTab.toLowerCase();
    });

    const handleActionSubmit = (type: 'add' | 'withdraw') => {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
        
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setShowAddModal(false);
            setShowWithdrawModal(false);
            setSuccessMessage(
                type === 'add' 
                    ? `PKR ${Number(amount).toLocaleString()} added successfully to your wallet.` 
                    : `Withdrawal request for PKR ${Number(amount).toLocaleString()} submitted.`
            );
            setAmount('');
            setShowSuccessModal(true);
        }, 1500);
    };

    return (
        <View className="flex-1 bg-[#f8fafc]">
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />
            
            <View className="bg-white shadow-sm z-20 pb-4 rounded-b-[32px]">
                <Header />
                <View className="px-6 mt-2">
                    <Text className="text-gray-500 font-bold text-[11px] uppercase tracking-widest mb-1">
                        Financial Overview
                    </Text>
                    <Text className="text-gray-900 font-black text-3xl tracking-tight">
                        My Wallet
                    </Text>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120, paddingTop: 24 }}>
                
                <View className="px-5 mb-8">
                    <View className="w-full bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
                        <View className="flex-row justify-between items-start mb-6">
                            <View>
                                <Text className="text-gray-400 font-extrabold text-[11px] uppercase tracking-widest mb-1.5">
                                    Available Balance
                                </Text>
                                <View className="flex-row items-baseline">
                                    <Text className="text-gray-400 font-bold text-lg mr-2">PKR</Text>
                                    <Text className="text-gray-900 font-black text-4xl tracking-tight">4,250</Text>
                                </View>
                            </View>
                            <View className="p-3.5 rounded-[20px]" style={{ backgroundColor: primaryLightHex }}>
                                <WalletIcon size={24} color={primaryColorHex} strokeWidth={2.5} />
                            </View>
                        </View>

                        <View className="flex-row gap-3">
                            <TouchableOpacity 
                                onPress={() => setShowWithdrawModal(true)}
                                activeOpacity={0.8}
                                className="flex-1 bg-gray-900 py-4 rounded-[20px] flex-row items-center justify-center shadow-sm"
                            >
                                <ArrowDownToLine size={16} color="#ffffff" strokeWidth={2.5} />
                                <Text className="font-extrabold text-sm text-white ml-2">Withdraw</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                onPress={() => setShowAddModal(true)}
                                activeOpacity={0.8}
                                className="flex-1 py-4 rounded-[20px] flex-row items-center justify-center border border-gray-200 bg-white"
                            >
                                <PlusCircle size={16} color="#111827" strokeWidth={2.5} />
                                <Text className="font-extrabold text-sm text-gray-900 ml-2">Add Funds</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View className="px-5 mb-8">
                    <View className="flex-row justify-between items-center mb-4 px-1">
                        <Text className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">
                            Linked Accounts
                        </Text>
                        <TouchableOpacity>
                            <Text className="text-xs font-extrabold" style={{ color: primaryColorHex }}>Add New</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row gap-3">
                        <View className="flex-1 bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm items-center">
                            <View className="w-12 h-12 bg-gray-50 rounded-full items-center justify-center mb-2">
                                <Smartphone size={20} color="#374151" strokeWidth={2} />
                            </View>
                            <Text className="font-black text-gray-900 text-xs">JazzCash</Text>
                            <Text className="text-[10px] font-bold text-gray-400 mt-0.5">...3492</Text>
                        </View>

                        <View className="flex-1 bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm items-center">
                            <View className="w-12 h-12 bg-gray-50 rounded-full items-center justify-center mb-2">
                                <Building2 size={20} color="#374151" strokeWidth={2} />
                            </View>
                            <Text className="font-black text-gray-900 text-xs">Meezan Bank</Text>
                            <Text className="text-[10px] font-bold text-gray-400 mt-0.5">...8810</Text>
                        </View>
                    </View>
                </View>

                <View className="px-5">
                    <View className="flex-row justify-between items-end mb-4 px-1">
                        <Text className="font-black text-gray-900 text-xl tracking-tight">Transactions</Text>
                        <TouchableOpacity className="flex-row items-center bg-gray-200/60 px-3 py-1.5 rounded-full">
                            <Text className="font-extrabold text-xs text-gray-700 mr-1">Filter</Text>
                            <ChevronRight size={14} color="#374151" strokeWidth={3} />
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row bg-gray-200/80 p-1.5 rounded-full border border-gray-100 mb-4">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab;
                            return (
                                <TouchableOpacity
                                    key={tab}
                                    onPress={() => setActiveTab(tab)}
                                    activeOpacity={0.8}
                                    className="flex-1 py-3 items-center rounded-full"
                                    style={isActive ? {
                                        backgroundColor: '#ffffff',
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.05,
                                        shadowRadius: 4,
                                        elevation: 2,
                                    } : {
                                        backgroundColor: 'transparent'
                                    }}
                                >
                                    <Text className="font-extrabold text-xs" style={{ color: isActive ? '#111827' : '#6b7280' }}>
                                        {tab}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {filteredTransactions.length > 0 ? (
                        <View className="bg-white rounded-[32px] p-2 border border-gray-100 shadow-sm">
                            {filteredTransactions.map((tx, index) => {
                                const isIncome = tx.type === 'in';
                                return (
                                    <View 
                                        key={tx.id} 
                                        className={`flex-row items-center justify-between p-4 ${index !== filteredTransactions.length - 1 ? 'border-b border-gray-50' : ''}`}
                                    >
                                        <View className="flex-row items-center flex-1 pr-4">
                                            <View className={`p-3 rounded-[16px] mr-3 ${isIncome ? 'bg-emerald-50' : 'bg-red-50'}`}>
                                                {isIncome ? (
                                                    <ArrowDownLeft size={20} color="#059669" strokeWidth={2.5} />
                                                ) : (
                                                    <ArrowUpRight size={20} color="#dc2626" strokeWidth={2.5} />
                                                )}
                                            </View>
                                            <View>
                                                <Text className="font-black text-gray-900 text-sm mb-0.5">{tx.title}</Text>
                                                <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{tx.date}</Text>
                                            </View>
                                        </View>
                                        <View className="items-end">
                                            <Text className={`font-black text-base ${isIncome ? 'text-emerald-600' : 'text-gray-900'}`}>
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
                            <Text className="text-gray-900 text-lg font-black text-center mb-1">No Transactions</Text>
                            <Text className="text-gray-500 text-xs text-center leading-relaxed font-medium px-4">
                                You do not have any transactions to show right now.
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
                <View className="flex-1 justify-end bg-black/60">
                    <View className="bg-white rounded-t-[32px] p-6 pb-10 shadow-2xl">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-2xl font-black text-gray-900">Add Funds</Text>
                            <TouchableOpacity onPress={() => setShowAddModal(false)} className="bg-gray-100 p-2 rounded-full">
                                <X size={20} color="#374151" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Amount (PKR)</Text>
                        <TextInput
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="e.g. 1000"
                            placeholderTextColor="#9ca3af"
                            keyboardType="numeric"
                            className="bg-gray-50 px-5 py-4 rounded-2xl border border-gray-200 font-extrabold text-gray-900 text-base mb-6"
                        />

                        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Select Source</Text>
                        <View className="space-y-2 mb-8">
                            <TouchableOpacity onPress={() => setSelectedMethod('jazzcash')} className={`p-4 rounded-2xl border-2 flex-row items-center justify-between ${selectedMethod === 'jazzcash' ? 'border-gray-900 bg-gray-50' : 'border-gray-100'}`}>
                                <Text className="font-bold text-gray-900">JazzCash Wallet (...3492)</Text>
                                <View className={`w-4 h-4 rounded-full border-2 items-center justify-center ${selectedMethod === 'jazzcash' ? 'border-gray-900' : 'border-gray-300'}`}>
                                    {selectedMethod === 'jazzcash' && <View className="w-2 h-2 rounded-full bg-gray-900" />}
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => setSelectedMethod('bank')} className={`p-4 rounded-2xl border-2 flex-row items-center justify-between mt-2 ${selectedMethod === 'bank' ? 'border-gray-900 bg-gray-50' : 'border-gray-100'}`}>
                                <Text className="font-bold text-gray-900">Meezan Bank (...8810)</Text>
                                <View className={`w-4 h-4 rounded-full border-2 items-center justify-center ${selectedMethod === 'bank' ? 'border-gray-900' : 'border-gray-300'}`}>
                                    {selectedMethod === 'bank' && <View className="w-2 h-2 rounded-full bg-gray-900" />}
                                </View>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity disabled={loading} onPress={() => handleActionSubmit('add')} className="w-full bg-gray-900 py-4 rounded-2xl shadow-lg items-center justify-center flex-row">
                            {loading ? <ActivityIndicator size="small" color="#ffffff" /> : <Text className="text-white font-extrabold text-base">Confirm Add Funds</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal visible={showWithdrawModal} transparent animationType="slide" onRequestClose={() => setShowWithdrawModal(false)}>
                <View className="flex-1 justify-end bg-black/60">
                    <View className="bg-white rounded-t-[32px] p-6 pb-10 shadow-2xl">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-2xl font-black text-gray-900">Withdraw Funds</Text>
                            <TouchableOpacity onPress={() => setShowWithdrawModal(false)} className="bg-gray-100 p-2 rounded-full">
                                <X size={20} color="#374151" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Amount (PKR)</Text>
                        <TextInput
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="e.g. 500"
                            placeholderTextColor="#9ca3af"
                            keyboardType="numeric"
                            className="bg-gray-50 px-5 py-4 rounded-2xl border border-gray-200 font-extrabold text-gray-900 text-base mb-6"
                        />

                        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Withdraw To</Text>
                        <View className="space-y-2 mb-8">
                            <TouchableOpacity onPress={() => setSelectedMethod('jazzcash')} className={`p-4 rounded-2xl border-2 flex-row items-center justify-between ${selectedMethod === 'jazzcash' ? 'border-gray-900 bg-gray-50' : 'border-gray-100'}`}>
                                <Text className="font-bold text-gray-900">JazzCash Account</Text>
                                <View className={`w-4 h-4 rounded-full border-2 items-center justify-center ${selectedMethod === 'jazzcash' ? 'border-gray-900' : 'border-gray-300'}`}>
                                    {selectedMethod === 'jazzcash' && <View className="w-2 h-2 rounded-full bg-gray-900" />}
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => setSelectedMethod('bank')} className={`p-4 rounded-2xl border-2 flex-row items-center justify-between mt-2 ${selectedMethod === 'bank' ? 'border-gray-900 bg-gray-50' : 'border-gray-100'}`}>
                                <Text className="font-bold text-gray-900">Meezan Bank Account</Text>
                                <View className={`w-4 h-4 rounded-full border-2 items-center justify-center ${selectedMethod === 'bank' ? 'border-gray-900' : 'border-gray-300'}`}>
                                    {selectedMethod === 'bank' && <View className="w-2 h-2 rounded-full bg-gray-900" />}
                                </View>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity disabled={loading} onPress={() => handleActionSubmit('withdraw')} style={{ backgroundColor: primaryColorHex }} className="w-full py-4 rounded-2xl shadow-lg items-center justify-center flex-row">
                            {loading ? <ActivityIndicator size="small" color="#ffffff" /> : <Text className="text-white font-extrabold text-base">Confirm Withdrawal</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal visible={showSuccessModal} transparent animationType="fade" onRequestClose={() => setShowSuccessModal(false)}>
                <View className="flex-1 justify-center items-center bg-black/60 px-5">
                    <View className="bg-white rounded-[32px] p-6 w-full max-w-sm shadow-2xl items-center border border-gray-100">
                        <View className="w-16 h-16 bg-emerald-50 rounded-full items-center justify-center mb-5">
                            <CheckCircle2 size={32} color="#059669" strokeWidth={2} />
                        </View>
                        <Text className="text-2xl font-black text-gray-900 mb-2 text-center tracking-tight">Transaction Processed</Text>
                        <Text className="text-gray-500 text-center text-sm leading-relaxed mb-6 px-2 font-medium">{successMessage}</Text>
                        <TouchableOpacity onPress={() => setShowSuccessModal(false)} className="w-full bg-gray-900 py-3.5 rounded-2xl items-center justify-center">
                            <Text className="font-extrabold text-white text-base">Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default Wallet