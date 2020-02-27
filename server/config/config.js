/**
|--------------------------------------------------
| PORT ENVIRONMENT
|--------------------------------------------------
*/
process.env.PORT = process.env.PORT || 3000;

/**
|--------------------------------------------------
| ENVIRONMENT
|--------------------------------------------------
*/
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

/**
|--------------------------------------------------
| Vencimiento del token
|--------------------------------------------------
*/
process.env.CADUCIDAD_TOKEN = 30 * 30 * 24 * 30;

/**
|--------------------------------------------------
| Seed de autenticación
|--------------------------------------------------
*/

process.env.SEED = process.env.SEED ||  'secret-seed-loquillo';

/**
|--------------------------------------------------
| Data Base
|--------------------------------------------------
*/

let urlDB;
if(process.env.NODE_ENV === 'dev'){
    urlDB = 'mongodb://localhost:27017/Cafeteria';
}
else {
    urlDB = process.env.MONGO_URI;
}

process.env.URL_DB = urlDB;