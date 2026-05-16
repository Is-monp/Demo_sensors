import { Product } from "@/src/features/products/domain/entities/Product";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Keyboard } from "react-native";
import { ActivityIndicator, Button, HelperText, Surface, Text, TextInput } from "react-native-paper";
import { useProducts } from "../context/productContext";

interface FormErrors {
  name?: string;
  quantity?: string;
}

export default function UpdateProductScreen({ route }: { route: any }) {
  const { id } = route.params;
  const navigation = useNavigation();
  const { getProduct, updateProduct } = useProducts();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        setLoading(true);
        const p = await getProduct(id);
        if (!p) {
          setNotFound(true);
        } else {
          setProduct(p);
          setName(p.name);
          setDescription(p.description);
          setQuantity(p.quantity.toString());
        }
      } catch (error) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

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

  const handleUpdate = async () => {
    Keyboard.dismiss();
    if (!product || !validate()) return;

    await updateProduct({
      _id: product._id,
      name: name.trim(),
      description: description.trim(),
      quantity: Number(quantity),
    });

    navigation.goBack();
  };

  if (loading) {
    return (
      <Surface style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 16 }}>
        <ActivityIndicator testID="loading-indicator" size="large" />
      </Surface>
    );
  }

  if (notFound || !product) {
    return (
      <Surface style={{ flex: 1, justifyContent: "center", padding: 16 }}>
        <Text testID="not-found-text" variant="bodyLarge" style={{ color: "red" }}>
          Product not found
        </Text>
      </Surface>
    );
  }

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

      <Button mode="contained" onPress={handleUpdate} style={{ marginTop: 8 }}>
        Update
      </Button>

    </Surface>
  );
}
