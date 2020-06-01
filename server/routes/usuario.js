const express = require('express');
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const app = express();

const { verificaToken, verificaRolAdmin } = require('../middleware/authentication');

app.get('/usuario', verificaToken, (req, res) => {

    let from = req.query.from || 0;
    from = Number(from);

    let limit = req.query.limit || 10;
    limit = Number(limit);

    Usuario.find({ estado: true }, 'nombre email rol estado google img')
        .skip(from)
        .limit(limit)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            Usuario.countDocuments({ estado: true }, (err, total_records) => {
                res.json({
                    ok: true,
                    usuarios,
                    total_records
                });

            })
        });
});

// app.post('/usuario', [verificaToken, verificaRolAdmin], (req, res) => {
app.post('/usuario', (req, res) => {

    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB,
        });
    });
});

app.put('/usuario/:id', [verificaToken, verificaRolAdmin], (req, res) => {
    let id = req.params.id;
    //Valida que aunque mande parámetros que coincidan con el modelo, sólo acepte los siguientes
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }
        if (!usuarioDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: "El usuario no existe"
                }
            })
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        })
    });
});


app.delete('/usuario/:id', [verificaToken, verificaRolAdmin], (req, res) => {
    let id = req.params.id;

    let estado = { estado: false }

    //Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
    Usuario.findByIdAndUpdate(id, estado, { new: true }, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        if (!usuarioBorrado) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: "El usuario no existe"
                }
            })
        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});

module.exports = app;