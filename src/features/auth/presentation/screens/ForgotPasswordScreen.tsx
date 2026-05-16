import React, { useState } from "react";
import { Keyboard, StyleSheet, View } from "react-native";
import { Button, HelperText, IconButton, Snackbar, Surface, Text, TextInput } from "react-native-paper";
import { useAuth } from "../context/authContext";

export default function ForgotPasswordScreen({ navigation }: { navigation: any }) {
    const { forgotPassword, error, clearError } = useAuth();

    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState<string | undefined>();
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const validate = (): boolean => {
        const trimmed = email.trim();
        if (!trimmed) {
            setEmailError("Please enter your email");
            return false;
        } else if (!trimmed.includes("@")) {
            setEmailError("Please enter a valid email address");
            return false;
        }
        setEmailError(undefined);
        return true;
    };

    const handleSubmit = async () => {
        Keyboard.dismiss();
        if (!validate()) return;

        setLoading(true);
        await forgotPassword(email.trim()).finally(() => setLoading(false));

        if (!error) setSuccessMessage(`Password reset link sent to ${email.trim()}`);
    };

    return (
        <Surface style={styles.surface}>

            {/* ✅ AppBar-like back button */}
            <View style={styles.header}>
                <IconButton
                    icon="arrow-left"
                    size={24}
                    onPress={() => navigation.goBack()}
                />
            </View>

            <View style={styles.content}>
                <Text variant="headlineSmall" style={styles.title}>
                    Enter your email to reset password
                </Text>

                {/* EMAIL */}
                <TextInput
                    label="Email address"
                    value={email}
                    onChangeText={(v) => {
                        setEmail(v);
                        if (emailError) setEmailError(undefined);
                    }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    error={!!emailError}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                    style={styles.input}
                />
                <HelperText type="error" visible={!!emailError}>
                    {emailError}
                </HelperText>

                <Button
                    mode="contained-tonal"
                    onPress={handleSubmit}
                    loading={loading}
                    disabled={loading}
                    style={styles.button}
                >
                    Send Reset Link
                </Button>
            </View>

            {/* SUCCESS SNACKBAR */}
            <Snackbar
                visible={!!successMessage}
                onDismiss={() => {
                    setSuccessMessage(null);
                    navigation.goBack();
                }}
                duration={3000}
                action={{
                    label: "OK",
                    onPress: () => {
                        setSuccessMessage(null);
                        navigation.goBack();
                    },
                }}
            >
                {successMessage}
            </Snackbar>

            {/* ERROR SNACKBAR */}
            <Snackbar
                visible={!!error}
                onDismiss={clearError}
                duration={3000}
                action={{ label: "Dismiss", onPress: clearError }}
            >
                {error}
            </Snackbar>
        </Surface>
    );
}

const styles = StyleSheet.create({
    surface: {
        flex: 1,
    },
    header: {
        paddingTop: 8,
        paddingHorizontal: 4,
    },
    content: {
        flex: 1,
        justifyContent: "center",
        padding: 20,
    },
    title: {
        textAlign: "center",
        marginBottom: 20,
    },
    input: {
        marginBottom: 4,
    },
    button: {
        marginTop: 12,
    },
});
