## Description

This is Backend for vermuda project

## Installation

### Environment

- Nodejs
- Nestjs
- MySql

### Install package

```bash
# install package
$ yarn
```

### Set .env file in root of project

```bash
# configuration for .env file

DB_HOST=<YOUR_DATABASE_HOST>
DB_DATABASE=<YOUR_DATABASE_NAME>
DB_USER=<YOUR_DATABASE_USER>
DB_PASSWORD=<YOUR_DATABASE_PASSWORD>
DB_PORT=<YOUR_DATABASE_PORT>

API_KEY=<YOUR_API_KEY>
JWT_SECRET=<YOUR_JWT_SECRET>
```

### Run project

```bash
# build
$ yarn build

# migration database
$ yarn typeorm migration:run

# start project
$ yarn start
```

## Start

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```

## Stay in touch

- Author
#   v e r m u d a - b a c k e n d - P h a t T r i e n W e b  
 