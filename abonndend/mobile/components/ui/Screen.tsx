import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { Edge, SafeAreaView } from "react-native-safe-area-context";

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  edges?: Edge[];
  keyboardAvoiding?: boolean;
  className?: string;
  contentClassName?: string;
}

/**
 * Standard screen wrapper: themed background + safe-area handling, with an
 * optional scroll body and keyboard avoidance. Keeps every screen's outer
 * chrome consistent.
 */
export function Screen({
  children,
  scroll = false,
  padded = true,
  edges = ["top"],
  keyboardAvoiding = false,
  className = "",
  contentClassName = "",
}: ScreenProps) {
  const pad = padded ? "px-6" : "";

  const body = scroll ? (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View className={`${pad} ${contentClassName}`}>{children}</View>
    </ScrollView>
  ) : (
    <View className={`flex-1 ${pad} ${contentClassName}`}>{children}</View>
  );

  const inner = keyboardAvoiding ? (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {body}
    </KeyboardAvoidingView>
  ) : (
    body
  );

  return (
    <SafeAreaView className={`flex-1 bg-background ${className}`} edges={edges}>
      {inner}
    </SafeAreaView>
  );
}

export default Screen;
