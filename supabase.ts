import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
    "https://yikwrjtqqaecuvxikbaf.supabase.co",
    // api key usually in .env file, but for this example, we're hardcoding it
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlpa3dyanRxcWFlY3V2eGlrYmFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMyNTA4MzYsImV4cCI6MjA0ODgyNjgzNn0.6_LF4Xc5oo4LZqCSkM5TyMhUxd2OXzP1f4U6sfQuG2o",
    {
        auth: {
            storage: AsyncStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
        },
    }
);
