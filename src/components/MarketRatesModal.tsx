import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Image } from 'react-native';
import { X, Search, TrendingUp, RefreshCw, AlertCircle } from 'lucide-react-native';
import { useFetch } from '../apiHooks/useFetch';
import { CategoryItem } from '../types/integration';

interface MarketRatesModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectCategory?: (category: CategoryItem) => void;
    accentColor?: string;
}

const MarketRatesModal: React.FC<MarketRatesModalProps> = ({
    visible,
    onClose,
    onSelectCategory,
    accentColor = '#059669',
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    const { data, isLoading, error, refetch, isRefetching } = useFetch({
        endpoint: 'category/api/v1/categories?page=1&limit=50',
        isAuth: false,
    });

    // API returns: { categories: [...], pagination: { ... } }
    // Redis may also cache: { categories: {...nested same...} }
    const raw = data?.categories ?? data?.data ?? data;
    const categories: CategoryItem[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.categories)
        ? raw.categories
        : [];

    const filteredCategories = categories.filter(c => {
        if (!c) return false;
        const engMatch = c.nameEng ? String(c.nameEng).toLowerCase().includes(searchQuery.toLowerCase()) : false;
        const urduMatch = c.nameUrdu ? String(c.nameUrdu).includes(searchQuery) : false;
        return engMatch || urduMatch;
    });

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View className="flex-1 justify-end bg-black/60">
                <View className="bg-white rounded-t-[40px] p-6 pb-10 shadow-2xl max-h-[85%]">
                    {/* Header */}
                    <View className="flex-row justify-between items-center mb-4">
                        <View className="flex-row items-center">
                            <View className="p-2.5 rounded-[14px] bg-emerald-50 mr-3" style={{ backgroundColor: `${accentColor}15` }}>
                                <TrendingUp size={22} color={accentColor} strokeWidth={2.5} />
                            </View>
                            <View>
                                <Text className="text-2xl font-black text-gray-900 tracking-tight">
                                    Zinda Rate (Live Rates)
                                </Text>
                                <Text className="text-xs font-bold text-gray-400">
                                    Aaj ke official scrap rates (PKR / kg)
                                </Text>
                            </View>
                        </View>
                        <View className="flex-row items-center gap-2">
                            <TouchableOpacity onPress={() => refetch()} className="p-2 bg-gray-100 rounded-full">
                                <RefreshCw size={18} color="#4b5563" className={isRefetching ? 'animate-spin' : ''} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onClose} className="p-2 bg-gray-100 rounded-full">
                                <X size={20} color="#374151" strokeWidth={2.5} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Search Bar */}
                    <View className="flex-row items-center bg-[#f8fafc] px-4 h-[52px] rounded-[20px] border border-gray-200 mb-4">
                        <Search size={18} color="#94a3b8" />
                        <TextInput
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Category talaash karein..."
                            placeholderTextColor="#cbd5e1"
                            className="flex-1 h-full px-3 font-bold text-gray-900 text-sm"
                        />
                    </View>

                    {isLoading ? (
                        <View className="items-center justify-center py-16">
                            <ActivityIndicator size="large" color={accentColor} />
                            <Text className="text-gray-500 font-extrabold text-xs mt-3">Rates load ho rahay hain...</Text>
                        </View>
                    ) : error ? (
                        <View className="bg-red-50 p-4 rounded-[20px] border border-red-100 flex-row items-center mb-4">
                            <AlertCircle size={20} color="#dc2626" className="mr-3" />
                            <Text className="text-red-700 text-xs font-bold flex-1">
                                Rates load nahi ho sake: {error.message}
                            </Text>
                        </View>
                    ) : (
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                            {filteredCategories.map((cat) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    activeOpacity={0.8}
                                    onPress={() => {
                                        if (onSelectCategory) {
                                            onSelectCategory(cat);
                                            onClose();
                                        }
                                    }}
                                    className="bg-[#f8fafc] p-4 rounded-[24px] mb-3 border border-[#f1f5f9] flex-row items-center justify-between"
                                >
                                    <View className="flex-row items-center flex-1 pr-3">
                                        {cat.categoryLogo ? (
                                            <Image source={{ uri: cat.categoryLogo }} className="w-12 h-12 rounded-[16px] mr-3.5 bg-white" resizeMode="contain" />
                                        ) : (
                                            <View className="w-12 h-12 rounded-[16px] mr-3.5 items-center justify-center bg-white border border-gray-100">
                                                <Text className="text-xl">📦</Text>
                                            </View>
                                        )}
                                        <View>
                                            <Text className="font-black text-gray-900 text-base mb-0.5">{cat.nameEng}</Text>
                                            <Text className="font-extrabold text-gray-500 text-xs">{cat.nameUrdu}</Text>
                                        </View>
                                    </View>
                                    <View className="items-end">
                                        <Text className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-0.5">Rate / kg</Text>
                                        <View className="flex-row items-baseline bg-emerald-50 px-3 py-1.5 rounded-[14px] border border-emerald-100">
                                            <Text className="font-black text-emerald-700 text-xs mr-0.5">Rs</Text>
                                            <Text className="font-black text-emerald-700 text-lg">{cat.todayPrice}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>
            </View>
        </Modal>
    );
};

export default MarketRatesModal;
