import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/authContext";

interface FormErrors {
  email?: string;
  password?: string;
}

const C = {
  brand: "#1A1D6E",
  bg: "#EEEEF8",
  cardBg: "#FFFFFF",
  textPrimary: "#1A1A2E",
  textSecondary: "#6B6B8A",
  textMuted: "#9898B0",
  border: "#E0E0F0",
  error: "#D32F2F",
  errorBg: "#FFEBEE",
};

export default function LoginScreen({ navigation }: { navigation: any }) {
  const { login, error, clearError } = useAuth();

  const [email, setEmail] = useState("isabellapalencia@uninorte.edu.co");
  const [password, setPassword] = useState("Hola123.");
  const [obscurePassword, setObscurePassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const passwordRef = useRef<TextInput>(null);

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
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();
    clearError();
    if (!validate()) return;

    try {
      setLoading(true);
      await login(email.trim(), password);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} testID="login-screen">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoRow}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoLetter}>P</Text>
            </View>
            <Text style={styles.appName}>ParkSmart</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>

            {/* Global error */}
            {!!error && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{error}</Text>
              </View>
            )}

            {/* EMAIL */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                testID="email-input"
                style={[styles.input, !!errors.email && styles.inputError]}
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                placeholderTextColor={C.textMuted}
                placeholder="your@email.com"
              />
              {!!errors.email && (
                <Text style={styles.fieldError}>{errors.email}</Text>
              )}
            </View>

            {/* PASSWORD */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputRow, !!errors.password && styles.inputError]}>
                <TextInput
                  testID="password-input"
                  ref={passwordRef}
                  style={styles.inputInner}
                  value={password}
                  onChangeText={(v) => {
                    setPassword(v);
                    if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
                  }}
                  secureTextEntry={obscurePassword}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                  placeholderTextColor={C.textMuted}
                  placeholder="••••••••"
                />
                <TouchableOpacity
                  onPress={() => setObscurePassword((v) => !v)}
                  style={styles.eyeButton}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.eyeIcon}>{obscurePassword ? "👁" : "🙈"}</Text>
                </TouchableOpacity>
              </View>
              {!!errors.password && (
                <Text style={styles.fieldError}>{errors.password}</Text>
              )}
            </View>

            {/* Forgot password */}
            <TouchableOpacity
              style={styles.forgotRow}
              onPress={() => navigation.navigate("ForgotPassword")}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Login button */}
            <TouchableOpacity
              testID="login-button"
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>Log In</Text>
              )}
            </TouchableOpacity>

            {/* Sign up */}
            <TouchableOpacity
              testID="create-account-button"
              style={styles.signupRow}
              onPress={() => navigation.navigate("Signup")}
            >
              <Text style={styles.signupText}>
                Don't have an account?{" "}
                <Text style={styles.signupLink}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 32,
  },

  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 28,
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  logoLetter: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  appName: {
    fontSize: 22,
    fontWeight: "700",
    color: C.brand,
    letterSpacing: 0.3,
  },

  card: {
    backgroundColor: C.cardBg,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: C.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: C.textSecondary,
    marginBottom: 24,
  },

  errorBanner: {
    backgroundColor: C.errorBg,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    color: C.error,
    fontSize: 13,
    fontWeight: "500",
  },

  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: C.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: C.bg,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: C.textPrimary,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.bg,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  inputInner: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: C.textPrimary,
  },
  inputError: {
    borderColor: C.error,
  },
  eyeButton: {
    paddingHorizontal: 12,
  },
  eyeIcon: {
    fontSize: 16,
  },
  fieldError: {
    color: C.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },

  forgotRow: {
    alignItems: "flex-end",
    marginBottom: 24,
    marginTop: 4,
  },
  forgotText: {
    color: C.brand,
    fontSize: 13,
    fontWeight: "600",
  },

  loginButton: {
    backgroundColor: C.brand,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  signupRow: {
    alignItems: "center",
  },
  signupText: {
    fontSize: 14,
    color: C.textSecondary,
  },
  signupLink: {
    color: C.brand,
    fontWeight: "700",
  },
});
