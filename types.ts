export interface LooseItem {
    id: number;
    quantity: string | number;
}

export interface LooseItemUsage {
    originalQty: number;
    takenQty: number;
}

export interface Calculation {
    fullItems: number;
    looseItemsUsed: LooseItemUsage[];
    totalFulfilled: number;
    requested: number;
    breakdown: string[];
}

export interface HistoryEntry {
    id: number;
    itemId: string;
    // Storing inputs for re-run functionality
    quantityWanted: string;
    quantityPerItem: string;
    looseItems: LooseItem[];
    calculateExactRemainder: boolean;
    result: Calculation;
    timestamp: string;
}

export interface CalculatorState {
    itemId: string;
    quantityWanted: string;
    quantityPerItem: string;
    looseItems: LooseItem[];
    calculateExactRemainder: boolean;
}
