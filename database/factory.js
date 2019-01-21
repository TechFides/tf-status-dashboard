'use strict';

/*
|--------------------------------------------------------------------------
| Factory
|--------------------------------------------------------------------------
|
| Factories are used to define blueprints for database tables or Lucid
| models. Later you can use these blueprints to seed your database
| with dummy data.
|
*/

const Factory = use('Factory');

Factory.blueprint('Adonis/Acl/Role', (faker, index, data) => {
  const defaultValue = {
    slug: 'admin',
    name: 'Administrator',
  };

  return Object.assign(defaultValue, data);
});

Factory.blueprint('App/Models/User', (faker, index, data) => {
  const defaultValue = {
    first_name: 'test',
    last_name: 'test',
    username: 'test',
  };

  return Object.assign(defaultValue, data);
});
