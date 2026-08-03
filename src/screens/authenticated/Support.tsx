import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Linking,
    StatusBar,
    StyleSheet,
} from 'react-native';
import Header from '../../components/Header';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Mail, Phone, MessageCircle, HelpCircle, ShieldCheck, ChevronRight } from 'lucide-react-native';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';

const Support: React.FC = () => {
    const { userdata } = useSelector((state: RootState) => state.auth) as { userdata: { role?: string } };
    const role = userdata?.role || 'customer';
    const isCustomer = role === 'customer';

    const primaryColorHex = isCustomer ? '#059669' : '#d97706';
    const primaryLightHex = isCustomer ? '#ecfdf5' : '#fffbeb';

    const supportEmail = 'nauman33183@gmail.com';
    const supportPhone = '+923318388805';

    const handleEmail = () => {
        Linking.openURL(`mailto:${supportEmail}?subject=RaddiGo Support Query`).catch(() => {
            Toast.show({ type: ALERT_TYPE.WARNING, title: 'Email', textBody: `Support Email: ${supportEmail}` });
        });
    };

    const handleCall = () => {
        Linking.openURL(`tel:${supportPhone}`).catch(() => {
            Toast.show({ type: ALERT_TYPE.WARNING, title: 'Phone', textBody: `Support Number: ${supportPhone}` });
        });
    };

    const handleWhatsApp = () => {
        Linking.openURL(`whatsapp://send?phone=${supportPhone}&text=Assalam-o-Alaikum RaddiGo Support`).catch(() => {
            Toast.show({ type: ALERT_TYPE.WARNING, title: 'WhatsApp', textBody: `WhatsApp Number: ${supportPhone}` });
        });
    };

    const faqs = [
        { q: 'Pickup order kaise book karein?', a: 'App ke Home screen par "Pickup Bulao" par click karein aur apna pata aur wazan darj karein.' },
        { q: 'Scrap ke rates kya hain?', a: 'Home screen par "Zinda Rate (Live Rates)" par click kar ke rozana ke scrap rates dekhein.' },
        { q: 'Batwa mein balance kaise add karein?', a: 'Wallet Screen par "Jama Karein" par click kar ke admin account par paise bhejein aur TID darj karein.' },
        { q: 'Order cancel kaise ho sakta hai?', a: 'Rider ke accept karne se pehle aap order screen se cancel kar sakte hain.' },
    ];

    return (
        <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" translucent={false} />

            <View style={{ backgroundColor: '#f8fafc', paddingBottom: 12 }}>
                <Header />
                <View style={{ paddingHorizontal: 24, marginTop: 8 }}>
                    <Text style={{ color: '#94a3b8', fontWeight: '800', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>
                        RaddiGo Support Center
                    </Text>
                    <Text style={{ color: '#0f172a', fontWeight: '900', fontSize: 28 }}>
                        Madad Aur Rabta
                    </Text>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, paddingTop: 12 }}>
                {/* Email Support Card */}
                <TouchableOpacity
                    onPress={handleEmail}
                    activeOpacity={0.85}
                    style={[styles.contactCard, { borderColor: primaryLightHex }]}
                >
                    <View style={[styles.iconBox, { backgroundColor: primaryLightHex }]}>
                        <Mail size={24} color={primaryColorHex} strokeWidth={2.5} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.cardTag}>Official Support Email</Text>
                        <Text style={styles.cardValue}>{supportEmail}</Text>
                        <Text style={styles.cardSub}>Email bhej kar fauri madad hasil karein</Text>
                    </View>
                    <ChevronRight size={20} color="#cbd5e1" strokeWidth={2.5} />
                </TouchableOpacity>

                {/* Call Support Card */}
                <TouchableOpacity
                    onPress={handleCall}
                    activeOpacity={0.85}
                    style={styles.contactCard}
                >
                    <View style={[styles.iconBox, { backgroundColor: '#eff6ff' }]}>
                        <Phone size={24} color="#2563eb" strokeWidth={2.5} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.cardTag}>Helpline Number</Text>
                        <Text style={styles.cardValue}>{supportPhone}</Text>
                        <Text style={styles.cardSub}>Subah 9 se Shaam 9 baje tak rabta karein</Text>
                    </View>
                    <ChevronRight size={20} color="#cbd5e1" strokeWidth={2.5} />
                </TouchableOpacity>

                {/* WhatsApp Support Card */}
                <TouchableOpacity
                    onPress={handleWhatsApp}
                    activeOpacity={0.85}
                    style={styles.contactCard}
                >
                    <View style={[styles.iconBox, { backgroundColor: '#ecfdf5' }]}>
                        <MessageCircle size={24} color="#059669" strokeWidth={2.5} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.cardTag}>WhatsApp Support</Text>
                        <Text style={styles.cardValue}>Fauri Chat Support</Text>
                        <Text style={styles.cardSub}>WhatsApp par live help ke liye message karein</Text>
                    </View>
                    <ChevronRight size={20} color="#cbd5e1" strokeWidth={2.5} />
                </TouchableOpacity>

                {/* FAQs Section */}
                <View style={{ marginTop: 24 }}>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12, paddingLeft: 8 }}>
                        Aam Sawalat (FAQs)
                    </Text>

                    <View style={{ backgroundColor: '#ffffff', borderRadius: 28, borderWidth: 1, borderColor: '#f1f5f9', overflow: 'hidden' }}>
                        {faqs.map((faq, index) => (
                            <View key={index} style={{ padding: 18, borderBottomWidth: index !== faqs.length - 1 ? 1 : 0, borderBottomColor: '#f8fafc' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                    <HelpCircle size={18} color={primaryColorHex} strokeWidth={2.5} style={{ marginRight: 8 }} />
                                    <Text style={{ fontSize: 15, fontWeight: '900', color: '#0f172a', flex: 1 }}>{faq.q}</Text>
                                </View>
                                <Text style={{ fontSize: 13, fontWeight: '600', color: '#64748b', lineHeight: 20, paddingLeft: 26 }}>{faq.a}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    contactCard: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 2,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    cardTag: {
        fontSize: 10,
        fontWeight: '800',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 2,
    },
    cardValue: {
        fontSize: 16,
        fontWeight: '900',
        color: '#0f172a',
    },
    cardSub: {
        fontSize: 11,
        fontWeight: '600',
        color: '#64748b',
        marginTop: 2,
    },
});

export default Support;
