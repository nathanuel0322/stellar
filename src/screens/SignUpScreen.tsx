import React, { useContext, useState } from "react";
import { Text, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from "react-native";
import FormInput from "../components/FormInput.tsx";
import { supabase } from "../../supabase.ts";
import FormButton from "../components/FormButton.tsx";
import { colorSet } from "../GlobalStyles.ts";
import { User } from "../components/AuthStack.tsx";
import { AuthContext } from "../components/AuthProvider.tsx";

const SignupScreen = ({ navigation, route }: { navigation: any; route: any }) => {
    const { users } = route.params;
    console.log("users in SignupScreen: ", users);
    const [username, setUsername] = useState("");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <Text style={styles.text}>Create an Account</Text>
            <FormInput
                labelValue={email}
                onChangeText={(userEmail: string) => setEmail(userEmail)}
                placeholderText="Email"
                iconType="user"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
            />
            <FormInput
                labelValue={username}
                onChangeText={(userName: string) => {
                    console.log("setting username:", userName);
                    setUsername(userName);
                }}
                placeholderText="Username"
                iconType="user"
                autoCapitalize="none"
                autoCorrect={false}
            />
            <FormInput
                labelValue={password}
                onChangeText={(userPassword: string) => setPassword(userPassword)}
                placeholderText="Password"
                iconType="lock"
                secureTextEntry={true}
            />
            <FormInput
                labelValue={confirmPassword}
                onChangeText={(userPassword: string) => setConfirmPassword(userPassword)}
                placeholderText="Confirm Password"
                iconType="lock"
                secureTextEntry={true}
            />
            <FormButton
                buttonTitle="Sign Up"
                onPress={async () => {
                    if (email !== "" && username !== "" && password !== "" && confirmPassword !== "") {
                        if (users.find((user: User) => user.username === username)) {
                            Alert.alert("Username already taken!");
                            return;
                        }
                        if (password === confirmPassword) {
                            const { error } = await supabase.auth.signUp({
                                email,
                                password,
                                options: { data: { username } },
                            });
                            if (error) {
                                console.error(error);
                                Alert.alert(error.message);
                            }
                        } else Alert.alert("Passwords don't match!");
                    } else Alert.alert("Please fill in all fields!");
                }}
            />
            <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Login")}>
                <Text style={styles.navButtonText}>Have an account? Sign In</Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
};

export default SignupScreen;

const styles = StyleSheet.create({
    container: {
        marginTop: -75,
        flex: 1,
        backgroundColor: colorSet.primary1,
        alignItems: "center",
        justifyContent: "center",
    },
    text: {
        fontSize: 28,
        marginBottom: 50,
        color: colorSet.white,
    },
    navButton: {
        marginTop: 15,
    },
    navButtonText: {
        fontSize: 18,
        fontWeight: "500",
        color: colorSet.accent1,
    },
    textPrivate: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginVertical: 35,
        justifyContent: "center",
    },
    color_textPrivate: {
        fontSize: 13,
        fontWeight: "400",
        color: "grey",
    },
    image: {
        marginBottom: 40,
        width: "50%",
        height: "25%",
        borderRadius: 12,
    },
});
