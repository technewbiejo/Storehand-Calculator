import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Switch,
    ScrollView,
    Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Plus, Trash } from 'lucide-react-native';
import type { LooseItem } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { cls, colors, Card, InputGroup } from '../theme';



export default function CalculatorScreen() {
    const router = useRouter();
    const { handleCalculate } = useAppContext();
    const params = useLocalSearchParams<{ initialState?: string }>();

    const [itemId, setItemId] = useState('');
    const [quantityWanted, setQuantityWanted] = useState('');
    const [quantityPerItem, setQuantityPerItem] = useState('');
    const [looseItems, setLooseItems] = useState<LooseItem[]>([]);
    const [calculateExactRemainder, setCalculateExactRemainder] =
        useState(false);

    // 🔥 Refs to each loose input field (keyed by item.id)
    const looseRefs = useRef<{ [key: number]: any }>({});


    // Clear all
    const clearField = async () => {
        setItemId('');
        setQuantityWanted('');
        setQuantityPerItem('');
        setLooseItems([]);
        setCalculateExactRemainder(false);
        looseRefs.current = {};
    };

    // Load from history
    useEffect(() => {
        if (params.initialState) {
            const state = JSON.parse(params.initialState as string);
            setItemId(state.itemId);
            setQuantityWanted(state.quantityWanted);
            setQuantityPerItem(state.quantityPerItem);
            setLooseItems(state.looseItems);
            setCalculateExactRemainder(state.calculateExactRemainder);

            // Rebuild refs
            looseRefs.current = {};
        }
    }, [params.initialState]);

    // ➕ Add loose item + auto-focus
    const handleAddLooseItem = useCallback(() => {
        const newId = Date.now();

        setLooseItems(prev => [...prev, { id: newId, quantity: '' }]);

        // Auto-focus after UI updates
        setTimeout(() => {
            const inputRef = looseRefs.current[newId];
            if (inputRef) {
                inputRef.focus();
            }
        }, 50);
    }, []);

    // ❌ Remove loose item
    const handleRemoveLooseItem = useCallback((id: number) => {
        setLooseItems(prev => prev.filter(item => item.id !== id));
        delete looseRefs.current[id];
    }, []);

    // Change text
    const handleLooseItemChange = useCallback((id: number, value: string) => {
        setLooseItems(prev =>
            prev.map(item => (item.id === id ? { ...item, quantity: value } : item))
        );
    }, []);

    // Calculate
    const handleCalculateClick = () => {
        const wanted = parseInt(quantityWanted, 10);

        if (!itemId.trim()) {
            Alert.alert('Error', 'Please enter an "Item ID / Part No.".');
            return;
        }
        if (isNaN(wanted) || wanted <= 0) {
            Alert.alert('Error', 'Please enter a valid "Quantity Wanted".');
            return;
        }

        const trimmed = quantityPerItem.trim();

        const packSizes = quantityPerItem
            .split(',')
            .map(s => parseInt(s.trim(), 10))
            .filter(n => !isNaN(n) && n > 0);

        if (trimmed.length > 0 && packSizes.length === 0 && parseInt(trimmed, 10) !== 0) {
            Alert.alert(
                'Error',
                'Enter valid number(s) for Qty per Full Item: 500 or 500,389,272 or 0.'
            );
            return;
        }

        handleCalculate({
            itemId,
            quantityWanted,
            quantityPerItem,
            looseItems,
            calculateExactRemainder,
        });

        router.push('.//(tabs)/result');
    };

    return (
        <ScrollView className={cls.screen} contentContainerStyle={{ padding: 16 }}>
            <View className={cls.container}>
                {/* Card 1 */}
                <Card>
                    <Text className={`${cls.cardTitle} mb-4`}>Order Details</Text>

                    <View className={cls.form.group}>
                        <InputGroup
                            label="Item ID / Part No."
                            value={itemId.toUpperCase()}
                            onChangeText={t => setItemId(t.toUpperCase())}
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
                            placeholder="e.g., 0 or 500 or 500,389,272"
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

                {/* Card 2 */}
                <Card>
                    <View className={cls.cardHeader}>
                        <Text className={cls.cardTitle}>Available Loose Stock</Text>

                        <TouchableOpacity
                            onPress={handleAddLooseItem}
                            className={cls.btn.secondary}
                        >
                            <Plus color={colors.brandPrimary} size={16} />
                            <Text className={cls.btn.secondaryText}>Add</Text>
                        </TouchableOpacity>
                    </View>

                    <View className={cls.form.looseItemsContainer}>
                        {looseItems.length === 0 && (
                            <View className={cls.form.looseItemsEmpty}>
                                <Text className="mt-2 text-sm text-slate-600 text-center">
                                    No loose items added.
                                </Text>
                            </View>
                        )}

                        {looseItems.map((item, index) => {
                            const isLast = index === looseItems.length - 1;

                            return (
                                <View key={item.id} className={cls.form.looseItemRow}>
                                    <Text className={cls.form.looseItemIndex}>
                                        {index + 1}.
                                    </Text>

                                    <TextInput
                                        ref={(input) => {
                                            looseRefs.current[item.id] = input;
                                        }}
                                        value={String(item.quantity)}
                                        onChangeText={(value) => handleLooseItemChange(item.id, value)}
                                        placeholder="Loose Qty"
                                        placeholderTextColor={colors.placeholder}
                                        className={cls.form.looseItemInput}
                                        keyboardType="numeric"
                                        returnKeyType="next"
                                        blurOnSubmit={false}
                                        onSubmitEditing={() => {
                                            if (isLast) {
                                                // Call your existing add function
                                                const newId = Date.now();
                                                setLooseItems((prev) => [...prev, { id: newId, quantity: '' }]);

                                                // Focus new input after it appears
                                                setTimeout(() => {
                                                    const nextRef = looseRefs.current[newId];
                                                    nextRef?.focus?.();
                                                }, 50);
                                            }
                                        }}
                                    />

                                    <TouchableOpacity
                                        onPress={() => handleRemoveLooseItem(item.id)}
                                        className={cls.btn.icon}
                                    >
                                        <Trash size={20} color={colors.placeholder} />
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>
                </Card>

                {/* Buttons */}
                <View className="pt-4 space-y-3">
                    <TouchableOpacity
                        onPress={handleCalculateClick}
                        className={cls.btn.primary}
                    >
                        <Text className={cls.btn.primaryText}>Calculate</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={clearField}
                        className={`mt-4 ${cls.btn.primary1}`}
                    >
                        <Text className={cls.btn.primaryText}>Clear Field</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}
