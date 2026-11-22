import React from "react";

import { View, StyleSheet } from "react-native";

import RegisterForm from "@/modules/auth/RegisterForm";

export default function RegisterScreen() {
  return (
    <View style={styles.container}>
      <RegisterForm />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});