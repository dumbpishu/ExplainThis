import app from "./app";
import { ENV } from "./config/env";

const PORT = ENV.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
