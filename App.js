import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppNavigator from './src/navigation/AppNavigator';
import {
  requestNotificationPermissions,
  addNotificationListener,
  addNotificationResponseListener,
} from './src/services/notificationService';

export default function App() {
  useEffect(() => {
    // Request notification permissions on app start
    requestNotificationPermissions().catch(console.error);

    // Listen to incoming notifications
    const notifListener = addNotificationListener(notification => {
      console.log('Notification received:', notification.request.content.title);
    });

    // Listen to notification interactions
    const responseListener = addNotificationResponseListener(response => {
      console.log('Notification tapped:', response.notification.request.content.title);
    });

    return () => {
      notifListener.remove();
      responseListener.remove();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#1B5E20" />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
