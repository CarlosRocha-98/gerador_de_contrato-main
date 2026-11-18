import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "@/context/AuthContext";
import { colors } from "@/theme/colors";

export function RegisterScreen() {
  const navigation = useNavigation<any>();
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    nome: "",
    cpf: "",
    telefone: "",
    nacionalidade: "",
    profissao: "",
    estado_civil: "",
    rg: "",
    orgao_expedidor: "",
    rua: "",
    numero: "",
    bairro: "",
    cep: "",
    cidade: "",
    estado: "",
    password: "",
    confirmPassword: "",
  });

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async () => {
    if (
      !form.email.trim() ||
      !form.password.trim() ||
      !form.confirmPassword.trim()
    ) {
      Alert.alert("Atenção", "Preencha os campos obrigatórios.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      Alert.alert("Atenção", "A confirmação de senha não confere.");
      return;
    }

    const email = form.email.trim().toLowerCase();
    const username = email;

    setLoading(true);
    try {
      await auth.signUp({
        username,
        email,
        password: form.password,
        nome: form.nome.trim(),
        cpf: form.cpf.trim(),
        telefone: form.telefone.trim(),
        nacionalidade: form.nacionalidade.trim(),
        profissao: form.profissao.trim(),
        estado_civil: form.estado_civil.trim(),
        rg: form.rg.trim(),
        orgao_expedidor: form.orgao_expedidor.trim(),
        rua: form.rua.trim(),
        numero: form.numero.trim(),
        bairro: form.bairro.trim(),
        cep: form.cep.trim(),
        cidade: form.cidade.trim(),
        estado: form.estado.trim().toUpperCase(),
      });
      Alert.alert(
        "Cadastro concluído",
        "Agora você pode entrar com seu usuário e senha.",
      );
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Erro ao cadastrar", getRegisterErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <ImageBackground
        source={require("../../assets/images/background-home.jpg")}
        resizeMode="cover"
        style={styles.background}
      >
        <View style={styles.overlay} />

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.brand}>Contrato S.A.</Text>
            <Text style={styles.subtitle}>Crie sua conta</Text>
            <Text style={styles.description}>
              Preencha os dados abaixo para começar
            </Text>
          </View>

          <View style={styles.formWrap}>
            <DarkField
              label="E-mail"
              icon="mail-outline"
              value={form.email}
              onChangeText={(text) => update("email", text)}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <DarkField
              label="Nome completo"
              icon="person-outline"
              value={form.nome}
              onChangeText={(text) => update("nome", text)}
            />
            <DarkField
              label="CPF"
              icon="card-outline"
              value={form.cpf}
              onChangeText={(text) => update("cpf", text)}
              keyboardType="numeric"
            />
            <DarkField
              label="Telefone"
              icon="call-outline"
              value={form.telefone}
              onChangeText={(text) => update("telefone", text)}
              keyboardType="phone-pad"
            />
            <DarkField
              label="Nacionalidade"
              icon="flag-outline"
              value={form.nacionalidade}
              onChangeText={(text) => update("nacionalidade", text)}
            />
            <DarkField
              label="Profissão"
              icon="briefcase-outline"
              value={form.profissao}
              onChangeText={(text) => update("profissao", text)}
            />
            <DarkField
              label="Estado Civil"
              icon="people-outline"
              value={form.estado_civil}
              onChangeText={(text) => update("estado_civil", text)}
            />
            <DarkField
              label="RG"
              icon="document-text-outline"
              value={form.rg}
              onChangeText={(text) => update("rg", text)}
            />
            <DarkField
              label="Orgão expedidor"
              icon="business-outline"
              value={form.orgao_expedidor}
              onChangeText={(text) => update("orgao_expedidor", text)}
            />
            <DarkField
              label="Rua"
              icon="home-outline"
              value={form.rua}
              onChangeText={(text) => update("rua", text)}
            />
            <DarkField
              label="Número"
              icon="pin-outline"
              value={form.numero}
              onChangeText={(text) => update("numero", text)}
              keyboardType="numeric"
            />
            <DarkField
              label="Bairro"
              icon="map-outline"
              value={form.bairro}
              onChangeText={(text) => update("bairro", text)}
            />
            <DarkField
              label="Cep"
              icon="mail-open-outline"
              value={form.cep}
              onChangeText={(text) => update("cep", text)}
              keyboardType="numeric"
            />
            <DarkField
              label="Cidade"
              icon="location-outline"
              value={form.cidade}
              onChangeText={(text) => update("cidade", text)}
            />
            <DarkField
              label="Estado (UF)"
              icon="navigate-outline"
              value={form.estado}
              onChangeText={(text) => update("estado", text)}
              autoCapitalize="characters"
              maxLength={2}
            />
            <DarkField
              label="Senha"
              icon="lock-closed-outline"
              value={form.password}
              onChangeText={(text) => update("password", text)}
              secureTextEntry
            />
            <DarkField
              label="Confirmar senha"
              icon="lock-closed-outline"
              value={form.confirmPassword}
              onChangeText={(text) => update("confirmPassword", text)}
              secureTextEntry
            />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cadastrar"
            onPress={handleSubmit}
            disabled={loading}
            style={({ pressed }) => [
              styles.primaryButton,
              (pressed || loading) && styles.primaryButtonPressed,
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonLabel}>Cadastrar</Text>
            )}
          </Pressable>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Já tem uma conta?</Text>
            <Pressable onPress={() => navigation.goBack()}>
              <Text style={styles.footerAction}>Entrar</Text>
            </Pressable>
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

function getRegisterErrorMessage(error: any) {
  const message = String(error?.message || "").toLowerCase();

  if (
    error?.code === "ECONNABORTED" ||
    message.includes("network error") ||
    message.includes("timeout") ||
    !error?.response
  ) {
    return "Falha de conexão com a API. Verifique se o backend está rodando e se o EXPO_PUBLIC_API_URL está correto.";
  }

  const data = error?.response?.data;

  if (!data) {
    return "Não foi possível concluir o cadastro.";
  }

  if (typeof data === "string") {
    return data;
  }

  if (typeof data?.detail === "string") {
    return data.detail;
  }

  const fieldLabels: Record<string, string> = {
    username: "Usuário",
    email: "E-mail",
    password: "Senha",
    nome: "Nome",
    cpf: "CPF",
    telefone: "Telefone",
    nacionalidade: "Nacionalidade",
    profissao: "Profissão",
    estado_civil: "Estado civil",
    rg: "RG",
    orgao_expedidor: "Orgão expedidor",
    rua: "Rua",
    numero: "Número",
    bairro: "Bairro",
    cep: "CEP",
    cidade: "Cidade",
    estado: "Estado (UF)",
  };

  const messages = Object.entries(data)
    .map(([field, value]) => {
      const label = fieldLabels[field] || field;
      if (Array.isArray(value) && value.length > 0) {
        return `${label}: ${String(value[0])}`;
      }
      if (typeof value === "string") {
        return `${label}: ${value}`;
      }
      return null;
    })
    .filter(Boolean);

  if (messages.length > 0) {
    return messages.join("\n");
  }

  return "Não foi possível concluir o cadastro.";
}

type DarkFieldProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "numeric" | "phone-pad" | "email-address";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  maxLength?: number;
};

