import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Plus, Trash, Box } from 'lucide-react-native';
import type { LooseItem } from '../../types';
import { useAppContext } from '../../context/AppContext';
import {
    cls,
    colors,
    Card,
    InputGroup
} from '../theme';

export default function CalculatorScreen() {
    const router = useRouter();
    const { handleCalculate } = useAppContext();
    const params = useLocalSearchParams<{ initialState?: string }>();

    const alphaNumeric = (s: string) => s.replace(/[^0-9A-Za-z]/g, '');

    const [itemId, setItemId] = useState('');
    const [quantityWanted, setQuantityWanted] = useState('');
    const [quantityPerItem, setQuantityPerItem] = useState('');
    const [looseItems, setLooseItems] = useState<LooseItem[]>([]);
    const [calculateExactRemainder, setCalculateExactRemainder] = useState(false);

    useEffect(() => {
        if (params.initialState) {
            const state = JSON.parse(params.initialState);
            setItemId(state.itemId);
            setQuantityWanted(state.quantityWanted);
            setQuantityPerItem(state.quantityPerItem);
            setLooseItems(state.looseItems);
            setCalculateExactRemainder(state.calculateExactRemainder);
        }
    }, [params.initialState]);

    const handleAddLooseItem = useCallback(() => {
        setLooseItems(prev => [...prev, { id: Date.now(), quantity: '' }]);
    }, []);

    const handleRemoveLooseItem = useCallback((id: number) => {
        setLooseItems(prev => prev.filter(item => item.id !== id));
    }, []);

    const handleLooseItemChange = useCallback((id: number, value: string) => {
        setLooseItems(prev => prev.map(item => item.id === id ? { ...item, quantity: value } : item));
    }, []);

    const handleCalculateClick = () => {
        const wanted = parseInt(quantityWanted, 10);
        const perItem = parseInt(quantityPerItem, 10);

        if (!itemId.trim()) {
            Alert.alert('Error', 'Please enter an "Item ID / Part No.".');
            return;
        }
        if (isNaN(wanted) || wanted <= 0) {
            Alert.alert('Error', 'Please enter a valid "Quantity Wanted".');
            return;
        }
        if (isNaN(perItem) || perItem <= 0) {
            Alert.alert('Error', 'Please enter a valid "Quantity per Full Item".');
            return;
        }

        handleCalculate({ itemId, quantityWanted, quantityPerItem, looseItems, calculateExactRemainder });
        router.push('.//(tabs)/result');
    };

    return (
        <ScrollView className={cls.screen} contentContainerStyle={{ padding: 16 }}>
            <View className={cls.container}>
                <Card>
                    <Text className={`${cls.cardTitle} mb-4`}>Order Details</Text>
                    <View className={cls.form.group}>
                        <InputGroup
                            label="Item ID / Part No."
                            value={itemId}
                            onChangeText={(t) => setItemId(alphaNumeric(t).toUpperCase())}
                            placeholder="e.g., SKU-12345"
                            keyboardType="default"
                        />
                        <InputGroup
                            label="Quantity Wanted"
                            value={quantityWanted}
                            onChangeText={setQuantityWanted}
                            placeholder="e.g., 3700"
                            keyboardType="numeric"
                        />
                        <InputGroup
                            label="Quantity per Full Item"
                            value={quantityPerItem}
                            onChangeText={setQuantityPerItem}
                            placeholder="e.g., 500"
                            keyboardType="numeric"
                        />
                        <View className={cls.form.checkboxContainer}>
                            <Switch
                                value={calculateExactRemainder}
                                onValueChange={setCalculateExactRemainder}
                            />
                            <Text className={cls.form.checkboxLabel}>
                                Calculate exact remainder
                            </Text>
                        </View>
                    </View>
                </Card>

                <Card>
                    <View className={cls.cardHeader}>
                        <Text className={cls.cardTitle}>Available Loose Stock</Text>
                        <TouchableOpacity onPress={handleAddLooseItem} className={cls.btn.secondary}>
                            <Plus color={colors.brandPrimary} size={16} />
                            <Text className={cls.btn.secondaryText}>Add</Text>
                        </TouchableOpacity>
                    </View>
                    <View className={cls.form.looseItemsContainer}>
                        {looseItems.length === 0 && (
                            <View className={cls.form.looseItemsEmpty}>
                                <Text className="mt-2 text-sm text-slate-600 text-center">No loose items added.</Text>
                            </View>
                        )}
                        {looseItems.map((item, index) => (
                            <View key={item.id} className={cls.form.looseItemRow}>
                                <Text className={cls.form.looseItemIndex}>{index + 1}.</Text>
                                <TextInput
                                    value={String(item.quantity)}
                                    onChangeText={(value) => handleLooseItemChange(item.id, value)}
                                    placeholder="Loose Qty"
                                    placeholderTextColor={colors.placeholder}
                                    className={cls.form.looseItemInput}
                                    keyboardType="numeric"
                                />
                                <TouchableOpacity onPress={() => handleRemoveLooseItem(item.id)} className={cls.btn.icon}>
                                    <Trash size={20} color={colors.placeholder} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </Card>

                <View className="pt-4">
                    <TouchableOpacity onPress={handleCalculateClick} className={cls.btn.primary}>
                        <Text className={cls.btn.primaryText}>Calculate</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}