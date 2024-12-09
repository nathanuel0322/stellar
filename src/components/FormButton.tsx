import React from "react";
import { Text, TouchableOpacity, StyleSheet, useWindowDimensions } from "react-native";
import { colorSet } from "../GlobalStyles";

const FormButton = ({ buttonTitle, ...rest }: { buttonTitle: string; [x: string]: any }) => {
    const { height } = useWindowDimensions();

    return (
        <TouchableOpacity style={[styles.buttonContainer, { height: height / 15 }]} {...rest}>
            <Text style={styles.buttonText}>{buttonTitle}</Text>
        </TouchableOpacity>
    );
};

export default FormButton;

const styles = StyleSheet.create({
    buttonContainer: {
        marginTop: 10,
        width: "80%",
        backgroundColor: colorSet.primary4,
        padding: 10,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 30,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: "bold",
        color: colorSet.white,
    },
});
