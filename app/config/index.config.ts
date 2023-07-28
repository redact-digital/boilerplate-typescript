import 'dotenv/config';
import convict from 'convict';

import log from './log.config';

const config = convict({
  app: {
    env: {
      doc: 'The application environment.',
      format: ['production', 'development', 'local'],
      default: 'local',
      env: 'NODE_ENV',
    },
    name: {
      doc: 'The name of the application.',
      format: String,
      default: 'Node API',
      env: 'APP_NAME',
    },
  },
  log,
});

config.validate({ allowed: 'strict' });

export default config;
