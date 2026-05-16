// __tests__/ProductListScreen.test.tsx

import { NavigationContainer } from "@react-navigation/native";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { PaperProvider } from "react-native-paper";

import { AuthContext, AuthContextType } from "@/src/features/auth/presentation/context/authContext";
import { Product } from "@/src/features/products/domain/entities/Product";
import { ProductContext, ProductContextType } from "@/src/features/products/presentation/context/productContext";
import ProductListScreen from "@/src/features/products/presentation/screens/ProductListScreen";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();
// ===========================
// Mock Data
// ===========================
const mockProducts: Product[] = [
    { _id: "1", name: "Product 1", description: "Desc 1", quantity: 10 },
    { _id: "2", name: "Product 2", description: "Desc 2", quantity: 20 },
];

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
    products: mockProducts,
    isLoading: false,
    error: null,
    clearError: jest.fn(),
    addProduct: jest.fn(),
    updateProduct: jest.fn(),
    removeProduct: jest.fn(),
    getProduct: jest.fn(),
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
                            <Stack.Screen name="ProductList" component={ProductListScreen} />
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
describe("ProductListScreen", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("renders correctly", () => {

        it("shows all products", async () => {
            const { getByText } = renderScreen();

            await waitFor(() => {
                expect(getByText("Product 1")).toBeTruthy();
                expect(getByText("Product 2")).toBeTruthy();
            });
        });

        it("shows loading indicator when isLoading is true", () => {
            const { getByTestId } = renderScreen({}, { isLoading: true, products: [] });

            expect(getByTestId("loading-indicator")).toBeTruthy();
        });

        it("shows empty state when products list is empty", () => {
            const { getByText } = renderScreen({}, { products: [] });

            // Adjust to match your actual empty state text
            expect(getByText("No products found")).toBeTruthy();
        });

        it("shows error snackbar when error is set", async () => {
            const { getByText } = renderScreen({}, { error: "Failed to load" });

            await waitFor(() => {
                expect(getByText("Failed to load")).toBeTruthy();
            });
        });

    });

    describe("interactions", () => {

        it("calls logout when logout button is pressed", async () => {
            const mockLogout = jest.fn();
            const { getByTestId } = renderScreen({ logout: mockLogout });

            fireEvent.press(getByTestId("logout-button"));

            await waitFor(() => {
                expect(mockLogout).toHaveBeenCalledTimes(1);
            });
        });

        it("calls removeProduct when delete all button is pressed", async () => {
            const mockRemoveProduct = jest.fn().mockResolvedValue(undefined);
            const { getByTestId } = renderScreen({}, { removeProduct: mockRemoveProduct });

            fireEvent.press(getByTestId("delete-all-button"));

            await waitFor(() => {
                expect(mockRemoveProduct).toHaveBeenCalled();
            });
        });

    });

});
