import 'dotenv/config';

import app from './app.js';

const PORT = Number(process.env.PORT) || 3000;

const server = app.listen(PORT, () => {
  console.log(`SkillNovaGroup T&D API running on port ${PORT}`);
});

export default server;