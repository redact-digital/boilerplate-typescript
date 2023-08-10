import os from 'os';
import type { TransformableInfo } from 'logform';
import { addColors, createLogger, format, transports } from 'winston';
import DatadogWinston from 'datadog-winston';
import config from '../config/index.config';

/**
 * Logging levels in winston conform to the severity ordering specified by RFC5424: severity of all levels is assumed to
 *  be numerically ascending from most important to least important.
 */
enum LogLevels {
  CRITICAL = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
}

enum LogColors {
  CRITICAL = 'bold white redBG',
  ERROR = 'bold red',
  WARN = 'bold yellow',
  INFO = 'bold cyan',
}

interface Transports {
  console: transports.ConsoleTransportInstance;
  file: transports.FileTransportInstance;
  datadog: DatadogWinston;
}

/**
 * Define the levels that winston will use. This is used later on
 * when we create the logger
 */
const logLevels = {
  critical: LogLevels.CRITICAL,
  error: LogLevels.ERROR,
  warn: LogLevels.WARN,
  info: LogLevels.INFO,
};

/**
 * This lets us add custom logging levels and colors so that
 * winston recognizes them
 */
addColors({
  critical: LogColors.CRITICAL,
  error: LogColors.ERROR,
  warn: LogColors.WARN,
  info: LogColors.INFO,
});

/**
 * This is the format that will be used for all logs except File logs
 */
const formatter = format.combine(
  /** Adds color to the format */
  format.colorize(),

  /** Adds timestamp to the format */
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),

  /** Format the way the log is output to the console */
  format.printf((info: TransformableInfo) => {
    const { timestamp, level, ...meta } = info;
    let message = undefined;
    if (meta.message) message = <string>meta.message;

    if (Object.keys(meta).length > 1) {
      delete meta.message;
      message = `${message} \n${JSON.stringify(meta, null, 2)}`;
    }

    return `${timestamp} [${level}]: ${message}`;
  }),
);

/**
 * This is the format that will be used for all File logs
 * The only difference is that we don't want to add color because it will mess up the log file
 */
const fileFormatter = format.combine(
  /** Adds timestamp to the format */
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),

  /** Format the way the log is output to the console */
  format.printf((info: TransformableInfo) => {
    const { timestamp, level, ...meta } = info;
    let message = undefined;
    if (meta.message) message = <string>meta.message;

    if (Object.keys(meta).length > 1) {
      delete meta.message;
      message = `${message} \n${JSON.stringify(meta, null, 2)}`;
    }

    return `${timestamp} [${level}]: ${message}`;
  }),
);

/** ======================================== Defineing Transports ============================================ */
const transporters: Transports = {
  console: new transports.Console({
    format: formatter,
  }),
  file: new transports.File({
    filename: config.get('log.file'),
    format: fileFormatter,
  }),
  datadog: new DatadogWinston({
    apiKey: config.get('log.datadog.apiKey'),
    ddsource: 'nodejs',
    ddtags: `env:${config.get('app.env')}`,
    service: config.get('app.name'),
    hostname: os.hostname(),
  }),
};

/**
 * Create the local logger. We include the console transport only and
 * include all levels since this is only intended for development
 */
// eslint-disable-next-line import/no-mutable-exports
let log = createLogger({ level: 'info', transports: transporters.console, levels: logLevels });

const transportsToUse = [];
for (const transport of config.get('log.transports').split(',')) {
  switch (transport) {
    case 'console':
      transportsToUse.push(transporters.console);
      break;
    case 'file':
      transportsToUse.push(transporters.file);
      break;
    case 'datadog':
      transportsToUse.push(transporters.datadog);
      break;
    default:
      transportsToUse.push(transporters.console);
      break;
  }
}

/**
 * Determine which transports to use based on the configuration of the app
 */
if (config.get('app.env') === 'production' || config.get('app.env') === 'development') {
  log = createLogger({
    level: config.get('log.level'),
    transports: transportsToUse,
    levels: logLevels,
  });
}

export default log;
