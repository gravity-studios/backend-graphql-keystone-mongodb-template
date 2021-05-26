// Load .env config for development environments
require('dotenv').config();

const fs = require('fs');
const path = require('path');

const { Keystone } = require('@keystonejs/keystone');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');
const { MongooseAdapter: Adapter } = require('@keystonejs/adapter-mongoose');
const MongoStore = require('connect-mongo');

const { initializeQueue, scheduleTask } = require('./queue');
const googleAuth = require('./helpers/googleAuth');
const passwordAuth = require('./helpers/passwordAuth');

const initialiseData = require('./initial-data');

const PROJECT_NAME = 'PROJECT_NAME.TOP_LEVEL_DOMAIN';

// Boot up Keystone
const keystone = new Keystone({
    adapter: new Adapter({}),
    cookieSecret: process.env.COOKIE_SECRET,
    cookie: {
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : false,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 30,
    },
    sessionStore: MongoStore.create({ mongoUrl: process.env.DATABASE_URL }),
    onConnect: process.env.CREATE_TABLES !== 'true' && initialiseData,
});

initializeQueue(keystone);

// Setup lists
// All schema definitions should be places in the `/lists` dir.
// The filename coresponds to the resulting list name.
// To create custom types, migrations, and queries, create a file with the same name
// in the `extensions` dir, exporting a function that takes in two args
// (the keystone instance and the db adapter for the list) and returns
// an object that will be passed to the `extendGraphQLSchema` method.
// To create custom hooks, create a file with the same name
// in the `hooks` dir, exporting a function that takes in the keystone instance
// and returns the hooks.

fs.readdirSync(path.join(__dirname, 'lists')).forEach((file) => {
    const schemaPath = path.join(__dirname, 'lists', file);
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const listSchema = require(schemaPath);
    const listName = path.basename(file, '.js');

    const hookPath = path.join(__dirname, 'hooks', `${listName}.js`);

    if (fs.existsSync(hookPath)) {
        // eslint-disable-next-line global-require, import/no-dynamic-require
        const hookSchema = require(hookPath);
        const hooks = hookSchema(keystone, scheduleTask);

        listSchema.hooks = hooks.list;

        Object.keys(hooks.field).forEach((field) => {
            listSchema.fields[field].hooks = hooks.field[field];
        });
    }

    const list = keystone.createList(listName, listSchema);
    const extensionPath = path.join(__dirname, 'extensions', `${listName}.js`);

    if (fs.existsSync(extensionPath)) {
        const { adapter } = list;
        // eslint-disable-next-line global-require, import/no-dynamic-require
        const extensionSchema = require(extensionPath);

        keystone.extendGraphQLSchema(extensionSchema(keystone, adapter));
    }
});

// Enable Google Auth
googleAuth(keystone);

module.exports = {
    keystone,
    apps: [
        new GraphQLApp(),
        new AdminUIApp({
            name: PROJECT_NAME,
            enableDefaultRoute: true,
            authStrategy: passwordAuth(keystone),
            isAccessAllowed: ({ authentication: { item: user } }) =>
                !!user && !!user.isAdmin,
        }),
    ],
    configureExpress: (app) => {
        app.set('trust proxy', true);
    },
};
