import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config({
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
        ecmaVersion: 2020,
        globals: {
            ...globals.node,
            ...globals.jest
        }
    },
    rules: {
        "prefer-const": 0,
        "no-var": 0
    }
});
