import React from "react";
import { useRoute } from '@react-navigation/native';
import { View, Text, Button, StyleSheet } from 'react-native';
import Login from '../getData/loginId';
import { useNavigation } from '@react-navigation/native';
import AddOrder from '../AddData/AddOrder';
const PaymentApp = () => {
    const [userPoints, setUserPoints] = React.useState<number | null>(null);
    const [currentStep, setCurrentStep] = React.useState<'order' | 'alipay' | 'success'>('order');
    const route = useRoute();
    const navigation = useNavigation();

    // 获取订单数据
    const selectedItems = route.params?.selectedItems || [];
    const totalAmount = selectedItems.reduce((sum: number, item: { price: number; quantity: number }) => sum + (item.price * item.quantity), 0);

    React.useEffect(() => {
        const fetchUserPoints = async () => {
            const loginData = await Login();
            setUserPoints(loginData?.Point || null);
        };
        fetchUserPoints();
    }, []);


    const handleConfirmPayment = async () => {
        if (!selectedItems || selectedItems.length === 0) {
            alert('购物车为空，请先选择商品');
            return;
          }
        
          // 加强类型校验
          interface SelectedItem {
            key: string;
            name: string;
            price: number;
            quantity: number;
          }

          interface FormattedItem {
            key: string;
            quantity: number;
          }

          interface SelectedItem {
            key: string;
            name: string;
            price: number;
            quantity: number;
          }

          interface FormattedItem {
            key: string;
            quantity: number;
          }

          const formattedItems: FormattedItem[] = selectedItems
            .filter((item: SelectedItem) => 
              !!item.key && Number.isInteger(item.quantity)
            )
            .map((item: SelectedItem) => ({ key: item.key, quantity: item.quantity }));
        
          if (formattedItems.length !== selectedItems.length) {
            alert('部分商品数据格式错误');
            return;
          }
        
        const formattedTuples: [string, number][] = formattedItems.map(item => [item.key, item.quantity]);
        await AddOrder(formattedTuples, totalAmount, "alipay", userPoints ?? 0);
        setCurrentStep('success');
        // 这里可以添加实际的支付处理逻辑
    };

    return (
        <View style={styles.container}>
            {currentStep === 'order' && (
                <View style={styles.orderContainer}>
                    <Text style={styles.title}>订单详情</Text>
                    {selectedItems.map((item: { key: string; name: string; price: number; quantity:number; }) => (
                        <View key={item.key} style={styles.item}>
                            <Text>{item.name} x{item.quantity}</Text>
                            <Text>¥{(item.price * item.quantity).toFixed(2)}</Text>
                        </View>
                    ))}
                    <Text style={styles.total}>总计：¥{totalAmount.toFixed(2)}</Text>
                    <Text style={styles.points}>当前积分：{userPoints || 0}</Text>
                    <Button title="确认付款" onPress={handleConfirmPayment} />
                </View>
            )}

            {currentStep === 'success' && (
                <View style={styles.successContainer}>
                    <Text style={styles.successIcon}>✓</Text>
                    <Text style={styles.successText}>支付成功！</Text>
                    <Text style={styles.successAmount}>¥{totalAmount.toFixed(2)}</Text>
                    <Button title="返回首页" onPress={() => 
                    navigation.goBack()} />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    orderContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    total: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 15,
        textAlign: 'right',
    },
    points: {
        marginVertical: 10,
        color: '#666',
    },
    alipayContainer: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 30,
    },
    logo: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#0099ff',
        marginBottom: 20,
    },
    amount: {
        fontSize: 36,
        fontWeight: 'bold',
        marginVertical: 20,
    },
    qrCode: {
        width: 250,
        height: 250,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 30,
        borderRadius: 10,
    },
    qrText: {
        color: '#666',
    },
    buttonGroup: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    buttonSpacer: {
        width: 20,
    },
    successContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    successIcon: {
        fontSize: 64,
        color: '#4CAF50',
        marginBottom: 20,
    },
    successText: {
        fontSize: 24,
        marginBottom: 10,
    },
    successAmount: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 40,
    },
});

export default PaymentApp;