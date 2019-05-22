/**
 * Winston logger configuration
 */

const appRoot = require('app-root-path');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
  ),
  transports: []
});

if (process.env.NODE_ENV !== 'production') {

  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(
        info => `${info.timestamp} ${info.level}: ${info.message}`
      ),
    )
  }));

}else{

  logger.add(new winston.transports.File({
    filename: `${appRoot}/logs/pb.log`,
    handleExceptions: true,
    format: winston.format.json(),
    level: 'info',
  }));
  
}

module.exports = logger;