function DarkField({
  label,
  icon,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  maxLength,
}: DarkFieldProps) {
  const [isHidden, setIsHidden] = useState(Boolean(secureTextEntry));

  return (
    <View style={styles.fieldWrap}>
      <View style={styles.fieldInputWrap}>
        <Ionicons
          name={icon}
          size={20}
          color="rgba(214, 221, 235, 0.92)"
          style={styles.fieldLeftIcon}
        />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry ? isHidden : false}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          placeholder={label}
          placeholderTextColor="rgba(214, 221, 235, 0.6)"
          style={styles.fieldInput}
        />

        {secureTextEntry ? (
          <Pressable
            onPress={() => setIsHidden((current) => !current)}
            hitSlop={8}
            style={styles.fieldRightIconButton}
          >
            <Ionicons
              name={isHidden ? "eye-outline" : "eye-off-outline"}
              size={20}
              color="rgba(214, 221, 235, 0.92)"
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  background: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(16, 27, 58, 0.84)",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 54,
    paddingBottom: 30,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  brand: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: -1.4,
    textShadowColor: "rgba(0, 0, 0, 0.32)",
    textShadowOffset: { width: 0, height: 6 },
    textShadowRadius: 18,
  },
  subtitle: {
    marginTop: 8,
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
  },
  description: {
    marginTop: 6,
    color: "rgba(229, 231, 235, 0.92)",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  formWrap: {
    marginTop: 8,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "rgba(8, 25, 58, 0.4)",
    borderWidth: 1,
    borderColor: "rgba(138, 155, 190, 0.24)",
    gap: 10,
  },
  fieldWrap: {
    gap: 0,
  },
  fieldInputWrap: {
    minHeight: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(143, 161, 197, 0.22)",
    backgroundColor: "rgba(18, 39, 79, 0.66)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  fieldLeftIcon: {
    marginRight: 10,
  },
  fieldRightIconButton: {
    marginLeft: 8,
    padding: 2,
  },
  fieldInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    paddingVertical: 12,
  },
  primaryButton: {
    marginTop: 18,
    alignSelf: "center",
    minWidth: 164,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#EF4262",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    shadowColor: "#EF4262",
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  primaryButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.95,
  },
  primaryButtonLabel: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  footerRow: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  footerText: {
    color: "rgba(229, 231, 235, 0.85)",
    fontSize: 15,
  },
  footerAction: {
    color: "#EF4262",
    fontSize: 15,
    fontWeight: "700",
  },
});
