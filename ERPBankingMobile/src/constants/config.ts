import { Platform } from "react-native";

export const API_URL = 
 Platform.OS === "web"
    ? "http://localhost:8080/api"
    : "http://192.168.1.182:8080/api";


export const USE_MOCKS = false;

export const USE_MOCK_FOR_UNBACKED_FEATURES = true;

export const DEMO_PIN = "1234";