import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ["**/*.astro"],
        languageOptions: {
            parser: "@astrojs/eslint-parser",
            ecmaVersion: "latest",
            sourceType: "module",
        },
        plugins: {
            "@astrojs": "@astrojs/eslint-plugin",
        },
        rules: {
            "@astrojs/recommended": "error",
        },
    },
    {
        files: ["**/*.ts", "**/*.tsx"],
        ...tseslint.configs.recommended,
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
            "dist",
            "node_modules",
            ".astro",
            "*.config.*",
            "public",
        ],
    },
];
