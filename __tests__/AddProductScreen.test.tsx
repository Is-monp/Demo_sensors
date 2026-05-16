import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React, { act } from "react";
import { PaperProvider } from "react-native-paper";

import { AuthContext, AuthContextType } from "@/src/features/auth/presentation/context/authContext";
import { ProductContext, ProductContextType } from "@/src/features/products/presentation/context/productContext";
import AddProductScreen from "@/src/features/products/presentation/screens/AddProductScreen";

const Stack = createStackNavigator();

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
                            <Stack.Screen name="AddProduct" component={AddProductScreen} />
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
describe("AddProductScreen", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("renders correctly", () => {

        it("shows all input fields", () => {
            const { getByTestId } = renderScreen();
            expect(getByTestId("name-input")).toBeTruthy();
            expect(getByTestId("description-input")).toBeTruthy();
            expect(getByTestId("quantity-input")).toBeTruthy();
        });

        it("shows Save button", () => {
            const { getByTestId } = renderScreen();

            expect(getByTestId("save-button")).toBeTruthy();
        });

    });

    describe("interactions", () => {

        it("does not call addProduct when fields are empty", async () => {
            const mockAddProduct = jest.fn();
            const { getByText } = renderScreen({}, { addProduct: mockAddProduct });

            fireEvent.press(getByText("Save"));

            await waitFor(() => {
                expect(mockAddProduct).not.toHaveBeenCalled();
            });
        });

        // it("calls addProduct with correct values", async () => {
        //     const mockAddProduct = jest.fn().mockResolvedValue(undefined);
        //     const { getByTestId, getByText } = renderScreen({}, { addProduct: mockAddProduct });

        //     await act(async () => {
        //         fireEvent.changeText(getByTestId("name-input"), "Test Product");
        //         fireEvent.changeText(getByTestId("description-input"), "Test Description");
        //         fireEvent.changeText(getByTestId("quantity-input"), "5");
        //         fireEvent.press(getByText("Save"));
        //     });

        //     await waitFor(() => {
        //         expect(mockAddProduct).toHaveBeenCalledWith({
        //             name: "Test Product",
        //             description: "Test Description",
        //             quantity: 5,
        //         });
        //     });
        // });

        it("does not call addProduct when fields are empty", async () => {
            const mockAddProduct = jest.fn();
            const { getByText } = renderScreen({}, { addProduct: mockAddProduct });

            await act(async () => {
                fireEvent.press(getByText("Save"));
            });

            await waitFor(() => {
                expect(mockAddProduct).not.toHaveBeenCalled();
            });
        });

        it("does not call addProduct when only name is missing", async () => {
            const mockAddProduct = jest.fn();
            const { getByTestId, getByText } = renderScreen({}, { addProduct: mockAddProduct });

            await act(async () => {
                fireEvent.changeText(getByTestId("quantity-input"), "5");
                fireEvent.press(getByText("Save"));
            });

            await waitFor(() => {
                expect(mockAddProduct).not.toHaveBeenCalled();
            });
        });

        it("does not call addProduct when only quantity is missing", async () => {
            const mockAddProduct = jest.fn();
            const { getByTestId, getByText } = renderScreen({}, { addProduct: mockAddProduct });

            await act(async () => {
                fireEvent.changeText(getByTestId("name-input"), "Test Product");
                fireEvent.press(getByText("Save"));
            });

            await waitFor(() => {
                expect(mockAddProduct).not.toHaveBeenCalled();
            });
        });



        it("does not call addProduct when only name is missing", async () => {
            const mockAddProduct = jest.fn();
            const { getByTestId, getByText } = renderScreen({}, { addProduct: mockAddProduct });

            fireEvent.changeText(getByTestId("quantity-input"), "5");
            fireEvent.press(getByText("Save"));

            await waitFor(() => {
                expect(mockAddProduct).not.toHaveBeenCalled();
            });
        });


        it("does not call addProduct when only quantity is missing", async () => {
            const mockAddProduct = jest.fn();
            const { getByTestId, getByText } = renderScreen({}, { addProduct: mockAddProduct });

            fireEvent.changeText(getByTestId("name-input"), "Test Product");
            fireEvent.press(getByText("Save"));

            await waitFor(() => {
                expect(mockAddProduct).not.toHaveBeenCalled();
            });
        });


    });

});
