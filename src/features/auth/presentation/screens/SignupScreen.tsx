import React, { useRef, useState } from "react";
import { Keyboard, TextInput as RNTextInput } from "react-native";
import { Button, HelperText, Snackbar, Surface, Text, TextInput } from "react-native-paper";
import { useAuth } from "../context/authContext";

interface FormErrors {
  email?: string;
  password?: string;
}

export default function SignupScreen({ navigation }: { navigation: any }) {
  const { signup, error, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [obscurePassword, setObscurePassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const passwordRef = useRef<RNTextInput>(null);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    const trimmedEmail = email.trim();

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

    setLoading(true);
    await signup(email.trim(), password).finally(() => setLoading(false));
  };

  return (
    <Surface testID="signup-screen" style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text variant="headlineMedium" style={{ marginBottom: 20, textAlign: "center" }}>
        Create an Account
      </Text>

      {/* EMAIL */}
      <TextInput
        testID="signup-email-input"
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
      {errors.email && (
        <HelperText testID="signup-email-error" type="error" visible>
          {errors.email}
        </HelperText>
      )}

      {/* PASSWORD */}
      <TextInput
        testID="signup-password-input"
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
      {errors.password && (
        <HelperText testID="signup-password-error" type="error" visible>
          {errors.password}
        </HelperText>
      )}

      <Button
        testID="signup-button"
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        disabled={loading}
        style={{ marginBottom: 10, marginTop: 12 }}
      >
        Sign Up
      </Button>

      <Button
        testID="go-to-login-button"
        mode="text"
        onPress={() => navigation.goBack()}
      >
        Already have an account? Log In
      </Button>

      {/* ERROR SNACKBAR */}
      <Snackbar
        testID="signup-error-snackbar"
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
