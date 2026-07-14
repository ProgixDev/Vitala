import { useRef } from "react";
import { TextInput, View, Pressable } from "react-native";
import { fonts, useThemeColors } from "@/constants/theme";

interface OtpInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  length?: number;
  autoFocus?: boolean;
}

/**
 * Segmented one-time-code input with auto-advance, backspace-to-previous and
 * paste support. Shared by email verification and password reset.
 */
export function OtpInput({
  value,
  onChange,
  length = 6,
  autoFocus = true,
}: OtpInputProps) {
  const colors = useThemeColors();
  const inputs = useRef<(TextInput | null)[]>([]);
  const safe = Array.isArray(value) ? value : Array(length).fill("");

  const handleChange = (text: string, index: number) => {
    // Support pasting the full code into one box.
    if (text.length > 1) {
      const chars = text.replace(/\D/g, "").slice(0, length).split("");
      const next = Array(length)
        .fill("")
        .map((_, i) => chars[i] ?? "");
      onChange(next);
      inputs.current[Math.min(chars.length, length - 1)]?.focus();
      return;
    }
    const next = [...safe];
    next[index] = text;
    onChange(next);
    if (text && index < length - 1) inputs.current[index + 1]?.focus();
  };

  const handleKey = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !safe[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View className="flex-row justify-between">
      {Array.from({ length }).map((_, index) => {
        const filled = !!safe[index];
        return (
          <Pressable key={index} onPress={() => inputs.current[index]?.focus()}>
            <TextInput
              ref={(ref) => {
                inputs.current[index] = ref;
              }}
              className={`w-12 h-15 rounded-2xl text-center text-foreground ${
                filled ? "bg-surface border border-foreground" : "bg-surface-alt border border-transparent"
              }`}
              style={{ fontFamily: fonts.semibold, fontSize: 20 }}
              value={safe[index]}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKey(e, index)}
              keyboardType="number-pad"
              maxLength={length}
              selectTextOnFocus
              autoFocus={autoFocus && index === 0}
              selectionColor={colors.primary}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

export default OtpInput;
