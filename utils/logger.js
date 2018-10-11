const winston = require('winston');

/**
 * Winston logging configuration
 */
 const logger = winston.createLogger({
     level: 'debug',
     format: winston.format.combine(
         winston.format.timestamp({
           format: 'YYYY-MM-DD HH:mm:ss'
         }),
         winston.format.printf(info => {
             return `${info.timestamp} ${info.level}: ${info.message}`;
         })
     ),
     transports: [
       new winston.transports.Console({
         format: winston.format.combine(
           winston.format.colorize(),
           winston.format.printf(
            info => `${info.timestamp} ${info.level}: ${info.message}`
           )
         )
       }),
       // new winston.transports.File({
       //   filename: 'app.log',
       //   handleExceptions: true,
       //   format: winston.format.combine(
       //     winston.format.colorize(),
       //     winston.format.printf(
       //      info => `${info.timestamp} ${info.level}: ${info.message}`
       //     )
       //   )
       // })
     ]
 });

 module.exports = logger;
