'use strict';

/*
|--------------------------------------------------------------------------
| Http server
|--------------------------------------------------------------------------
|
| This file bootstrap Adonisjs to start the HTTP server. You are free to
| customize the process of booting the http server.
|
| """ Loading ace commands """
|     At times you may want to load ace commands when starting the HTTP server.
|     Same can be done by chaining `loadCommands()` method after
|
| """ Preloading files """
|     Also you can preload files by calling `preLoad('path/to/file')` method.
|     Make sure to pass relative path from the project root.
*/

const { Ignitor } = require('@adonisjs/ignitor');

new Ignitor(require('@adonisjs/fold'))
  .appRoot(__dirname)
  .fireHttpServer()
  .then(() => {
    const Env = use('Env');
    const Logger = use('Logger');

    if (Env.get('NODE_ENV') === 'development') {
      Logger.level = 'debug';
      use('App/Services/Nuxt').build();
    } else {
      Logger.info('Start in production mode');
      use('App/Services/Nuxt').build();
    }

    use('App/Services/FeedbackScheduler').schedule();
    use('App/Services/SchedulerService').scheduleJobs();
  })
  .then(() => {
    use('Logger').info('Nuxt is ready to handle requests');
  })
  .catch(console.error);
