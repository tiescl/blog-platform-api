import { app } from "@/app";

const PORT = process.env.PORT || 9100;

async function main() {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:9100`);
    });
}

main().catch((error) => {
    console.log(error);
    process.exit(1);
});
