import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Trash, Search, RefreshCw, Clock, Archive } from 'lucide-react-native';
import { useAppContext } from '../../context/AppContext';
import type { HistoryEntry } from '../../types';
import { cls, colors, Card } from '../theme';

const StatItem: React.FC<{
    label: string;
    value: string | number;
    highlight?: boolean;
}> = ({ label, value, highlight }) => (
    <View className={cls.history.item.gridItem}>
        <Text>
            <Text className="font-medium text-slate-600">{label}: </Text>
            <Text
                className={
                    highlight
                        ? 'font-bold text-red-600'
                        : 'font-bold text-slate-800'
                }
            >
                {value}
            </Text>
        </Text>
    </View>
);

const HistoryItem: React.FC<{
    entry: HistoryEntry;
    onRerun: (entry: HistoryEntry) => void;
    onDelete: (id: number) => void;
}> = React.memo(({ entry, onRerun, onDelete }) => {
    const requested = parseInt(entry.quantityWanted, 10);
    const fulfilled = entry.result.totalFulfilled;
    const isUnder = fulfilled < requested;

    const qtyPerItemDisplay = entry.quantityPerItem?.trim()
        ? entry.quantityPerItem
        : '—';

    return (
        <Card className={cls.history.item.container}>
            {/* Header */}
            <View className={cls.history.item.header}>
                <Text className={cls.history.item.title}>
                    {entry.itemId || 'No Item ID'}
                </Text>
                <View className={cls.history.item.meta}>
                    <Clock size={14} color={colors.textSecondary} />
                    <Text className="text-xs text-slate-600">
                        {entry.timestamp}
                    </Text>
                </View>
            </View>

            {/* Body */}
            <View className={cls.history.item.body}>
                <View className={cls.history.item.grid}>
                    <StatItem
                        label="Requested"
                        value={requested.toLocaleString()}
                        highlight={isUnder}
                    />
                    <StatItem
                        label="Fulfilled"
                        value={fulfilled.toLocaleString()}
                        highlight={isUnder}
                    />
                    <StatItem
                        label="Full Items"
                        value={entry.result.fullItems.toLocaleString()}
                    />
                    <StatItem
                        label="Qty / Item"
                        value={qtyPerItemDisplay}
                    />
                </View>
                <Text className={cls.history.item.breakdown}>
                    {entry.result.breakdown.join(' + ') || 'N/A'}
                </Text>
                {isUnder && (
                    <Text className="mt-1 text-xs font-semibold text-red-600">
                        Not fully fulfilled.
                    </Text>
                )}
            </View>

            {/* Top-right action icons – rendered LAST so they sit on top */}
            <View className={cls.history.item.actions}>
                {/* Recalculate / Edit */}
                <TouchableOpacity
                    onPress={() => onRerun(entry)}
                    className={cls.btn.iconBlue}
                >
                    <RefreshCw size={16} color={colors.azure} />
                </TouchableOpacity>

                {/* Delete */}
                <TouchableOpacity
                    onPress={() => onDelete(entry.id)}
                    className={cls.btn.icon}
                >
                    <Trash size={18} color={colors.danger} />
                </TouchableOpacity>
            </View>
        </Card>
    );
});

export default function HistoryScreen() {
    const router = useRouter();
    const { history, handleDeleteHistory, handleClearHistory } =
        useAppContext();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredHistory = useMemo(() => {
        if (!searchQuery) return history;
        return history.filter((entry) =>
            entry.itemId.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [history, searchQuery]);

    const handleRerun = useCallback(
        (entry: HistoryEntry) => {
            router.push({
                pathname: './',
                params: { initialState: JSON.stringify(entry) },
            });
        },
        [router]
    );

    return (
        <View className={cls.screen}>
            <FlatList
                data={filteredHistory}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <HistoryItem
                        entry={item}
                        onRerun={handleRerun}
                        onDelete={handleDeleteHistory}
                    />
                )}
                contentContainerStyle={{ padding: 8, paddingBottom: 20 }}
                ListHeaderComponent={
                    history.length > 0 ? (
                        <View className="flex-row justify-between items-center gap-4 mb-4">
                            <View className={cls.history.searchContainer}>
                                <View className="absolute z-10 top-3 left-3">
                                    <Search
                                        size={20}
                                        color={colors.placeholder}
                                    />
                                </View>
                                <TextInput
                                    placeholder="Search by Item ID..."
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    className={cls.history.searchInput}
                                    placeholderTextColor={colors.placeholder}
                                />
                            </View>
                            <TouchableOpacity
                                onPress={handleClearHistory}
                                className={cls.btn.danger}
                            >
                                <Trash
                                    size={20}
                                    color={colors.textSecondary}
                                />
                            </TouchableOpacity>
                        </View>
                    ) : null
                }
                ListEmptyComponent={
                    <View className={cls.history.emptyContainer}>
                        <Archive
                            size={50}
                            color={colors.placeholder}
                        />
                        <Text className={cls.history.emptyTitle}>
                            History is Empty
                        </Text>
                        <Text className={cls.history.emptySubtitle}>
                            Your calculated results will appear here.
                        </Text>
                    </View>
                }
            />
        </View>
    );
}
