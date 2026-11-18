import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, type ParamListBase } from "@react-navigation/native";
import type { NavigationProp } from "@react-navigation/native";

import { Button, Card, InputField, SectionTitle } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { updateProfile } from "@/services/auth";
import { colors, radius, spacing } from "@/theme/colors";

type IconName = keyof typeof Ionicons.glyphMap;

type MenuItem = {
  icon: IconName;
  title: string;
  subtitle: string;
  onPress: () => void;
};

export function Profile() {
  const auth = useAuth();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
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
  });

  useEffect(() => {
    if (auth.profile) {
      setForm({
        nome: auth.profile.nome || "",
        cpf: auth.profile.cpf || "",
        telefone: auth.profile.telefone || "",
        nacionalidade: auth.profile.nacionalidade || "",
        profissao: auth.profile.profissao || "",
        estado_civil: auth.profile.estado_civil || "",
        rg: auth.profile.rg || "",
        orgao_expedidor: auth.profile.orgao_expedidor || "",
        rua: auth.profile.rua || "",
        numero: auth.profile.numero || "",
        bairro: auth.profile.bairro || "",
        cep: auth.profile.cep || "",
        cidade: auth.profile.cidade || "",
        estado: auth.profile.estado || "",
      });
    }
  }, [auth.profile]);

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(form);
      await auth.reloadProfile();
      Alert.alert(
        "Perfil atualizado",
        "Os dados foram sincronizados com a API.",
      );
      setEditing(false);
    } catch (error: any) {
      Alert.alert(
        "Erro ao salvar",
        error?.response?.data?.detail || "Não foi possível atualizar o perfil.",
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmSignOut = () => {
    Alert.alert("Sair da conta", "Deseja realmente sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: () => void auth.signOut(),
      },
    ]);
  };

  const soon = (title: string) => () =>
    Alert.alert(title, "Disponível em breve.");

  const handleBack = () => {
    if (editing) {
      setEditing(false);
    } else {
      navigation.navigate("Início");
    }
  };

  const displayName = auth.profile?.nome || auth.profile?.username || "Usuário";

  const menu: MenuItem[] = [
    {
      icon: "person-outline",
      title: "Dados pessoais",
      subtitle: "Nome, e-mail, telefone e endereço",
      onPress: () => setEditing(true),
    },
    {
      icon: "lock-closed-outline",
      title: "Segurança",
      subtitle: "Alterar senha e autenticação",
      onPress: soon("Segurança"),
    },
    {
      icon: "document-text-outline",
      title: "Meus contratos",
      subtitle: "Histórico e documentos",
      onPress: () =>
        navigation.navigate("Contratos", { screen: "MeusContratos" }),
    },
    {
      icon: "notifications-outline",
      title: "Notificações",
      subtitle: "Preferências e alertas",
      onPress: soon("Notificações"),
    },
    {
      icon: "help-circle-outline",
      title: "Ajuda e suporte",
      subtitle: "Tire suas dúvidas e fale conosco",
      onPress: soon("Ajuda e suporte"),
    },
    {
      icon: "information-circle-outline",
      title: "Sobre o app",
      subtitle: "Versão e informações",
      onPress: () => Alert.alert("Sobre o app", "Contrato S.A. - versão 1.0.0"),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Pressable onPress={handleBack} hitSlop={12} style={styles.back}>
            <Ionicons name="chevron-back" size={28} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>
            {editing ? "Dados pessoais" : "Perfil"}
          </Text>
        </View>

        {editing ? (
          <>
            <Card>
              <SectionTitle title="Dados pessoais" />
              <InputField
                label="Nome"
                value={form.nome}
                onChangeText={(text) => update("nome", text)}
              />
              <InputField
                label="CPF"
                value={form.cpf}
                onChangeText={(text) => update("cpf", text)}
                keyboardType="numeric"
              />
              <InputField
                label="Telefone"
                value={form.telefone}
                onChangeText={(text) => update("telefone", text)}
                keyboardType="phone-pad"
              />
              <InputField
                label="Nacionalidade"
                value={form.nacionalidade}
                onChangeText={(text) => update("nacionalidade", text)}
              />
              <InputField
                label="Profissão"
                value={form.profissao}
                onChangeText={(text) => update("profissao", text)}
              />
              <InputField
                label="Estado civil"
                value={form.estado_civil}
                onChangeText={(text) => update("estado_civil", text)}
              />
              <InputField
                label="RG"
                value={form.rg}
                onChangeText={(text) => update("rg", text)}
              />
              <InputField
                label="Órgão expedidor"
                value={form.orgao_expedidor}
                onChangeText={(text) => update("orgao_expedidor", text)}
              />
            </Card>

            <Card>
              <SectionTitle title="Endereço" />
              <InputField
                label="Rua"
                value={form.rua}
                onChangeText={(text) => update("rua", text)}
              />
              <InputField
                label="Número"
                value={form.numero}
                onChangeText={(text) => update("numero", text)}
              />
              <InputField
                label="Bairro"
                value={form.bairro}
                onChangeText={(text) => update("bairro", text)}
              />
              <InputField
                label="CEP"
                value={form.cep}
                onChangeText={(text) => update("cep", text)}
                keyboardType="numeric"
              />
              <InputField
                label="Cidade"
                value={form.cidade}
                onChangeText={(text) => update("cidade", text)}
              />
              <InputField
                label="Estado"
                value={form.estado}
                onChangeText={(text) => update("estado", text)}
                maxLength={2}
                autoCapitalize="characters"
              />
              <Button
                label="Salvar perfil"
                onPress={handleSave}
                loading={saving}
              />
            </Card>
          </>
        ) : (
          <>
            <View style={styles.profileCard}>
              <View>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={56} color={colors.muted} />
                </View>
                <Pressable
                  style={styles.camera}
                  onPress={soon("Foto de perfil")}
                >
                  <Ionicons name="camera" size={14} color="#fff" />
                </Pressable>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.name} numberOfLines={2}>
                  {displayName}
                </Text>
                <Text style={styles.email} numberOfLines={1}>
                  {auth.profile?.email || ""}
                </Text>
                <View style={styles.badge}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={14}
                    color={colors.text}
                  />
                  <Text style={styles.badgeText}>Conta verificada</Text>
                </View>
              </View>
            </View>

            <View style={styles.menu}>
              {menu.map((item) => (
                <Pressable
                  key={item.title}
                  onPress={item.onPress}
                  style={({ pressed }) => [
                    styles.menuItem,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons name={item.icon} size={26} color={colors.text} />
                  <View style={styles.menuText}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.text}
                  />
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={confirmSignOut}
              style={({ pressed }) => [
                styles.logout,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="log-out-outline" size={22} color="#fff" />
              <Text style={styles.logoutText}>Sair da conta</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xl,
    marginBottom: spacing.sm,
  },
  back: {
    width: 32,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "700",
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
    gap: 6,
  },
  name: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "800",
  },
  email: {
    color: colors.muted,
    fontSize: 14,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "600",
  },
  menu: {
    gap: spacing.md,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  menuText: {
    flex: 1,
    gap: 2,
  },
  menuTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  menuSubtitle: {
    color: colors.muted,
    fontSize: 13,
  },
  logout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    minHeight: 52,
    marginTop: spacing.sm,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.85,
  },
});
