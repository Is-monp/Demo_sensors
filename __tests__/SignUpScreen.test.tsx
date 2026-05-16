import { AuthContext, AuthContextType } from "@/src/features/auth/presentation/context/authContext";
import SignupScreen from "@/src/features/auth/presentation/screens/SignupScreen";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { PaperProvider } from "react-native-paper";



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

const navigationMock = {
    goBack: jest.fn(),
    navigate: jest.fn(),
};

function renderScreen(overrides: Partial<AuthContextType> = {}) {
    return render(
        <AuthContext.Provider value={createMockAuthContext(overrides)}>
            <PaperProvider>
                <SignupScreen navigation={navigationMock} />
            </PaperProvider>
        </AuthContext.Provider>
    );
}


describe("SignupScreen", () => {

    // =========================
    // RENDER
    // =========================

    it("renders correctly", () => {
        const { getByTestId, getByText } = renderScreen();

        expect(getByTestId("signup-screen")).toBeTruthy();
        expect(getByTestId("signup-email-input")).toBeTruthy();
        expect(getByTestId("signup-password-input")).toBeTruthy();
        expect(getByTestId("signup-button")).toBeTruthy();
        expect(getByTestId("go-to-login-button")).toBeTruthy();
        expect(getByText("Create an Account")).toBeTruthy();
    });

    it("starts with empty fields", () => {
        const { getByTestId } = renderScreen();

        expect(getByTestId("signup-email-input").props.value).toBe("");
        expect(getByTestId("signup-password-input").props.value).toBe("");
    });

    // =========================
    // EMAIL VALIDATION
    // =========================

    it("shows error when email is empty", async () => {
        const { getByText, getByTestId } = renderScreen();

        fireEvent.changeText(getByTestId("signup-email-input"), "");

        await act(async () => {
            fireEvent.press(getByTestId("signup-button"));
        });

        await waitFor(() => {
            expect(getByText("Enter email")).toBeTruthy();
        });
    });

    it("shows error when email is invalid", async () => {
        const { getByText, getByTestId } = renderScreen();

        fireEvent.changeText(getByTestId("signup-email-input"), "invalidemail");

        await act(async () => {
            fireEvent.press(getByTestId("signup-button"));
        });

        await waitFor(() => {
            expect(getByText("Enter a valid email address")).toBeTruthy();
        });
    });

    it("clears email error when user starts typing", async () => {
        const { getByText, getByTestId, queryByText } = renderScreen();

        fireEvent.changeText(getByTestId("signup-email-input"), "");

        await act(async () => {
            fireEvent.press(getByTestId("signup-button"));
        });

        await waitFor(() => {
            expect(getByText("Enter email")).toBeTruthy();
        });

        await act(async () => {
            fireEvent.changeText(getByTestId("signup-email-input"), "t");
        });

        await waitFor(() => {
            expect(queryByText("Enter email")).toBeNull();
        });
    });

    // =========================
    // PASSWORD VALIDATION
    // =========================

    it("shows error when password is empty", async () => {
        const { getByText, getByTestId } = renderScreen();

        fireEvent.changeText(getByTestId("signup-email-input"), "test@test.com");
        fireEvent.changeText(getByTestId("signup-password-input"), "");

        await act(async () => {
            fireEvent.press(getByTestId("signup-button"));
        });

        await waitFor(() => {
            expect(getByText("Enter password")).toBeTruthy();
        });
    });

    it("shows error when password is too short", async () => {
        const { getByText, getByTestId } = renderScreen();

        fireEvent.changeText(getByTestId("signup-email-input"), "test@test.com");
        fireEvent.changeText(getByTestId("signup-password-input"), "123");

        await act(async () => {
            fireEvent.press(getByTestId("signup-button"));
        });

        await waitFor(() => {
            expect(getByText("Password should have at least 6 characters")).toBeTruthy();
        });
    });

    it("clears password error when user starts typing", async () => {
        const { getByText, getByTestId, queryByText } = renderScreen();

        fireEvent.changeText(getByTestId("signup-email-input"), "test@test.com");
        fireEvent.changeText(getByTestId("signup-password-input"), "");

        await act(async () => {
            fireEvent.press(getByTestId("signup-button"));
        });

        await waitFor(() => {
            expect(getByText("Enter password")).toBeTruthy();
        });

        await act(async () => {
            fireEvent.changeText(getByTestId("signup-password-input"), "p");
        });

        await waitFor(() => {
            expect(queryByText("Enter password")).toBeNull();
        });
    });

    // =========================
    // SUBMIT
    // =========================

    it("does not call signup when validation fails", async () => {
        const mockSignup = jest.fn();
        const { getByTestId } = renderScreen({ signup: mockSignup });

        fireEvent.changeText(getByTestId("signup-email-input"), "");

        await act(async () => {
            fireEvent.press(getByTestId("signup-button"));
        });

        await waitFor(() => {
            expect(mockSignup).not.toHaveBeenCalled();
        });
    });

    it("calls signup with correct values", async () => {
        const mockSignup = jest.fn().mockResolvedValue(undefined);
        const { getByTestId } = renderScreen({ signup: mockSignup });

        fireEvent.changeText(getByTestId("signup-email-input"), "test@test.com");
        fireEvent.changeText(getByTestId("signup-password-input"), "password123");

        await act(async () => {
            fireEvent.press(getByTestId("signup-button"));
        });

        await waitFor(() => {
            expect(mockSignup).toHaveBeenCalledWith("test@test.com", "password123");
        });
    });

    it("trims email before calling signup", async () => {
        const mockSignup = jest.fn().mockResolvedValue(undefined);
        const { getByTestId } = renderScreen({ signup: mockSignup });

        fireEvent.changeText(getByTestId("signup-email-input"), "  test@test.com  ");
        fireEvent.changeText(getByTestId("signup-password-input"), "password123");

        await act(async () => {
            fireEvent.press(getByTestId("signup-button"));
        });

        await waitFor(() => {
            expect(mockSignup).toHaveBeenCalledWith("test@test.com", "password123");
        });
    });


    // =========================
    // NAVIGATION
    // =========================

    it("navigates back when go to login is pressed", async () => {
        const { getByTestId } = renderScreen();

        await act(async () => {
            fireEvent.press(getByTestId("go-to-login-button"));
        });

        expect(navigationMock.goBack).toHaveBeenCalled();
    });


    // =========================
    // SERVER ERROR
    // =========================

    it("shows snackbar when server returns error", async () => {
        const { getByTestId } = renderScreen({ error: "Email already in use" });

        await waitFor(() => {
            expect(getByTestId("signup-error-snackbar")).toBeTruthy();
        });
    });
});
