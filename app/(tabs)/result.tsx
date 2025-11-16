
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Archive, ArrowLeft } from 'lucide-react-native';
import { useAppContext } from '../../context/AppContext';
import { cls, Card, colors } from '../theme';
import type { Calculation } from '../../types';

const ResultDisplay: React.FC<{ result: Calculation; itemId: string }> = ({ result, itemId }) => {
    return (
        <Card>
            <View className={cls.result.header}>
                <Text className={cls.cardTitle}>Calculation Result</Text>
                <Text className={cls.result.subtitle}>
                    Item ID: <Text className={cls.result.itemId}>{itemId || 'N/A'}</Text>
                </Text>
            </View>
            <View className="space-y-4">
                <View className={cls.result.row}>
                    <Text className={cls.result.label}>Requested:</Text>
                    <Text className={`${cls.result.value} text-blue-600`}>{result.requested.toLocaleString()}</Text>
                </View>
                <View className={cls.result.row}>
                    <Text className={cls.result.label}>Total Fulfilled:</Text>
                    <Text className={`${cls.result.value} ${result.totalFulfilled < result.requested ? 'text-orange-600' : 'text-green-600'}`}>
                        {result.totalFulfilled.toLocaleString()}
                    </Text>
                </View>
                <View className="border-t border-slate-200 my-3"/>
                <View className={cls.result.row}>
                    <Text className={cls.result.label}>Full Items to Give:</Text>
                    <Text className={cls.result.valueLg}>{result.fullItems.toLocaleString()}</Text>
                </View>

                {result.breakdown.length > 0 && (
                    <View className={cls.result.breakdownBox}>
                        <Text className={cls.result.breakdownText}>
                            {result.breakdown.join(' + ')}
                        </Text>
                    </View>
                )}
            </View>
        </Card>
    );
};

export default function ResultScreen() {
    const router = useRouter();
    const { result, lastItemId } = useAppContext();

    return (
        <ScrollView className={cls.screen} contentContainerStyle={{ padding: 16 }}>
            <View className={cls.container}>
                <TouchableOpacity onPress={() => router.back()} className={cls.btn.link}>
                    <ArrowLeft size={25} color={colors.textSecondary} />
                    <Text className={cls.btn.linkText}>Return </Text>
                </TouchableOpacity>
                {result ? (
                    <ResultDisplay result={result} itemId={lastItemId} />
                ) : (
                    <Card>
                        <View className={cls.history.emptyContainer}>
                            <Archive size={48} color={colors.placeholder} />
                            <Text className={cls.history.emptyTitle}>No Result to Display</Text>
                            <Text className={cls.history.emptySubtitle}>Run a calculation on the 'Calculator' tab.</Text>
                        </View>
                    </Card>
                )}
            </View>
        </ScrollView>
    );
}