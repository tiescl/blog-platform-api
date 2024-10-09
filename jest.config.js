/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
    testEnvironment: "node",
    moduleDirectories: ["node_modules", "src"],
    transform: {
        "^.+.tsx?$": ["@swc/jest"]
    }
};
