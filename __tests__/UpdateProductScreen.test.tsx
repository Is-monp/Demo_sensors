import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { PaperProvider } from "react-native-paper";

import { AuthContext, AuthContextType } from "@/src/features/auth/presentation/context/authContext";
import { Product } from "@/src/features/products/domain/entities/Product";
import { ProductContext, ProductContextType } from "@/src/features/products/presentation/context/productContext";
import UpdateProductScreen from "@/src/features/products/presentation/screens/UpdateProductScreen";

const Stack = createStackNavigator();

const mockProduct: Product = {
    _id: "1",
    name: "Product 1",
    description: "Desc 1",
    quantity: 10,
};

// ===========================
// Mock Contexts
// ===========================
const createMockAuthContext = (overrides: Partial<AuthContextType> = {}): AuthContextType => ({
    isLoggedIn: true,
    loading: false,
    error: null,
    loggedUser: null,
    clearError: jest.fn(),
    login: jest.fn(),
    signup: jest.fn(),
    logout: jest.fn(),
    forgotPassword: jest.fn(),
    validate: jest.fn(),
    getLoggedUser: jest.fn(),
    ...overrides,
});

const createMockProductContext = (overrides: Partial<ProductContextType> = {}): ProductContextType => ({
    products: [],
    isLoading: false,
    error: null,
    clearError: jest.fn(),
    addProduct: jest.fn(),
    updateProduct: jest.fn(),
    removeProduct: jest.fn(),
    getProduct: jest.fn().mockResolvedValue(mockProduct),
    refreshProducts: jest.fn(),
    ...overrides,
});

// ===========================
// Render Helper
// ===========================
function renderScreen(
    authOverrides: Partial<AuthContextType> = {},
    productOverrides: Partial<ProductContextType> = {}
) {
    return render(
        <AuthContext.Provider value={createMockAuthContext(authOverrides)}>
            <ProductContext.Provider value={createMockProductContext(productOverrides)}>
                <PaperProvider>
                    <NavigationContainer>
                        <Stack.Navigator>
                            <Stack.Screen
                                name="UpdateProduct"
                                component={UpdateProductScreen}
                                initialParams={{ id: "1" }}
                            />
                        </Stack.Navigator>
                    </NavigationContainer>
                </PaperProvider>
            </ProductContext.Provider>
        </AuthContext.Provider>
    );
}

// ===========================
// Tests
// ===========================
describe("UpdateProductScreen", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("renders correctly", () => {

        it("shows loading indicator initially", () => {
            const { getByTestId } = renderScreen();
            expect(getByTestId("loading-indicator")).toBeTruthy();
        });

        it("shows product data after loading", async () => {
            const { getByTestId } = renderScreen();

            await waitFor(() => {
                expect(getByTestId("name-input").props.value).toBe("Product 1");
                expect(getByTestId("description-input").props.value).toBe("Desc 1");
                expect(getByTestId("quantity-input").props.value).toBe("10");
            });
        });

        it("shows not found when product does not exist", async () => {
            const { getByTestId } = renderScreen({}, {
                getProduct: jest.fn().mockResolvedValue(undefined),
            });

            await waitFor(() => {
                expect(getByTestId("not-found-text")).toBeTruthy();
            });
        });

    });

    describe("interactions", () => {

        it("calls updateProduct with correct values", async () => {
            const mockUpdateProduct = jest.fn().mockResolvedValue(undefined);
            const { getByTestId, getByText } = renderScreen({}, { updateProduct: mockUpdateProduct });

            await waitFor(() => {
                expect(getByTestId("name-input").props.value).toBe("Product 1");
            });

            fireEvent.changeText(getByTestId("name-input"), "Updated Product");
            fireEvent.changeText(getByTestId("quantity-input"), "20");

            fireEvent.press(getByText("Update"));

            await waitFor(() => {
                expect(mockUpdateProduct).toHaveBeenCalledWith({
                    _id: "1",
                    name: "Updated Product",
                    description: "Desc 1",
                    quantity: 20,
                });
            });
        });

        it("does not call updateProduct when name is missing", async () => {
            const mockUpdateProduct = jest.fn();
            const { getByTestId, getByText } = renderScreen({}, { updateProduct: mockUpdateProduct });

            await waitFor(() => {
                expect(getByTestId("name-input").props.value).toBe("Product 1");
            });

            fireEvent.changeText(getByTestId("name-input"), "");
            fireEvent.press(getByText("Update"));

            await waitFor(() => {
                expect(mockUpdateProduct).not.toHaveBeenCalled();
            });
        });

        it("does not call updateProduct when quantity is missing", async () => {
            const mockUpdateProduct = jest.fn();
            const { getByTestId, getByText } = renderScreen({}, { updateProduct: mockUpdateProduct });

            await waitFor(() => {
                expect(getByTestId("quantity-input").props.value).toBe("10");
            });

            fireEvent.changeText(getByTestId("quantity-input"), "");
            fireEvent.press(getByText("Update"));

            await waitFor(() => {
                expect(mockUpdateProduct).not.toHaveBeenCalled();
            });
        });

    });

});
