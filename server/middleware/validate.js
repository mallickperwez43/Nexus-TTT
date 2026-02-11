const { z } = require("zod");

const signupSchema = z.object({
    username: z.string()
        .min(3, "Username must be 3+ characters")
        .max(15, "Username max 15 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "No special characters"),
    email: z.email("Invalid email address"),
    password: z.string().min(6, "Password must be 6+ characters"),
});

const loginSchema = z.object({
    email: z.email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: result.error.errors[0].message });
    }
    next();
};

module.exports = { signupSchema, loginSchema, validate };