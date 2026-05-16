import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React, { act } from "react";
import { PaperProvider } from "react-native-paper";

import { AuthContext, AuthContextType } from "@/src/features/auth/presentation/context/authContext";
import LoginScreen from "@/src/features/auth/presentation/screens/LoginScreen";

const Stack = createStackNavigator();

const createMockAuthContext = (overrides: Partial<AuthContextType> = {}): AuthContextType => ({
    isLoggedIn: false,
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

function renderScreen(overrides: Partial<AuthContextType> = {}) {
    return render(
        <AuthContext.Provider value={createMockAuthContext(overrides)}>
            <PaperProvider>
                <NavigationContainer>
                    <Stack.Navigator>
                        <Stack.Screen name="Login" component={LoginScreen} />
                    </Stack.Navigator>
                </NavigationContainer>
            </PaperProvider>
        </AuthContext.Provider>
    );
}

describe("LoginScreen", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("renders correctly", () => {

        it("shows login screen", () => {
            const { getByTestId } = renderScreen();
            expect(getByTestId("login-screen")).toBeTruthy();
        });

        it("shows email and password fields with default values", () => {
            const { getByTestId } = renderScreen();
            expect(getByTestId("email-input").props.value).toBe("a@a.com");
            expect(getByTestId("password-input").props.value).toBe("ThePassword!1");
        });

        it("shows Log In button", () => {
            const { getByTestId } = renderScreen();
            expect(getByTestId("login-button")).toBeTruthy();
        });

        it("shows Forgot password and Sign Up buttons", () => {
            const { getByText } = renderScreen();
            expect(getByText("Forgot password?")).toBeTruthy();
            expect(getByText("Don't have an account? Sign Up")).toBeTruthy();
        });

        it("shows error snackbar when error is set", async () => {
            const { getByText } = renderScreen({ error: "Login failed" });

            await waitFor(() => {
                expect(getByText("Login failed")).toBeTruthy();
            });
        });

    });

    describe("validation", () => {

        it("shows error when email is empty", async () => {
            const { getByText, getByTestId } = renderScreen();

            fireEvent.changeText(getByTestId("email-input"), "");

            await act(async () => {
                fireEvent.press(getByTestId("login-button"));
            });

            await waitFor(() => {
                expect(getByText("Enter email")).toBeTruthy();
            });
        });


        it("shows error when email is invalid", async () => {
            const { getByText, getByTestId } = renderScreen();

            fireEvent.changeText(getByTestId("email-input"), "invalidemail");

            await act(async () => {
                fireEvent.press(getByTestId("login-button"));
            });

            await waitFor(() => {
                expect(getByText("Enter a valid email address")).toBeTruthy();
            });
        });


        it("shows error when password is empty", async () => {
            const { getByText, getByTestId } = renderScreen();

            fireEvent.changeText(getByTestId("email-input"), "a@a.com");
            fireEvent.changeText(getByTestId("password-input"), "");

            await act(async () => {
                fireEvent.press(getByTestId("login-button"));
            });

            await waitFor(() => {
                expect(getByText("Enter password")).toBeTruthy();
            });
        });

        it("shows error when password is too short", async () => {
            const { getByText, getByTestId } = renderScreen();

            fireEvent.changeText(getByTestId("email-input"), "a@a.com");
            fireEvent.changeText(getByTestId("password-input"), "123");

            await act(async () => {
                fireEvent.press(getByTestId("login-button"));
            });

            await waitFor(() => {
                expect(getByText("Password should have at least 6 characters")).toBeTruthy();
            });
        });


        it("does not call login when validation fails", async () => {
            const mockLogin = jest.fn();
            const { getByTestId } = renderScreen({ login: mockLogin });

            fireEvent.changeText(getByTestId("email-input"), "");

            await act(async () => {
                fireEvent.press(getByTestId("login-button"));
            });

            await waitFor(() => {
                expect(mockLogin).not.toHaveBeenCalled();
            });
        });


    });

    describe("interactions", () => {

        it("calls login with correct values", async () => {
            const mockLogin = jest.fn().mockResolvedValue(undefined);
            const { getByTestId } = renderScreen({ login: mockLogin });

            fireEvent.changeText(getByTestId("email-input"), "test@test.com");
            fireEvent.changeText(getByTestId("password-input"), "password123");

            await act(async () => {
                fireEvent.press(getByTestId("login-button"));
            });

            await waitFor(() => {
                expect(mockLogin).toHaveBeenCalledWith("test@test.com", "password123");
            });
        });


        it("calls login with default prefilled values", async () => {
            const mockLogin = jest.fn().mockResolvedValue(undefined);
            const { getByTestId } = renderScreen({ login: mockLogin });

            await act(async () => {
                fireEvent.press(getByTestId("login-button"));
            });

            await waitFor(() => {
                expect(mockLogin).toHaveBeenCalledWith("a@a.com", "ThePassword!1");
            });
        });

        it("clears email error when user starts typing", async () => {
            const { getByText, getByTestId, queryByText } = renderScreen();

            fireEvent.changeText(getByTestId("email-input"), "");

            await act(async () => {
                fireEvent.press(getByTestId("login-button"));
            });

            await waitFor(() => {
                expect(getByText("Enter email")).toBeTruthy();
            });

            await act(async () => {
                fireEvent.changeText(getByTestId("email-input"), "t");
            });

            await waitFor(() => {
                expect(queryByText("Enter email")).toBeNull();
            });
        });


    });

});
