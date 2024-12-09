import React, { createContext, useEffect, useState } from "react";
import { AppState } from "react-native";
import { supabase } from "../../supabase";
import { User } from "@supabase/supabase-js";

interface AuthContextType {
    user: User | undefined | null;
    setUser: React.Dispatch<React.SetStateAction<User | undefined | null>>;
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

export const AuthContext = createContext<AuthContextType>({
    user: undefined,
    setUser: () => {},
    users: [],
    setUsers: () => {},
});

export const AuthProvider = ({ children }: React.PropsWithChildren<{}>) => {
    const [user, setUser] = useState<User | undefined | null>(null);
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        AppState.addEventListener("change", (state) => {
            if (state === "active") supabase.auth.startAutoRefresh();
            else supabase.auth.stopAutoRefresh();
        });
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                users,
                setUsers,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
