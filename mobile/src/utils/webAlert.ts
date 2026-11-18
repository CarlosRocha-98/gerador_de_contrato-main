import { Alert, Platform, type AlertButton } from "react-native";

// No React Native Web, Alert.alert é um no-op. Este adaptador usa os
// diálogos nativos do navegador para manter o mesmo comportamento do app.
if (Platform.OS === "web") {
  Alert.alert = (
    title: string,
    message?: string,
    buttons?: AlertButton[],
  ) => {
    const text = [title, message].filter(Boolean).join("\n\n");
    const cancel = buttons?.find((button) => button.style === "cancel");
    const actions = (buttons ?? []).filter(
      (button) => button.style !== "cancel",
    );

    if (!buttons || buttons.length <= 1) {
      window.alert(text);
      buttons?.[0]?.onPress?.();
      return;
    }

    if (actions.length === 1) {
      if (window.confirm(text)) {
        actions[0].onPress?.();
      } else {
        cancel?.onPress?.();
      }
      return;
    }

    const options = actions
      .map((button, index) => `${index + 1} - ${button.text}`)
      .join("\n");
    const answer = window.prompt(`${text}\n\n${options}`);
    const selected = actions[Number(answer) - 1];

    if (selected) {
      selected.onPress?.();
    } else {
      cancel?.onPress?.();
    }
  };
}
