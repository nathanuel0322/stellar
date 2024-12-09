import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from "react-native";
import FormInput from "../components/FormInput.tsx";
import { supabase } from "../../supabase.ts";
import FormButton from "../components/FormButton.tsx";
import { colorSet } from "../GlobalStyles.ts";

const LoginScreen = ({ navigation }: { navigation: any }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <View style={styles.inputView}>
                <FormInput
                    labelValue={email}
                    onChangeText={(userEmail: string) => setEmail(userEmail)}
                    placeholderText="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                />
            </View>
            <View style={styles.inputView}>
                <FormInput
                    labelValue={password}
                    onChangeText={(userPassword: string) => setPassword(userPassword)}
                    placeholderText="Password"
                    secureTextEntry={true}
                />
            </View>
            <FormButton
                buttonTitle="Sign In"
                onPress={async () => {
                    if (!email || !password) {
                        Alert.alert("Please enter all fields.");
                        return;
                    }
                    const { error } = await supabase.auth.signInWithPassword({ email, password });
                    if (error) {
                        console.error("Error signing in:", error);
                        Alert.alert(error.message);
                    } else {
                        console.log("Signed in!");
                        Alert.alert("Signed in!", "", [
                            { text: "OK", onPress: () => console.log("User account signed in!") },
                        ]);
                    }
                }}
            />
            <TouchableOpacity style={styles.forgotButton} onPress={() => navigation.navigate("Signup")}>
                <Text style={[styles.navButtonText, { color: colorSet.accent1 }]}>
                    Don't have an account? Create here
                </Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0A0B14",
        alignItems: "center",
        justifyContent: "center",
    },
    image: {
        marginBottom: 40,
        width: "50%",
        height: "25%",
        borderRadius: 12,
    },

    inputView: {
        backgroundColor: "#FFFFFF",
        borderRadius: 30,
        width: "70%",
        height: 45,
        marginBottom: 20,
        alignItems: "center",
    },

    text: {
        fontSize: 28,
        marginBottom: 10,
        color: "#051d5f",
    },
    navButton: {
        marginTop: 15,
    },
    forgotButton: {
        marginTop: 30,
    },
    navButtonText: {
        fontSize: 18,
        fontWeight: "500",
        color: "white",
    },
});
