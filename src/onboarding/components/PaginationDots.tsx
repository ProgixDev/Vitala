import React from "react";
import { View, StyleSheet, Animated } from "react-native";

interface PaginationDotsProps {
  total: number;
  current: number;
}

export const PaginationDots: React.FC<PaginationDotsProps> = ({
  total,
  current,
}) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === current ? styles.activeDot : styles.inactiveDot,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 15,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#2D59F0",
    width: 24,
  },
  inactiveDot: {
    backgroundColor: "#D1D5DB",
  },
});
