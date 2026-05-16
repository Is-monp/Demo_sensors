import React from 'react';
import { StyleSheet } from 'react-native';
import { Appbar, Surface, Text } from 'react-native-paper';
import { useAuth } from '../auth/presentation/context/authContext';


export default function SettingScreen() {
    const { logout } = useAuth();
    return (
        <Surface style={styles.container}>
            <Appbar.Header>
                <Appbar.Content title="Profile" />
                <Appbar.Action
                    icon="logout"
                    onPress={() => {
                        logout();
                    }}
                />
            </Appbar.Header>
            <Surface style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>Profile settings...</Text>
            </Surface>

        </Surface>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
