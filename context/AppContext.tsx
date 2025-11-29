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
} from '../types';

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

const HISTORY_STORAGE_KEY = '@storehand_history_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
                                                                         children,
                                                                     }) => {
    const [result, setResult] = useState<Calculation | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [lastItemId, setLastItemId] = useState('');
    const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);

    // 🔹 Load history once when app starts
    useEffect(() => {
        const loadHistory = async () => {
            try {
                const stored = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
                if (stored) {
                    const parsed: HistoryEntry[] = JSON.parse(stored);
                    setHistory(parsed);
                }
            } catch (err) {
                console.warn('Failed to load history from storage', err);
            } finally {
                setIsHistoryLoaded(true);
            }
        };

        loadHistory();
    }, []);

    // 🔹 Save history whenever it changes (after initial load)
    useEffect(() => {
        if (!isHistoryLoaded) return;
        const saveHistory = async () => {
            try {
                await AsyncStorage.setItem(
                    HISTORY_STORAGE_KEY,
                    JSON.stringify(history)
                );
            } catch (err) {
                console.warn('Failed to save history to storage', err);
            }
        };
        saveHistory();
    }, [history, isHistoryLoaded]);

    const handleCalculate = useCallback((inputs: CalculatorState) => {
        const {
            id, // optional: if present, update existing history entry
            itemId,
            quantityWanted,
            quantityPerItem,
            looseItems,
            calculateExactRemainder,
        } = inputs;

        const wanted = parseInt(quantityWanted, 10);
        let remainingQtyNeeded = wanted;

        // --- Loose items first ---
        const looseItemsUsed: { originalQty: number; takenQty: number }[] = [];
        const looseItemsBreakdown: string[] = [];

        const sortedLooseItems = [...looseItems]
            .map((item) => ({
                ...item,
                quantity: parseInt(String(item.quantity), 10) || 0,
            }))
            .filter((item) => item.quantity > 0)
            .sort((a, b) => a.quantity - b.quantity);

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

        // --- multiple pack sizes (or none) ---
        // quantityPerItem can be "", "0", "500" or "500,389,272"
        const packSizes = quantityPerItem
            .split(',')
            .map((s) => parseInt(s.trim(), 10))
            .filter((n) => !isNaN(n) && n > 0);

        let fullItems = 0;
        const fullItemsBreakdown: string[] = [];
        const remainderBreakdown: string[] = [];
        let fulfilledFromInventory = 0;

        if (remainingQtyNeeded > 0 && packSizes.length > 0) {
            const sortedPacks = [...packSizes].sort((a, b) => b - a); // big → small
            const packUsage: { size: number; count: number }[] = [];
            let needed = remainingQtyNeeded;

            if (calculateExactRemainder) {
                // No over-supply: use as many packs as possible, keep remainder
                for (const size of sortedPacks) {
                    if (needed <= 0) break;
                    const count = Math.floor(needed / size);
                    if (count > 0) {
                        packUsage.push({ size, count });
                        needed -= count * size;
                    }
                }

                if (needed > 0) {
                    remainderBreakdown.push(
                        `(Remainder) 1 x ${needed.toLocaleString()}`
                    );
                }

                // For your app we still treat remainingQtyNeeded as fulfilled from inventory
                fulfilledFromInventory = remainingQtyNeeded;
            } else {
                // Allow over-supply: cover at least the remaining quantity
                for (const size of sortedPacks) {
                    if (needed <= 0) break;
                    const count = Math.floor(needed / size);
                    if (count > 0) {
                        packUsage.push({ size, count });
                        needed -= count * size;
                    }
                }

                if (needed > 0) {
                    const smallest = sortedPacks[sortedPacks.length - 1];
                    const extraCount = Math.ceil(needed / smallest);
                    packUsage.push({ size: smallest, count: extraCount });
                    needed -= extraCount * smallest;
                }

                fulfilledFromInventory = packUsage.reduce(
                    (sum, p) => sum + p.size * p.count,
                    0
                );
            }

            fullItems = packUsage.reduce((sum, p) => sum + p.count, 0);
            for (const p of packUsage) {
                fullItemsBreakdown.push(
                    `${p.count.toLocaleString()} x ${p.size.toLocaleString()}`
                );
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

        const entryId = id ?? Date.now(); // reuse same id when editing

        const updatedEntry: HistoryEntry = {
            id: entryId,
            itemId,
            quantityWanted,
            quantityPerItem,
            looseItems,
            calculateExactRemainder,
            result: calculationResult,
            timestamp: new Date().toLocaleString(),
        };

        setHistory((prev) =>
            id == null
                ? [updatedEntry, ...prev] // new → add to top
                : prev.map((h) => (h.id === id ? updatedEntry : h)) // edit → replace
        );
    }, []);

    const handleRerun = (_entry: HistoryEntry) => {
        // navigation handled in screens via router + params
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
                        } catch (err) {
                            console.warn('Failed to clear history from storage', err);
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
