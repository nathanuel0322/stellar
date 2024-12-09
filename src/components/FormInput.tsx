import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { groupstyles } from "../GroupStyles";
import { colorSet } from "../GlobalStyles";

const FormInput = ({ labelValue, placeholderText, ...rest }: any) => {
    return (
        <View style={[styles.inputView, { width: 300 }]}>
            <TextInput
                value={labelValue}
                style={[groupstyles.TextInput, { width: 300 }]}
                numberOfLines={1}
                placeholder={placeholderText}
                placeholderTextColor="#666"
                {...rest}
            />
        </View>
    );
};

export default FormInput;

const styles = StyleSheet.create({
    inputView: {
        backgroundColor: colorSet.white,
        borderRadius: 30,
        height: 45,
        marginBottom: 20,
        alignItems: "center",
        justifyContent: "center",
    },
});
