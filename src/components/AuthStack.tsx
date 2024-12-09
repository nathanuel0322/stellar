import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";

import { FontAwesome } from "@expo/vector-icons";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignUpScreen";
import { colorSet } from "../GlobalStyles";
import { supabase } from "../../supabase";

const Stack = createStackNavigator();

export interface User {
    id: string;
    created_at: string;
    email: string;
    username: string;
}

const AuthStack = () => {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        (async () => {
            const { data, error } = await supabase.from("users").select("*");
            if (error) {
                console.error(error);
                return;
            }
            console.log("users in AuthStack:", data);
            setUsers(data);
        })();
    }, []);

    return (
        <Stack.Navigator initialRouteName="Login">
            <Stack.Screen name="Login" component={LoginScreen} options={{ header: () => null }} />
            <Stack.Screen
                name="Signup"
                component={SignupScreen}
                initialParams={{ users }}
                options={({ navigation }) => ({
                    title: "",
                    headerStyle: {
                        backgroundColor: colorSet.primary1,
                        shadowColor: colorSet.primary1,
                    },
                    headerLeft: () => (
                        <View style={{ marginLeft: 31, marginTop: 70, width: "auto", height: 100 }}>
                            <FontAwesome.Button
                                name="long-arrow-left"
                                size={50}
                                backgroundColor={colorSet.primary1}
                                color={colorSet.accent1}
                                onPress={() => navigation.navigate("Login")}
                            />
                        </View>
                    ),
                })}
            />
        </Stack.Navigator>
    );
};

export default AuthStack;
