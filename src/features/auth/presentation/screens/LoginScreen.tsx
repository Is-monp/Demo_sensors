import React, { useRef, useState } from "react";
import { Keyboard, TextInput as RNTextInput, View } from "react-native";
import { Button, HelperText, Snackbar, Surface, Text, TextInput } from "react-native-paper";
import { useAuth } from "../context/authContext";

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginScreen({ navigation }: { navigation: any }) {
  const { login, error, clearError } = useAuth();

  const [email, setEmail] = useState("a@a.com");
  const [password, setPassword] = useState("ThePassword!1");
  const [obscurePassword, setObscurePassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const passwordRef = useRef<RNTextInput>(null);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    const trimmedEmail = email.trim();

    console.log('validating email:', email);

    if (!trimmedEmail) {
      newErrors.email = "Enter email";
    } else if (!trimmedEmail.includes("@")) {
      newErrors.email = "Enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Enter password";
    } else if (password.length < 6) {
      newErrors.password = "Password should have at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();
    if (!validate()) return;

    try {
      setLoading(true);
      await login(email.trim(), password);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Surface testID="login-screen" style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text variant="headlineMedium" style={{ marginBottom: 20, textAlign: "center" }}>
        Welcome! Please log in
      </Text>

      {/* EMAIL */}
      <TextInput
        testID="email-input"
        label="Email"
        value={email}
        onChangeText={(v) => {
          setEmail(v);
          if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
        }}
        autoCapitalize="none"
        keyboardType="email-address"
        error={!!errors.email}
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        style={{ marginBottom: 4 }}
      />
      <HelperText type="error" visible={!!errors.email}>
        {errors.email}
      </HelperText>

      {/* PASSWORD */}
      <TextInput
        testID="password-input"
        ref={passwordRef}
        label="Password"
        value={password}
        onChangeText={(v) => {
          setPassword(v);
          if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
        }}
        secureTextEntry={obscurePassword}
        right={
          <TextInput.Icon
            icon={obscurePassword ? "eye-outline" : "eye-off-outline"}
            onPress={() => setObscurePassword((v) => !v)}
          />
        }
        error={!!errors.password}
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
        style={{ marginBottom: 4 }}
      />
      <HelperText type="error" visible={!!errors.password}>
        {errors.password}
      </HelperText>

      {/* FORGOT PASSWORD */}
      <View style={{ alignItems: "flex-end", marginBottom: 20 }}>
        <Button mode="text" compact onPress={() => navigation.navigate("ForgotPassword")}>
          Forgot password?
        </Button>
      </View>

      <Button
        testID="login-button"
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        disabled={loading}
        style={{ marginBottom: 10 }}
      >
        Log In
      </Button>

      <Button
        testID="create-account-button"
        mode="text" onPress={() => navigation.navigate("Signup")}>
        Don&apos;t have an account? Sign Up
      </Button>

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
