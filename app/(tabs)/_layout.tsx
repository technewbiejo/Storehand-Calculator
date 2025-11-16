import React from 'react';
import { Tabs } from 'expo-router';
import '../global.css';
// FIX: Replaced `ClipboardDocumentListIcon` with `ClipboardListIcon` and `ArchiveBoxIcon` with `ArchiveIcon` to resolve import errors from 'lucide-react-native'.
import { CalculatorIcon, ClipboardListIcon, ArchiveIcon } from 'lucide-react-native';
import { commonTabs, makeTabIcon } from '../theme';
import { AppProvider } from '../../context/AppContext';

export default function TabLayout() {
    return (
        <AppProvider>
            <Tabs screenOptions={commonTabs}>
                <Tabs.Screen
                    name="index"
                    options={{
                        title: 'Calculator',
                        tabBarLabel: 'Calculator',
                        tabBarIcon: makeTabIcon(CalculatorIcon),
                    }}
                />
                <Tabs.Screen
                    name="result"
                    options={{
                        title: 'Result',
                        tabBarLabel: 'Result',
                        tabBarIcon: makeTabIcon(ClipboardListIcon),
                    }}
                />
                <Tabs.Screen
                    name="history"
                    options={{
                        title: 'History',
                        tabBarLabel: 'History',
                        tabBarIcon: makeTabIcon(ArchiveIcon),
                    }}
                />
            </Tabs>
        </AppProvider>
    );
}