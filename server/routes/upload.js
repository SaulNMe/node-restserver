const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');

let Usuario = require('../models/usuario');
let Producto = require('../models/producto');

let app = express();

app.use(fileUpload({ useTempFiles: true }));

app.put('/upload/:type/:id', (req, res) =>{
    
    let type = req.params.type;
    let id = req.params.id;

    if(!req.files) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha seleccionado ningún archivo'
            }
        })
    }

    //Validar tipo
    let validType = ['productos', 'usuarios'];
    if(validType.indexOf(type) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'El tipo no es válido'
            }
        })
    }


    let archivo = req.files.archivo;
    let fileExtension = archivo.name.split('.');
    let ext = fileExtension[fileExtension.length-1];

    //Extensiones permitidas
    let validExt = ['jpg', 'png', 'gif', 'jpeg'];

    if(validExt.indexOf(ext) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones permitidas son ' + validExt.join(', '),
                extension: ext
            },
        })
    }

    //Cambiar el nombre del archivo
    let nombreArchivo = `${id}-${Math.random().toString(36).substr(2, 9)}.${ext}`;

    archivo.mv(`uploads/${ type }/${ nombreArchivo }`, (err)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

       //Valida usuario
       if(type === 'usuarios') {
           imagenUsuario(id, res, nombreArchivo);
       } 
       else {
           imagenProducto(id, res, nombreArchivo);
       }

    });

});


function imagenUsuario (id, res, nombreArchivo){
    
    Usuario.findById(id, (err, usuarioDB)=> {
        if(err){
            borrarArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if(!usuarioDB) {
            borrarArchivo(nombreArchivo, 'usuarios');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No existe este usuario'
                }
            });
        }
        
        borrarArchivo(usuarioDB.img, 'usuarios');

        usuarioDB.img = nombreArchivo;

        usuarioDB.save((err, usuarioGuardado) => {
            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            });
        });


    });
}

function imagenProducto(id, res, nombreArchivo) {

    Producto.findById(id ,(err, productoDB) => {

        if(err){
            borrarArchivo(nombreArchivo, 'productos');
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!productoDB) {
            borrarArchivo(nombreArchivo, 'productos');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No existe este producto'
                }
            });
        }
        
        borrarArchivo(productoDB.img, 'productos');

        productoDB.img = nombreArchivo;

        productoDB.save((err, productoGuardado) => {
            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            });
        });
    });
}

function borrarArchivo(nombreImagen, tipo) {

    let pathImg = path.resolve(__dirname, `../../uploads/${tipo}/${ nombreImagen }`);        
    if(fs.existsSync(pathImg)){
        fs.unlinkSync(pathImg);
    }

}

module.exports = app;