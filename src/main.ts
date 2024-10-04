import { app } from "./app";
import { Logger } from "./shared/libs";
import { db } from "./database/data-source";

const PORT = process.env.NODE_PORT || 9100;

async function main() {
    await db.init();
    await db.onAppInit();

    app.listen(PORT, () => {
        Logger.info(`Server is running on http://localhost:${PORT}`);
    });
}

main().catch((err) => {
    Logger.error(err);
    process.exit(1);
});
