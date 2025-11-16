import React from 'react';
import { Slot } from 'expo-router';
import { AppProvider } from './context/AppContext';

export default function RootLayout() {
    return (
        <Slot />
    );
}
