import { View } from "react-native";

/** Hairline separator using the theme border color. */
export function Divider({ className = "" }: { className?: string }) {
  return <View className={`h-px bg-border ${className}`} />;
}

export default Divider;
