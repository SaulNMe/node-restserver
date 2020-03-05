/**
|--------------------------------------------------
| Verificar token
|--------------------------------------------------
*/
const jwt = require('jsonwebtoken');

let verificaToken = (req, res, next) => {
    let token = req.get('token');   
    
    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if(err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            })
        }

        req.usuario = decoded.usuario;
        next();

    });
};

/**
|--------------------------------------------------
| Verifica Rol
|--------------------------------------------------
*/
let verificaRolAdmin = (req, res, next) => {
    let usuario = req.usuario;
    if(usuario.role != 'ADMIN_ROLE') {
        return res.status(401).json({
            of: false,
            err: {
                message: 'No cuenta con los permisos necesarios para realizar esta acción'
            }
        })
    }
    next();
};

/**
|--------------------------------------------------
| Verifica token para imagen
|--------------------------------------------------
*/
let verificaTokenImg = (req, res, next) => {

    let token = req.query.token;

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if(err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            })
        }

        req.usuario = decoded.usuario;
        next();

    });


}


module.exports = { 
    verificaToken,
    verificaRolAdmin,
    verificaTokenImg
};