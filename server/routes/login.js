const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');
const app = express();
const hana = require('@sap/hana-client');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

const conn = hana.createConnection();

var conn_params = {
    host: 'zeus.hana.prod.us-east-1.whitney.dbaas.ondemand.com',
    port: '21022',
    encrypt: 'true',
    uid: '8CBF2288685740AA945F5558E223EA16_50M8CYC454A2N6GSSCG34NHTR_DT',
    pwd: 'Qb3pTg_QBri4LJyzPqpNZJKJpFpM7EFt4xXrGAzIrUPLlhrU2jf9EpD7mRVMHWXGfafIoke0UGS.AEMWfxyZILTaLDDoDiG-cqbcyW-ytY2hu2en6TZQzu-O4ZPfMIeC'
};


app.get('/saphana', (req, res) => {
    conn.connect(conn_params, function (err) {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        const id = '_' + Math.random().toString(36).substr(2, 9);
        // CREATE TABLE Test (id INTEGER PRIMARY KEY, msg VARCHAR(128))
        // conn.exec("INSERT INTO Test VALUES(1, 'msg')", (err, result) => {
        //     if(err) {
        //         return res.status(400).json({
        //             ok: false,
        //             err
        //         });
        //     }
        //     res.json({
        //         data: result,
        //         ok: true
        //     });
        // });



        conn.exec('SELECT * FROM Test', function (err, result) {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                data: result,
                ok: true
            });
            conn.disconnect();

        });
    });
});

app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o contraseña incorrectos'
                }
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o contraseña incorrectos'
                }
            });
        }

        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });
    });
});

//Configuraciones de google

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }

}


app.post('/google', async (req, res) => {

    let token = req.body.idtoken;

    let googleUser = await verify(token)
        .catch(e => {
            res.status(403).json({
                ok: false,
                err: e
            })
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {

        if (err) {
            res.status(500).json({
                ok: false,
                err
            });
        }
        if (usuarioDB) {

            if (!usuarioDB.google) {
                res.status(400).json({
                    ok: false,
                    err: {
                        message: "Debe usar su autenticación normal"
                    }
                });
            } else {

                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                })

            }
        } else {

            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':3';

            usuario.save((err, usuariodb) => {
                if (err) {
                    res.status(500).json({
                        ok: false,
                        err
                    });
                }
                let token = jwt.sign({
                    usuario: usuariodb
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuariodb,
                    token
                })
            });
        }
    });
});


module.exports = app;