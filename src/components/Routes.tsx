import { GestureHandlerRootView } from "react-native-gesture-handler";
import React, { useContext, useState, useEffect, useCallback } from "react";
import { ActivityIndicator, Alert, StatusBar, StyleSheet, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { supabase } from "../../supabase.ts";
import { AuthContext } from "./AuthProvider.tsx";
import Posts from "../screens/Posts.tsx";
import { Session } from "@supabase/supabase-js";
import AuthStack from "./AuthStack.tsx";
import { NavigationContainer } from "@react-navigation/native";
import Theme from "../theme.ts";

SplashScreen.preventAutoHideAsync();

export const Routes = () => {
    const { setUser, users, setUsers } = useContext(AuthContext);
    const [appIsReady, setAppIsReady] = useState(false);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const { data, error } = await supabase.from("users").select("*");
            if (error) {
                console.error(error);
                return;
            }
            console.log("users in Routes:", data);
            setUsers(data);

            const {
                data: { session },
            } = await supabase.auth.getSession();
            setSession(session);
            console.log("user:", session?.user);
            setLoading(false);
        })();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (_event === "SIGNED_IN" && session) {
                const { user } = session;
                console.log("\nuser:", user);
                const { data, error } = await supabase.from("users").select("*");
                if (error) {
                    console.error("Error getting users:", error);
                    return;
                }
                // if user exists and isn't in the users table, insert it
                // if (user && !users.find((u) => u.id === user.id)) {
                if (
                    user &&
                    !data.some((u) => {
                        console.log("u.id:", u.id, "\n\nuser.id:", user.id);
                        return u.id === user.id;
                    })
                ) {
                    console.log("inserting:", {
                        id: user.id,
                        email: user.email,
                        username: user.user_metadata.username,
                    });
                    const { error } = await supabase
                        .from("users")
                        .insert({ id: user.id, email: user.email, username: user.user_metadata.username });
                    if (error) {
                        console.error(error);
                        Alert.alert(error.message);
                    } else {
                        console.log("Signed up!");
                        Alert.alert("Signed up!", "", [
                            { text: "OK", onPress: () => console.log("User account signed up!") },
                        ]);
                    }
                }
            }
            setSession(session);
        });

        setAppIsReady(true);

        return () => subscription.unsubscribe();
    }, []);

    const onLayoutRootView = useCallback(async () => {
        if (appIsReady) await SplashScreen.hideAsync();
    }, [appIsReady]);

    if (loading) {
        return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: "center", alignItems: "center" }} />;
    }

    return (
        <NavigationContainer theme={Theme}>
            <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
                <View style={styles.safearea}>
                    <StatusBar barStyle="light-content" />
                    {session ? <Posts session={session} /> : <AuthStack />}
                </View>
            </GestureHandlerRootView>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    safearea: {
        width: "100%",
        height: "100%",
        backgroundColor: "#0A0B14",
    },
});
