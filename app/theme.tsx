
import React from 'react';
import { View, Text, TextInput, ViewProps, TextInputProps } from 'react-native';

// ======= PALETTE =======
export const colors = {
    bgScreen: '#0E1B48', // slate-100
    bgCard: '#1b1b1b',
    textPrimary: '#F6FAFD', // slate-800
    textSecondary: '#a4133c', // slate-600
    textMuted: '#64748b', // slate-500
    placeholder: '#94a3b8', // slate-400
    border: '#0E1F2F', // slate-300
    brandPrimary: '#a4133c', // blue-600
    brandSecondary: '#eff6ff', // blue-50
    danger: '#dc2626', // red-600
    tabActive: '#a4133c',
    tabInactive: '#383838',
    azure : '#ffffff',
};

// ======= COMMON TAB OPTIONS (for Expo Router) =======
export const commonTabs = {
    headerShown: true,
    headerTitleAlign: 'center' as const,
    headerStyle: { backgroundColor: colors.azure },
    headerTitleStyle: {
        color: colors.tabActive,
        fontWeight: 'bold' as const,
        fontFamily: 'MontserratBold',
    },
    tabBarActiveTintColor: colors.tabActive,
    tabBarInactiveTintColor: colors.tabInactive,
    tabBarStyle: {
        backgroundColor: colors.bgCard,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        height: 60,
        paddingTop: 5,
        paddingBottom: 25,
    },
    tabBarLabelStyle: {
        fontSize: 8,
        fontWeight: '600' as const,
    },
} as const;

export const makeTabIcon =
    (Icon: React.ComponentType<{ color?: string; size?: number }>) =>
        ({ color, size }: { color: string; size: number }) => (
            <Icon color={color} size={size * 1.2} />
        );

// ======= UTILITY CLASSNAMES (for NativeWind) =======
// Note: NativeWind setup is assumed for these classNames to work.
export const cls = {
    // layout
    screen: `flex-1 bg-white`,
    main: `flex-1 p-4`,
    container: `space-y-6`,

    // Card
    card: `bg-[#E9E9E9] rounded-xl shadow-md p-8 mt-4 `,
    cardTitle: `text-xl font-mono font-bold text-slate-900 text-center`,
    cardHeader: `flex-row justify-between items-center mb-4`,

    // Typography
    label: `text-sm font-medium text-slate-600 mb-1`,

    // Inputs & Forms
    input: `w-full px-4 py-3 text-base text-slate-800 bg-white border border-slate-300 rounded-lg`,
    form: {
        group: `space-y-4`,
        checkboxContainer: `flex-row items-center pt-2`,
        checkboxLabel: `ml-3 text-sm font-medium text-slate-800`,
        looseItemsContainer: `space-y-8 max-h-60 `,
        looseItemRow: `flex-row items-center gap-2 py-1`,
        looseItemIndex: `text-sm font-medium text-slate-800 w-8 `,
        looseItemInput: `flex-1 px-3 py-2 text-sm text-slate-800 bg-white border border-slate-300 rounded-md`,
        looseItemsEmpty: `text-center py-6 border-2 border-dashed border-slate-200 rounded-lg`,
    },

    // Buttons
    btn: {
        primary: `w-full bg-[#e9204f] rounded-lg py-4 shadow-lg `,
        primary1: `w-full bg-[#1b1b1b] rounded-lg py-4 shadow-lg `,
        primaryText: `text-white text-center font-bold text-base`,
        secondary: `flex-row items-center gap-1.5 text-red px-3 py-2 rounded-lg`,
        secondaryText: `text-sm text-black font-semibold`,
        danger: `p-3 bg-white border border-slate-300 rounded-lg`,
        icon: `p-2`,
        iconBlue: `p-2 bg-[#e9204f] rounded-full`,
        link: `flex-row items-center gap-2`,
        linkText: `text-sm text-slate-600 font-semibold`,
    },

    // Result Display
    result: {
        header: `border-b border-slate-200 pb-4 mb-4`,
        subtitle: `text-sm font-medium text-slate-500 mt-1`,
        itemId: `font-mono bg-slate-200 px-2 py-8 font-200`,
        row: `flex-row justify-between items-center`,
        label: `font-medium text-base text-slate-700`,
        value: `font-bold text-lg`,
        valueLg: `font-bold text-2xl text-slate-900`,
        breakdownBox: `text-center bg-slate-50 p-4 rounded-lg mt-4`,
        breakdownText: `text-xl font-mono text-slate-800 tracking-wider`,
    },

    // History Display
    history: {
        emptyContainer: `text-center py-16 items-center`,
        emptyIcon: `h-12 w-12 text-slate-400`,
        emptyTitle: `mt-4 text-lg font-semibold text-slate-800`,
        emptySubtitle: `mt-2 text-sm text-slate-600`,
        searchContainer: `relative flex-1`,
        searchInput: `w-full pl-10 pr-4 py-3 text-slate-800 bg-white border border-slate-300 rounded-lg`,
        item: {
            container: `relative group !p-0 overflow-hidden `,
            actions: `absolute top-4 right-4 flex-row items-center gap-2`,
            header: `bg-shBlack px-6 py-4 border-b border-slate-200 `,
            title: `text-xl font-bold text-myred pr-20`,
            meta: `flex-row items-center gap-2 text-xs text-slate-600 mt-1`,
            body: `p-6`,
            grid: `flex-row flex-wrap`,
            gridItem: `w-1/2 pb-2`,
            breakdown: `text-s font-mono text-black bg-grey p-2 rounded-md text-center mt-4`,
        }
    }
};

// --- REUSABLE NATIVE COMPONENTS ---
export const Card: React.FC<ViewProps> = ({ children, className, ...props }) => (
    <View className={`${cls.card} ${className || ''}`} {...props}>
        {children}
    </View>
);

type InputGroupProps = TextInputProps & {
    label: string;
};

export const InputGroup: React.FC<InputGroupProps> = ({ label, ...props }) => (
    <View>
        <Text className={cls.label}>{label}</Text>
        <TextInput
            className={cls.input}
            placeholderTextColor={colors.placeholder}
            keyboardType="numeric"
            {...props}
        />
    </View>
);
