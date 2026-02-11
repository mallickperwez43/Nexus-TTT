import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";

const LoginScreen = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [focusedField, setFocusedField] = useState(null); // Track focus

    const { login } = useAuthStore();
    const { currentTheme, themeConfig } = useThemeStore();
    const theme = themeConfig[currentTheme];
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        const result = await login({ email, password });
        if (result.success) {
            navigate("/");
        } else {
            setError(result.error);
        }
    };

    // Helper to match SignupScreen focus logic
    const getBorderStyle = (fieldName) => ({
        color: theme.textColor,
        borderColor: focusedField === fieldName ? theme.xColor : `${theme.headingColor}33`,
    });

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-full max-w-md p-8 space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="text-center">
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter" style={{ color: theme.headingColor }}>
                        Access Terminal
                    </h2>
                    <p
                        className="text-[10px] font-bold tracking-[0.4em] uppercase mt-1"
                        style={{ color: theme.headingColor, opacity: 0.5 }}
                    >
                        Identify Operator
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-4">
                        <input
                            type="email"
                            placeholder="EMAIL"
                            className="w-full bg-white/5 border-b-2 p-4 outline-none transition-all duration-300 font-bold tracking-widest text-sm"
                            style={getBorderStyle("email")}
                            onFocus={() => setFocusedField("email")}
                            onBlur={() => setFocusedField(null)}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="PASSWORD"
                            className="w-full bg-white/5 border-b-2 p-4 outline-none transition-all duration-300 font-bold tracking-widest text-sm"
                            style={getBorderStyle("password")}
                            onFocus={() => setFocusedField("password")}
                            onBlur={() => setFocusedField(null)}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-[10px] font-black uppercase text-center animate-pulse">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="w-full py-4 font-black uppercase tracking-widest text-xs transition-all active:scale-95 hover:opacity-90"
                        style={{ backgroundColor: theme.buttonBg, color: theme.buttonText }}
                    >
                        Authenticate
                    </button>
                </form>

                <p
                    className="text-center text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: theme.headingColor, opacity: 0.6 }}
                >
                    New Operator?{" "}
                    <Link
                        to="/signup"
                        className="underline transition-opacity hover:opacity-100"
                        style={{ color: theme.xColor }}
                    >
                        Create Profile
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginScreen;