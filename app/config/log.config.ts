import path from 'path';

export default {
  level: {
    doc: 'The log level to use. This only applies to when the environment is set to production or development',
    format: ['info', 'warn', 'error', 'critical'],
    default: 'info',
    env: 'LOG_LEVEL',
  },
  transports: {
    doc: 'The transports to use for logging. This only applies to when the environment is set to production or development',
    format: Array,
    default: ['console', 'file'],
    env: 'LOG_TRANSPORTS',
  },
  file: {
    doc: 'The file name to use for logging. This only applies to when the environment is set to production or development, and the file transport is enabled',
    format: String,
    default: path.join(__dirname, '../../storage/logs/info.log'),
    env: 'LOG_FILE',
  },
  datadog: {
    apiKey: {
      doc: 'The api key to use for datadog logging. This only applies to when the environment is set to production or development, and the datadog transport is enabled',
      format: String,
      default: 'secret',
      env: 'LOG_DATADOG_API_KEY',
      sensitive: true,
    },
  },
};
