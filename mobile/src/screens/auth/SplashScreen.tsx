import React from "react";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  StatusBar,
  useWindowDimensions,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import { colors } from "@/theme/colors";

export function SplashScreen() {
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const titleSize = Math.min(Math.max(width * 0.088, 36), isTablet ? 58 : 56);
  const titleLineHeight = Math.round(titleSize * 1.08);
  const bodySize = Math.min(Math.max(width * 0.034, 15), isTablet ? 20 : 18);
  const brandSize = Math.min(Math.max(width * 0.047, 22), isTablet ? 32 : 28);

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

        <View style={styles.container}>
          <View style={styles.top}>
            <Text style={[styles.brand, { fontSize: brandSize }]}>
              Contrato S.A.
            </Text>
          </View>

          <View style={styles.center}>
            <Text
              style={[
                styles.title,
                {
                  fontSize: titleSize,
                  lineHeight: titleLineHeight,
                  marginTop: isTablet ? -32 : -84,
                },
              ]}
              allowFontScaling={false}
            >
              Contratos em
              {"\n"}
              <Text style={styles.titleAccent}>minutos</Text>
            </Text>

            <Text
              style={[styles.description, { fontSize: bodySize }]}
              allowFontScaling={false}
            >
              A forma mais rápida, segura e{"\n"}
              profissional de gerenciar suas{"\n"}
              locações e contratos de serviços.
            </Text>

            <View style={styles.copySpacer} />

            <Text
              style={[
                styles.description,
                styles.descriptionSecondary,
                { fontSize: bodySize },
              ]}
              allowFontScaling={false}
            >
              Preencha os dados, gere o PDF{"\n"}e armazene tudo em um só lugar.
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Começar"
              onPress={() => navigation.navigate("Login")}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.buttonLabel}>Começar</Text>
            </Pressable>
          </View>
        </View>
      </ImageBackground>
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
    backgroundColor: "rgba(16, 27, 58, 0.78)",
  },
  container: {
    flex: 1,
    minHeight: "100%",
    paddingTop: 12,
    paddingBottom: 10,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  top: {
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 60,
  },
  brand: {
    color: "#FFFFFF",
    fontWeight: "800",
    letterSpacing: -0.4,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.25)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    flex: 1,
    paddingVertical: 18,
  },
  title: {
    color: "#FFFFFF",
    fontWeight: "900",
    letterSpacing: -1.4,
    textAlign: "center",
    includeFontPadding: true,
    paddingBottom: 2,
    textShadowColor: "rgba(0, 0, 0, 0.35)",
    textShadowOffset: { width: 0, height: 8 },
    textShadowRadius: 24,
  },
  titleAccent: {
    color: "#EF4262",
    fontWeight: "900",
  },
  description: {
    color: "rgba(229, 231, 235, 0.98)",
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 330,
    fontWeight: "500",
    textShadowColor: "rgba(0, 0, 0, 0.26)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  descriptionSecondary: {
    marginTop: 2,
  },
  copySpacer: {
    height: 2,
  },
  button: {
    marginTop: 18,
    minWidth: 130,
    height: 50,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: "#EF4262",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#EF4262",
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.96,
  },
  buttonLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
});
