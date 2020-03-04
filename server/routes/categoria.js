const express = require('express');
let { verificaToken, verificaRolAdmin } = require('../middleware/authentication');
const _ = require('underscore');
let app = express();

let Categoria = require('../models/categoria');

app.get('/categoria', verificaToken, (req, res) => {
    let offset = req.query.offset || 0;
    offset = Number(offset);

    let limit = req.query.limit || 10;
    limit = Number(limit);

    Categoria.find()
        .skip(offset)
        .limit(limit)
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            if(err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            Categoria.countDocuments((err, total_records) => {
                res.json({
                    ok: true,
                    categorias,
                    total_records
                })
            });
        });
    
});

app.get('/categoria/:id', verificaToken, (req, res) => {
    
    let id = req.params.id;

    Categoria.findById(id, (err, categoriaDB) => {
        console.log({err,categoriaDB});
        if(err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if(!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "La categoría no existe"
                }
            })
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        })
    });

})

app.post('/categoria', verificaToken, (req, res) => {
    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err, categoriaDB)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        })
    });
});

app.put('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    let body = req.body;
    let catDesc = {
        descripcion: body.descripcion
    }

    Categoria.findByIdAndUpdate(id, catDesc, {new: true, runValidators: true}, (err, categoriaDB) =>{
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "La categoría no existe"
                }
            })
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        })
    });
});

app.delete('/categoria/:id', [verificaToken, verificaRolAdmin],(req, res) => {
    
    let id = req.params.id;
    
        Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }
        if (!categoriaBorrada) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: "La categoría no existe"
                }
            })
        }
        res.json({
            ok: true,
            message: "Categoría borrada"
        });
    });
});

module.exports = app;