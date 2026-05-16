import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import React from "react";
import { FlatList, RefreshControl, View } from "react-native"; // 👈 añadir RefreshControl
import {
  ActivityIndicator,
  Appbar,
  Button,
  FAB,
  List,
  Snackbar,
  Surface,
} from "react-native-paper";
import { useProducts } from "../context/productContext";

export default function ProductListScreen({
  navigation,
}: {
  navigation: any;
}) {
  const {
    products,
    removeProduct,
    isLoading,
    isRefreshing, 
    forceRefresh, 
    error,
    clearError,
  } = useProducts();
  const { logout } = useAuth();

  if (isLoading) {
    return (
      <Surface
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator testID="loading-indicator" size="large" />
      </Surface>
    );
  }

  return (
    <Surface testID="product-screen" style={{ flex: 1 }}>
      {/* AppBar with Logout */}
      <Appbar.Header>
        <Appbar.Content title="Products" />
        {products.length > 0 && (
          <Appbar.Action
            testID="delete-all-button"
            icon="delete-outline"
            onPress={() => products.forEach((p) => removeProduct(p._id))}
          />
        )}
        <Appbar.Action
          testID="logout-button"
          icon="logout"
          onPress={() => logout()}
        />
      </Appbar.Header>

      {/* Empty state o lista */}
      {products.length === 0 && !isRefreshing ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <List.Icon icon="cart-outline" />
          <List.Subheader>No products found</List.Subheader>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ padding: 20 }}
          data={products}
          keyExtractor={(item) => item._id}

          // ✅ Pull to Refresh
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={forceRefresh}
              colors={["#6750A4"]}         // Android: color del spinner
              tintColor="#6750A4"          // iOS: color del spinner
              title="Actualizando..."      // iOS: texto bajo el spinner
            />
          }

          renderItem={({ item }) => (
            <List.Item
              title={item.name}
              description={`Qty: ${item.quantity}`}
              left={(props) => <List.Icon {...props} icon="cube-outline" />}
              onPress={() => {
                console.log(
                  "Navigating to UpdateProductScreen with id:",
                  item._id
                );
                navigation.navigate("UpdateProductScreen", { id: item._id });
              }}
              right={() => (
                <Button
                  testID={`delete-button-${item._id}`}
                  onPress={() => removeProduct(item._id)}
                >
                  Delete
                </Button>
              )}
            />
          )}
        />
      )}

      {/* FAB */}
      <FAB
        icon="plus"
        testID="add-product-fab"
        style={{ position: "absolute", right: 16, bottom: 16 }}
        onPress={() => navigation.navigate("AddProductScreen")}
      />

      <Snackbar
        visible={!!error}
        onDismiss={clearError}
        duration={3000}
        action={{ label: "Dismiss", onPress: clearError }}
      >
        {error}
      </Snackbar>
    </Surface>
  );
}
