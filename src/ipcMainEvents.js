import { ipcMain, dialog } from 'electron'

import isImage from 'is-image'
import filesize from 'filesize'
import fs from 'fs'
import path from 'path'

function setMainIpc (win) {
  // cuadro de dialogo del boton abrir
  ipcMain.on('open-directory', (event) => {
    dialog.showOpenDialog(win, {
      title: 'Seleccione la nueva ubicación',
      buttonLabel: 'Abrir ubicación',
      properties: ['openDirectory']
    },
  (dir) => {
    if (dir) {
      loadImages(event, dir[0])
      }
  })
})

ipcMain.on('load-directory', (event, dir) => {
  loadImages(event, dir)
})

  // cuadro de dialogo del boton guardar
  ipcMain.on('open-save-dialog', (event, ext) => {
    dialog.showSaveDialog(win, {
      title: 'Guardad imagen modificada',
      buttonLabel: 'Guardar imagen',
      filters: [{name:'Images', extensions: [ext.substr(1)]}]
    }, (file => {
      if (file) {
        event.sender.send('save-image', file)
      }

    }))
  })

  // mostrando mensaje de confirmacion o error de guardado
  ipcMain.on('show-dialog', (event, info) => {
    dialog.showMessageBox(win, {
      type: info.type,
      title: info.title,
      message: info.message
    })
  })
}

function loadImages (event, dir) {
  const images = []
  // leemos el directorio seleccionado
  fs.readdir(dir, (err, files) => {
    if (err) throw err

    for (let i = 0; i < files.length; i++) {
      // recorremos todos los archivos de un directorio y preguntamos si es una imagen
      if (isImage(files[i])) {
        // devuelve la ruta completa de la imagen que se esta procesando
        let imageFile = path.join(dir, files[i])
        // cons statSync se obtiene informacion del archivo como tamanio
        let stats = fs.statSync(imageFile)
        // luego utilizamos el modulo filesize para calcular el tamanio del archivo
        // a un lenguaje mas humano
        let size = filesize(stats.size, {round: 0})
        // agregamos al arrar images toda la informacion en un objeto
        images.push({filename: files[i], src:`file://${imageFile}`,size: size})
      }
    }
    // enviamos por el evento la lista de imagenes procesadas, este event de de la primera
    // linea ipcMain.on('open-directory', (event)
    // cuando se procesa toda la lista de imagenes lanzamos el evento load-images definido en el proceso de rendirizado
    event.sender.send('load-images', dir, images)
  })
}
module.exports = setMainIpc
