import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Keyboard } from "react-native";
import { Button, HelperText, Surface, TextInput } from "react-native-paper";
import { useProducts } from "../context/productContext";

interface FormErrors {
  name?: string;
  quantity?: string;
}

export default function AddProductScreen() {
  const navigation = useNavigation();
  const { addProduct } = useProducts();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!quantity.trim()) {
      newErrors.quantity = "Quantity is required";
    } else if (isNaN(Number(quantity)) || Number(quantity) < 0) {
      newErrors.quantity = "Quantity must be a valid positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = async () => {
    Keyboard.dismiss();
    if (!validate()) return;

    await addProduct({
      name: name.trim(),
      description: description.trim(),
      quantity: Number(quantity),
    });

    navigation.goBack();
  };

  return (
    <Surface style={{ flex: 1, justifyContent: "center", padding: 16 }}>

      {/* NAME */}
      <TextInput
        label="Name"
        testID="name-input"
        value={name}
        onChangeText={(v) => {
          setName(v);
          if (errors.name) setErrors((e) => ({ ...e, name: undefined }));
        }}
        error={!!errors.name}
        style={{ marginBottom: 4 }}
      />
      {errors.name && (
        <HelperText type="error" visible>
          {errors.name}
        </HelperText>
      )}


      {/* DESCRIPTION */}
      <TextInput
        label="Description"
        testID="description-input"
        value={description}
        onChangeText={setDescription}
        style={{ marginBottom: 4 }}
      />

      {/* QUANTITY */}
      <TextInput
        label="Quantity"
        testID="quantity-input"
        value={quantity}
        onChangeText={(v) => {
          setQuantity(v);
          if (errors.quantity) setErrors((e) => ({ ...e, quantity: undefined }));
        }}
        keyboardType="numeric"
        error={!!errors.quantity}
        style={{ marginBottom: 4 }}
      />
      {errors.quantity && (
        <HelperText type="error" visible>
          {errors.quantity}
        </HelperText>
      )}


      <Button mode="contained" onPress={handleAdd} style={{ marginTop: 8 }} testID="save-button">
        Save
      </Button>

    </Surface>
  );
}
