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
| Data Base
|--------------------------------------------------
*/

let urlDB;
if(process.env.NODE_ENV === 'dev'){
    urlDB = 'mongodb://localhost:27017/Cafeteria';
}
else {
    urlDB = 'mongodb+srv://loquillonme:3xFJv91H3ZH27Bre@cluster0-8hkl0.mongodb.net/cafe?retryWrites=true&w=majority'
}

process.env.URL_DB = urlDB;