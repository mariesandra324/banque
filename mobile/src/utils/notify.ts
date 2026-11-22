import { Alert, Platform } from "react-native";

type NotifyAction = {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
};

export function notify(
  title: string,
  message?: string,
  actions?: NotifyAction[]
) {
  if (Platform.OS === "web") {
    const text = message ? `${title}\n\n${message}` : title;
    if (typeof window !== "undefined") {
      window.alert(text);
    }
    const action = actions?.find((item) => item.style !== "cancel") ?? actions?.[0];
    action?.onPress?.();
    return;
  }

  Alert.alert(title, message, actions);
}
