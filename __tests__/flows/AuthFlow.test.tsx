import AuthFlow from "@/src/AuthFlow";
import { DIProvider } from "@/src/core/di/DIProvider";

import { AuthProvider } from "@/src/features/auth/presentation/context/authContext";
import { NavigationContainer } from "@react-navigation/native";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { PaperProvider } from "react-native-paper";

process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID = "test_project_id";

jest.mock("@react-native-async-storage/async-storage", () =>
    require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// =========================
// TEST APP
// =========================
function TestApp() {
    return (
        <DIProvider>
            <AuthProvider>
                <PaperProvider>
                    <NavigationContainer>
                        <AuthFlow />
                    </NavigationContainer>
                </PaperProvider>
            </AuthProvider>
        </DIProvider>
    );
}

// =========================
// FETCH MOCK
// =========================
const mockFetch = jest.fn();

function mockFetchResponse(body: unknown, status = 200) {
    return Promise.resolve({
        status,
        json: () => Promise.resolve(body),
        ok: status >= 200 && status < 300,
    } as Response);
}

// =========================
// FLOW HELPERS
// =========================
async function loginFlow(
    getByTestId: ReturnType<typeof render>["getByTestId"],
    { email, password }: { email: string; password: string }
) {
    fireEvent.changeText(getByTestId("email-input"), email);
    fireEvent.changeText(getByTestId("password-input"), password);

    await act(async () => {
        fireEvent.press(getByTestId("login-button"));
    });
}

async function signupFlow(
    getByTestId: ReturnType<typeof render>["getByTestId"],
    { email, password }: { email: string; password: string }
) {
    fireEvent.changeText(getByTestId("signup-email-input"), email);
    fireEvent.changeText(getByTestId("signup-password-input"), password);

    await act(async () => {
        fireEvent.press(getByTestId("signup-button"));
    });
}

// =========================
// TESTS
// =========================
describe("Auth integration flow", () => {

    beforeEach(() => {
        jest.clearAllMocks();
        globalThis.fetch = mockFetch;
    });

    afterEach(() => {
        mockFetch.mockReset();
    });

    // =========================
    // TEST 1: sign up → product screen → logout → login
    // =========================
    it("sign up → product screen → logout → login", async () => {

        mockFetch.mockImplementation((url: string) => {
            if (url.includes("/verify-token")) {
                return mockFetchResponse({ message: "unauthorized" }, 401);
            }
            if (url.includes("/signup")) {
                return mockFetchResponse({}, 201);
            }
            if (url.includes("/login")) {
                return mockFetchResponse({
                    accessToken: "mock_token",
                    refreshToken: "mock_refresh_token",
                }, 201);
            }
            if (url.includes("/logout")) {
                return mockFetchResponse({}, 201);
            }
            if (url.includes("/read")) {
                return mockFetchResponse([], 200);
            }
            return mockFetchResponse({ message: "not found" }, 404);
        });

        const { getByTestId } = render(<TestApp />);

        // App starts at Login
        await waitFor(() => {
            expect(getByTestId("login-screen")).toBeTruthy();
        });

        // Navigate to Signup
        await act(async () => {
            fireEvent.press(getByTestId("create-account-button"));
        });

        await waitFor(() => {
            expect(getByTestId("signup-screen")).toBeTruthy();
        });

        // Sign up → auto login → product screen
        await signupFlow(getByTestId, {
            email: "a@a.com",
            password: "ThePassword!1",
        });

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining("/signup"),
                expect.objectContaining({ method: "POST" })
            );
        });

        await waitFor(() => {
            expect(getByTestId("product-screen")).toBeTruthy();
        });

        // Logout
        await act(async () => {
            fireEvent.press(getByTestId("logout-button"));
        });

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining("/logout"),
                expect.objectContaining({ method: "POST" })
            );
        });

        await waitFor(() => {
            expect(getByTestId("login-screen")).toBeTruthy();
        });

        // Login
        await loginFlow(getByTestId, {
            email: "a@a.com",
            password: "ThePassword!1",
        });

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining("/login"),
                expect.objectContaining({ method: "POST" })
            );
        });

        await waitFor(() => {
            expect(getByTestId("product-screen")).toBeTruthy();
        });
    });

    // =========================
    // TEST 2: login → logout → login
    // =========================
    it("login → logout → login", async () => {

        mockFetch.mockImplementation((url: string) => {
            if (url.includes("/verify-token")) {
                return mockFetchResponse({ message: "unauthorized" }, 401);
            }
            if (url.includes("/login")) {
                return mockFetchResponse({
                    accessToken: "mock_token",
                    refreshToken: "mock_refresh_token",
                }, 201);
            }
            if (url.includes("/logout")) {
                return mockFetchResponse({}, 201);
            }
            if (url.includes("/read")) {
                return mockFetchResponse([], 200);
            }
            return mockFetchResponse({ message: "not found" }, 404);
        });

        const { getByTestId } = render(<TestApp />);

        // App starts at Login
        await waitFor(() => {
            expect(getByTestId("login-screen")).toBeTruthy();
        });

        // Login
        await loginFlow(getByTestId, {
            email: "a@a.com",
            password: "ThePassword!1",
        });

        await waitFor(() => {
            expect(getByTestId("product-screen")).toBeTruthy();
        });

        // Logout
        await act(async () => {
            fireEvent.press(getByTestId("logout-button"));
        });

        await waitFor(() => {
            expect(getByTestId("login-screen")).toBeTruthy();
        });

        // Login again
        await loginFlow(getByTestId, {
            email: "a@a.com",
            password: "ThePassword!1",
        });

        await waitFor(() => {
            expect(getByTestId("product-screen")).toBeTruthy();
        });
    });
});
