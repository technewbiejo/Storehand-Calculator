
import React, { createContext, useState, useCallback, useContext } from 'react';
import { Alert } from 'react-native';
import type { LooseItem, Calculation, HistoryEntry, CalculatorState } from '../types';

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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [result, setResult] = useState<Calculation | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [lastItemId, setLastItemId] = useState('');

    const handleCalculate = useCallback((inputs: CalculatorState) => {
        const { itemId, quantityWanted, quantityPerItem, looseItems, calculateExactRemainder } = inputs;

        const wanted = parseInt(quantityWanted, 10);
        const perItem = parseInt(quantityPerItem, 10);

        let remainingQtyNeeded = wanted;
        const looseItemsUsed: { originalQty: number; takenQty: number }[] = [];
        const looseItemsBreakdown: string[] = [];

        const sortedLooseItems = [...looseItems]
            .map(item => ({...item, quantity: parseInt(String(item.quantity), 10) || 0 }))
            .filter(item => item.quantity > 0)
            .sort((a, b) => a.quantity - b.quantity);

        for (const looseItem of sortedLooseItems) {
            if (remainingQtyNeeded <= 0) break;
            const qtyToTake = Math.min(remainingQtyNeeded, looseItem.quantity);
            looseItemsUsed.push({ originalQty: looseItem.quantity, takenQty: qtyToTake });
            looseItemsBreakdown.push(`1 x ${qtyToTake.toLocaleString()}`);
            remainingQtyNeeded -= qtyToTake;
        }

        let fullItems = 0;
        const fullItemsBreakdown: string[] = [];
        const remainderBreakdown: string[] = [];
        let fulfilledFromInventory = 0;

        if (remainingQtyNeeded > 0) {
            if (calculateExactRemainder) {
                const numFullItems = Math.floor(remainingQtyNeeded / perItem);
                if (numFullItems > 0) {
                    fullItemsBreakdown.push(`${numFullItems.toLocaleString()} x ${perItem.toLocaleString()}`);
                }
                const remainder = remainingQtyNeeded % perItem;
                if (remainder > 0) {
                    remainderBreakdown.push(`(Remainder) 1 x ${remainder.toLocaleString()}`);
                }
                fullItems = numFullItems;
                fulfilledFromInventory = remainingQtyNeeded;
            } else {
                const numFullItems = Math.ceil(remainingQtyNeeded / perItem);
                if (numFullItems > 0) {
                    fullItemsBreakdown.push(`${numFullItems.toLocaleString()} x ${perItem.toLocaleString()}`);
                }
                fullItems = numFullItems;
                fulfilledFromInventory = numFullItems * perItem;
            }
        }

        const breakdown = [...looseItemsBreakdown, ...fullItemsBreakdown, ...remainderBreakdown].filter(Boolean);
        const totalFulfilled = looseItemsUsed.reduce((sum, item) => sum + item.takenQty, 0) + fulfilledFromInventory;

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
            timestamp: new Date().toLocaleString()
        };
        setHistory(prev => [newHistoryEntry, ...prev]);
        // Navigation is handled by the component
    }, []);

    // handleRerun is handled by navigation params in Expo Router
    const handleRerun = (entry: HistoryEntry) => {
        // This function will be called from the history screen
        // to navigate back to the calculator with initial state.
        // The actual navigation happens in the component.
    };

    const handleDeleteHistory = useCallback((id: number) => {
        setHistory(prev => prev.filter(entry => entry.id !== id));
    }, [history]);

    const handleClearHistory = useCallback(() => {
        Alert.alert(
            "Clear All History",
            "Are you sure you want to clear all history? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Clear", style: "destructive", onPress: () => setHistory([]) }
            ]
        );
    }, []);

    return (
        <AppContext.Provider value={{ result, history, lastItemId, handleCalculate, handleRerun, handleDeleteHistory, handleClearHistory }}>
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
