import "dotenv/config";
import { app } from "./app";

const PORT = process.env.PORT ?? 3001;

app.listen(PORT, () => {
  console.info(`[server] Running on port ${PORT} (${process.env.NODE_ENV ?? "development"})`);
});
