import "react-native-gesture-handler";
import "./global.css";
import { AuthProvider } from "./src/components/AuthProvider.tsx";
import { Routes } from "./src/components/Routes.tsx";

export default function App() {
    return (
        <AuthProvider>
            <Routes />
        </AuthProvider>
    );
}
