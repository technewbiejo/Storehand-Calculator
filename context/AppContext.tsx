import React, {
    createContext,
    useState,
    useCallback,
    useContext,
    useEffect,
} from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
    LooseItem,
    Calculation,
    HistoryEntry,
    CalculatorState,
} from './../types';

const HISTORY_STORAGE_KEY = '@calculator_history_v1';

interface AppContextType {
    result: Calculation | null;
    history: HistoryEntry[];
    lastItemId: string;
    handleCalculate: (inputs: CalculatorState) => void;
    handleRerun: (entry: HistoryEntry) => void;
    handleDeleteHistory: (id: number) => void;
    handleClearHistory: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
                                                                         children,
                                                                     }) => {
    const [result, setResult] = useState<Calculation | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [lastItemId, setLastItemId] = useState('');
    const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);

    // 🔹 Load history from storage when app starts
    useEffect(() => {
        const loadHistory = async () => {
            try {
                const stored = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
                if (stored) {
                    const parsed: HistoryEntry[] = JSON.parse(stored);
                    setHistory(parsed);
                }
            } catch (error) {
                console.warn('Failed to load history from storage', error);
            } finally {
                setIsHistoryLoaded(true);
            }
        };

        loadHistory();
    }, []);

    // 🔹 Save history to storage whenever it changes
    useEffect(() => {
        if (!isHistoryLoaded) return;

        const saveHistory = async () => {
            try {
                await AsyncStorage.setItem(
                    HISTORY_STORAGE_KEY,
                    JSON.stringify(history)
                );
            } catch (error) {
                console.warn('Failed to save history to storage', error);
            }
        };

        saveHistory();
    }, [history, isHistoryLoaded]);

    const handleCalculate = useCallback((inputs: CalculatorState) => {
        const {
            itemId,
            quantityWanted,
            quantityPerItem,
            looseItems,
            calculateExactRemainder,
        } = inputs;

        const wanted = parseInt(quantityWanted, 10);
        const perItem = parseInt(quantityPerItem, 10);

        let remainingQtyNeeded = wanted;
        const looseItemsUsed: { originalQty: number; takenQty: number }[] = [];
        const looseItemsBreakdown: string[] = [];

        // Sort loose items from smallest to largest usable quantity
        const sortedLooseItems = [...looseItems]
            .map((item) => ({
                ...item,
                quantity: parseInt(String(item.quantity), 10) || 0,
            }))
            .filter((item) => item.quantity > 0)
            .sort((a, b) => a.quantity - b.quantity);

        // Use loose items first
        for (const looseItem of sortedLooseItems) {
            if (remainingQtyNeeded <= 0) break;
            const qtyToTake = Math.min(remainingQtyNeeded, looseItem.quantity);
            looseItemsUsed.push({
                originalQty: looseItem.quantity,
                takenQty: qtyToTake,
            });
            looseItemsBreakdown.push(`1 x ${qtyToTake.toLocaleString()}`);
            remainingQtyNeeded -= qtyToTake;
        }

        let fullItems = 0;
        const fullItemsBreakdown: string[] = [];
        const remainderBreakdown: string[] = [];
        let fulfilledFromInventory = 0;

        // Then use full items
        if (remainingQtyNeeded > 0) {
            if (calculateExactRemainder) {
                const numFullItems = Math.floor(remainingQtyNeeded / perItem);
                if (numFullItems > 0) {
                    fullItemsBreakdown.push(
                        `${numFullItems.toLocaleString()} x ${perItem.toLocaleString()}`
                    );
                }
                const remainder = remainingQtyNeeded % perItem;
                if (remainder > 0) {
                    remainderBreakdown.push(
                        `(Remainder) 1 x ${remainder.toLocaleString()}`
                    );
                }
                fullItems = numFullItems;
                fulfilledFromInventory = remainingQtyNeeded;
            } else {
                const numFullItems = Math.ceil(remainingQtyNeeded / perItem);
                if (numFullItems > 0) {
                    fullItemsBreakdown.push(
                        `${numFullItems.toLocaleString()} x ${perItem.toLocaleString()}`
                    );
                }
                fullItems = numFullItems;
                fulfilledFromInventory = numFullItems * perItem;
            }
        }

        const breakdown = [
            ...looseItemsBreakdown,
            ...fullItemsBreakdown,
            ...remainderBreakdown,
        ].filter(Boolean);

        const totalFulfilled =
            looseItemsUsed.reduce((sum, item) => sum + item.takenQty, 0) +
            fulfilledFromInventory;

        const calculationResult: Calculation = {
            fullItems,
            looseItemsUsed,
            totalFulfilled,
            requested: wanted,
            breakdown,
        };

        setResult(calculationResult);
        setLastItemId(itemId);

        const newHistoryEntry: HistoryEntry = {
            id: Date.now(),
            itemId,
            quantityWanted,
            quantityPerItem,
            looseItems,
            calculateExactRemainder,
            result: calculationResult,
            timestamp: new Date().toLocaleString(),
        };

        setHistory((prev) => [newHistoryEntry, ...prev]);
    }, []);

    // Navigation is done in HistoryScreen; this just exists for typing API
    const handleRerun = (entry: HistoryEntry) => {
        // no-op here; History screen uses the data to navigate with params
    };

    const handleDeleteHistory = useCallback((id: number) => {
        setHistory((prev) => prev.filter((entry) => entry.id !== id));
    }, []);

    const handleClearHistory = useCallback(() => {
        Alert.alert(
            'Clear All History',
            'Are you sure you want to clear all history? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setHistory([]);
                            await AsyncStorage.removeItem(HISTORY_STORAGE_KEY);
                        } catch (error) {
                            console.warn('Failed to clear history', error);
                        }
                    },
                },
            ]
        );
    }, []);

    return (
        <AppContext.Provider
            value={{
                result,
                history,
                lastItemId,
                handleCalculate,
                handleRerun,
                handleDeleteHistory,
                handleClearHistory,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
