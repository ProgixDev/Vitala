import { View } from "react-native";
import { Text } from "./Text";

interface StepProgressProps {
  current: number; // 1-based
  total: number;
  label?: string;
  className?: string;
}

/** Segmented progress bar for multi-step wizards (signup, booking). */
export function StepProgress({
  current,
  total,
  label,
  className = "",
}: StepProgressProps) {
  return (
    <View className={className}>
      <View className="flex-row items-center">
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            className={`flex-1 h-1.5 rounded-full ${
              i < current ? "bg-primary" : "bg-surface-alt"
            } ${i > 0 ? "ml-1.5" : ""}`}
          />
        ))}
      </View>
      {label && (
        <Text variant="caption" color="muted" className="mt-2">
          {label}
        </Text>
      )}
    </View>
  );
}

export default StepProgress;
