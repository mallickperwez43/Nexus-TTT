import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";

const SignupScreen = () => {
    const [formData, setFormData] = useState({ username: "", email: "", password: "" });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    // Track which field is currently active
    const [focusedField, setFocusedField] = useState(null);

    const { signup } = useAuthStore();
    const { currentTheme, themeConfig } = useThemeStore();
    const theme = themeConfig[currentTheme];
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const result = await signup(formData);
        if (result.success) {
            navigate("/login");
        } else {
            setError(result.error);
            setIsLoading(false);
        }
    };

    // Helper to get dynamic border color
    const getBorderStyle = (fieldName) => ({
        color: theme.textColor,
        // If focused, use theme color. If not, use a faint version of the heading color.
        borderColor: focusedField === fieldName ? theme.xColor : `${theme.headingColor}33`,
    });

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
            <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center">
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter" style={{ color: theme.headingColor }}>
                        Create Identity
                    </h2>
                    <p className="text-[10px] font-bold tracking-[0.3em] uppercase mt-2" style={{ color: theme.headingColor, opacity: 0.6 }}>
                        Register on the Neural Network
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="USERNAME"
                        className="w-full bg-white/5 border-b-2 p-4 font-bold tracking-widest outline-none transition-all duration-300  text-sm"
                        style={getBorderStyle("username")}
                        onFocus={() => setFocusedField("username")}
                        onBlur={() => setFocusedField(null)}
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        required
                    />

                    <input
                        type="email"
                        placeholder="EMAIL ADDRESS"
                        className="w-full bg-white/5 border-b-2 p-4 font-bold tracking-widest outline-none transition-all duration-300  text-sm"
                        style={getBorderStyle("email")}
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => setFocusedField(null)}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />

                    <input
                        type="password"
                        placeholder="ACCESS KEY (PASSWORD)"
                        className="w-full bg-white/5 border-b-2 p-4 font-bold tracking-widest outline-none transition-all duration-300  text-sm"
                        style={getBorderStyle("password")}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField(null)}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />

                    {error && (
                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest text-center animate-bounce">
                            Error: {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 font-black uppercase tracking-[0.2em] text-sm transition-all active:scale-95 disabled:opacity-50"
                        style={{ backgroundColor: theme.buttonBg, color: theme.buttonText }}
                    >
                        {isLoading ? "Processing..." : "Initialize Profile"}
                    </button>
                </form>

                <p className="text-center text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.headingColor, opacity: 0.6 }}>
                    Existing Operator?{" "}
                    <Link to="/login" className="underline transition-opacity hover:opacity-100" style={{ color: theme.xColor }}>
                        Login Here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignupScreen;