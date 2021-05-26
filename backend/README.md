# PROJECT_NAME.TOP_LEVEL_DOMAIN Backend

## Running the Project

-   To build the project, run `yarn docker-build`.
-   To run in dev mode, run `yarn docker-dev`.
-   To run in production mode, run `yarn docker-prod`.

Alternatively, to run the Keystone server in a more manual fashion:

-   Run `docker-compose up mongodb redis` to start Mongo and Redis.
-   Run `yarn dev` to start Keystone.

**Notes:**

-   Some environment vars are required to run, see `.env.sample` for the list. Using an `.env` file is supported.
-   To enable sending emails in local development, you'll need to run under AWS credentials that allow access to `ses:SendEmail`.
-   When running in production, make sure to set the `COOKIE_SECRET` environment variable.
-   On the initial run, an admin user will be generated and the credentials will be logged to the console. Note them, as they will be needed in order to access the admin panel.
-   Available docker-compose services: `mongodb`, `redis`, `devbox`, `production`.

## Working with the API

### Creating a new user

```graphql
mutation AddUser($email: String!, $password: String!) {
    createUser(data: { email: $email, password: $password }) {
        email
        id
    }
}
```

### Password auth

```graphql
mutation signin($email: String, $password: String) {
    authenticate: authenticateUserWithPassword(
        email: $email
        password: $password
    ) {
        item {
            id
        }
    }
}
```

This will save a `keystone.sid` authentication cookie. Subsequent requests will be authenticated - make sure to include cookies in requests.

### Google Auth

Navigate to `[BACKEND_URL]/auth/google` to start the process. Same auth cookie will be saved.

Post-authentication, the user will be redirected to the frontend, under the following paths:

-   `/auth/google/error?msg=Error message` in case of an error
-   `auth/google/success` in case of success

### Getting logged-in user data

```graphql
query {
    authenticatedUser {
        id
        email
        firstName
        lastName
    }
}
```

### Update logged-in user

```graphql
mutation updateUser($password: String!) {
    updateAuthenticatedUser(data: { password: $password }) {
        id
    }
}
```

### Logging out

```graphql
mutation {
    unauthenticate: unauthenticateUser {
        success
    }
}
```

### Requesting a password reset

```graphql
mutation resetpass($email: String!) {
    requestResetPassword(email: $email) {
        success
    }
}
```

### Resetting the password

```graphql
mutation resetpass($token: String!, $password: String!) {
    resetPassword(token: $token, password: $password) {
        success
    }
}
```

## Creating schema

See [the Keystone docs](https://www.keystonejs.com/guides/schema).

For each application model, create a file in the `lists` directory that exports a Keystone schema definition object as described above.

Breaking schema extensions and hooks out into separate files is supported by the framework.

### Custom hooks

To create a hook attached to a model, create a file with the same name as the model in the `hooks` directory. Export a method that:

-   accepts two arguments: the current keystone instance (to enable server-side queries) and a reference to the `scheduleTask` method (to schedule background queue tasks)
-   returns an object with the following structure:

```js
module.exports = (keystone, scheduleTask) => ({
    list: {
        // hooks
    },
    field: {
        fieldName: {
            // hooks
        }
    }
```

### Custom extensions

See [the Keystone docs](https://www.keystonejs.com/guides/custom-schema).

Keystone provides basic CRUD functionality for models out of the box. To create additional, custom operations, create a file with the same name as the model in the `extensions` directory. Export a method that:

-   accepts two arguments: the current keystone instance (to enable server-side queries) and a reference to a mongoose model reference (to directly operate with the db)
-   returns an object with the following structure:

```js
module.exports = (keystone, adapter) => ({
    types: [
        {
            type: 'custom type def',
        },
        // ...more custom types
    ],
    mutations: [
        {
            schema: 'custom method dev',
            resolver: implementation(),
        },
        // ...more mutations
    ],
    queries: [
        {
            schema: 'custom method dev',
            resolver: implementation(),
        },
        // ...more mutations
    ],
});
```

By convention, extension implementations should live in the `controllers` directory.

## Access control helper

See [the Keystone docs](https://www.keystonejs.com/guides/access-control).

Basic access control methods are exported from `helpers/access.js`:

-   to check admin status
-   to check user ownership of item via the `.user` field
-   to check if object is the actual user logged-in

These should be extended when more complex relationships are defined within the application.

## Email

A `send` method is implemented and exposed by `helpers/email.js`, via AWS SES.

## Logging

A winston-based logger can be retrieved using `const logger = require('/helpers/logger')('SERVICE_NAME');`.

### Background queue

A background queue based on [Bee-Queue](https://github.com/bee-queue/bee-queue) and Redis as a backend boots up with Keystone. See the `scheduleTask` method in `index.js` to get started with usage. In the baseline template, no task processing code is implemented.
