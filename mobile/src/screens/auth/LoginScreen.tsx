
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import { useAuth } from "@/context/AuthContext";

const COLORS = {
  background: "#1a1a2e",
  surface: "#252b40",
  border: "rgba(255,255,255,0.15)",
  text: "#ffffff",
  muted: "#aaaabb",
  primary: "#e94560",
};

export function LoginScreen() {
  const navigation = useNavigation<any>();
  const auth = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Atenção", "Preencha e-mail e senha.");
      return;
    }

    setLoading(true);

    try {
      // Mantemos a chamada de autenticação já existente no projeto.
      await auth.signIn(username.trim(), password);
    } catch (error: any) {
      Alert.alert(
        "Erro ao entrar",
        error?.response?.data?.detail || "Confira seu e-mail e sua senha.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert(
      "Login com Google",
      "A autenticação com Google precisa ser integrada ao aplicativo.",
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              }
            }}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <Text style={styles.brand}>Contrato S.A.</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.heading}>
          <Text style={styles.title}>Bem-vindo de volta!</Text>
          <Text style={styles.subtitle}>Faça login para continuar</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>E-mail</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>✉</Text>
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              placeholderTextColor={COLORS.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={username}
              onChangeText={setUsername}
              returnKeyType="next"
            />
          </View>

          <Text style={styles.label}>Senha</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>♙</Text>
            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor={COLORS.muted}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={handleLogin}
              returnKeyType="done"
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              accessibilityRole="button"
              accessibilityLabel={
                showPassword ? "Ocultar senha" : "Mostrar senha"
              }
              hitSlop={10}
            >
              <Text style={styles.eyeIcon}>
                {showPassword ? "Ocultar" : "Ver"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.optionsRow}>
            <Pressable
              style={styles.rememberOption}
              onPress={() => setRememberMe(!rememberMe)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: rememberMe }}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe ? <Text style={styles.checkmark}>✓</Text> : null}
              </View>
              <Text style={styles.optionText}>Lembrar-me</Text>
            </Pressable>

            <Pressable
              onPress={() =>
                Alert.alert(
                  "Recuperar senha",
                  "A recuperação de senha ainda precisa ser integrada ao aplicativo.",
                )
              }
            >
              <Text style={styles.forgotText}>Esqueceu a senha?</Text>
            </Pressable>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              pressed && styles.buttonPressed,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleLogin}
            disabled={loading}
            accessibilityRole="button"
          >
            <Text style={styles.loginButtonText}>
              {loading ? "Entrando..." : "Entrar"}
            </Text>
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou continue com</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.googleButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleGoogleLogin}
            accessibilityRole="button"
          >
            <Text style={styles.googleLogo}>
              <Text style={{ color: "#4285F4" }}>G</Text>
            </Text>
            <Text style={styles.googleButtonText}>Entrar com Google</Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Não tem uma conta? </Text>
          <Pressable
            onPress={() => navigation.navigate("Register")}
            accessibilityRole="button"
          >
            <Text style={styles.registerText}>Cadastre-se</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 28,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 42,
  },
  backButton: {
    position: "absolute",
    left: 0,
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  backText: {
    color: COLORS.text,
    fontSize: 36,
  },
  brand: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: "700",
  },
  headerSpacer: {
    width: 40,
  },
  heading: {
    marginBottom: 30,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 15,
  },
  form: {
    width: "100%",
  },
  label: {
    color: "#ddddE8",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 54,
    paddingHorizontal: 14,
    marginBottom: 22,
  },
  inputIcon: {
    color: COLORS.muted,
    fontSize: 19,
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    paddingVertical: 14,
  },
  eyeIcon: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "600",
    paddingLeft: 8,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: -4,
    marginBottom: 26,
  },
  rememberOption: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 19,
    height: 19,
    borderWidth: 1,
    borderColor: COLORS.muted,
    borderRadius: 4,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
  },
  optionText: {
    color: "#ccccd6",
    fontSize: 12,
  },
  forgotText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  loginButton: {
    minHeight: 52,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  buttonPressed: {
    opacity: 0.82,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 25,
  },
  dividerLine: {
    height: 1,
    backgroundColor: COLORS.border,
    flex: 1,
  },
  dividerText: {
    color: COLORS.muted,
    fontSize: 12,
    marginHorizontal: 12,
  },
  googleButton: {
    minHeight: 52,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    borderColor: "#dadce0",
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  googleLogo: {
    fontSize: 21,
    fontWeight: "800",
  },
  googleButtonText: {
    color: "#3c4043",
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 34,
  },
  footerText: {
    color: COLORS.muted,
    fontSize: 13,
  },
  registerText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "800",
  },
});