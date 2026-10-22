import React from "react";

import { View, StyleSheet } from "react-native";

import LoginForm from "@/modules/auth/LoginForm";

export default function LoginScreen() {
  return (
    <View
      style={styles.container}
    >
      <LoginForm />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});