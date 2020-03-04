const express = require('express');
const { verificaToken } = require('../middleware/authentication');

let app = express();
let Producto = require('../models/producto');

app.get('/producto', verificaToken, (req, res) => {

    let offset = req.query.offset || 0;
    offset = Number(offset);

    let limit = req.query.limit || 10;
    limit = Number(limit);

    Producto.find({disponible: true})
        .skip(offset)
        .limit(limit)
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, productos) => {
            if(err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            Producto.countDocuments({disponible: true},(err, total_records) => {
                res.json({
                    ok: true,
                    productos,
                    total_records
                })
            });
        });
});

app.get('/productos/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Producto.findById(id)
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, productoDB) => {
            if(err){
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if(!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Producto no encontrado'
                    }
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });
        });
});

app.get('/productos/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if(err){
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            })
        });
});

app.post('/productos', verificaToken, (req, res) => {
    let body = req.body;

    let producto = new Producto({
        usuario: req.usuario._id,
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoriaId,
    });

    producto.save((err, productoDB) => {
        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    });
})

app.put('/productos/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;
    let prodDesc = {
        nombre: body.nombre,
        descripcion: body.descripcion,
        precioUni: body.precioUni,
        categoria: body.categoria,
        disponible: body.disponible
    }

    Producto.findByIdAndUpdate(id, prodDesc, {new: true, runValidators: true},(err, productoDB) => {
        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El producto no existe'
                }
            })
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    })

});

app.delete('/productos/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let disponible = { disponible: false }
    Producto.findByIdAndUpdate(id, disponible, {new: true}, (err, productoDB) => {
        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err:  {
                    message: 'El producto no existe'
                }
            })
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    });

});

module.exports = app;