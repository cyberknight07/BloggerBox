import 'dotenv/config';
import 'express-async-errors';

import app from './src/app.js';
import { config } from './src/config/index.js';

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} [${config.env}]`);
});
