import tseslint from "typescript-eslint";

export default tseslint.config(
    ...tseslint.configs.recommended,
    {
        files: ["**/*.ts", "**/*.tsx"],
        rules: {
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                },
            ],
        },
    },
    {
        ignores: [
            "dist/**",
            "node_modules/**",
            ".astro/**",
            "*.config.*",
            "public/**",
            "**/*.astro",
        ],
    },
);
