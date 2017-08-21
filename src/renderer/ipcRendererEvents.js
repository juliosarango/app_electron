/*
El proceso principal es el proceso de Node.js (main process) que interactua con
los recursos nativos de la maquina, y el otro proceso de Electron es el procesos
de renderizado (rendered process), los dos procesos corren en dos hilos diferentes.
*/

import { ipcRenderer } from 'electron'
import { addImagesEvents, selectFirstImage, clearImages, loadImages} from './images-ui'
import { saveImage } from './filters'
import path from 'path'

function setIpc () {
  // lo que se ejecuta cuando enviamos el evento 'load-images'
  ipcRenderer.on('load-images', (event, images) => {
    clearImages()
    loadImages(images)
    addImagesEvents()
    selectFirstImage()
  })

  // lo que se ejecuta cuando guardamos la imagen
  ipcRenderer.on('save-image', (event, file) => {
    saveImage(file, (err) => {
      if (err) {
        return showDialog('error','Platzipics', err.message)
      }
    showDialog('info','Platzipics', 'Imagen guardada correctamente.')
    })
  })
}

// desde esta funcion enviamos un evento al archivo index.js la cual se abre en  ipcMain.on('open-directory', (event) => { .....
function openDirectory () {
  ipcRenderer.send('open-directory')
}

function showDialog (type, title, msg) {
  ipcRenderer.send('show-dialog', {type: type, title: title, message: msg})
}

// desde esta funcion enviamos un evento al archivo index.js la cual se abre en  ipcMain.on('open-save-dialog', (event) => { .....
function saveFile () {
  // extraemos informacion de la extension del dataset.original que se guarda al seleccionar una imagen
  const image = document.getElementById('image-displayed').dataset.original
  const ext = path.extname(image)
  // enviamos la extension al proceso de guardado en el main.
  ipcRenderer.send('open-save-dialog',ext)
}

module.exports = {
  setIpc: setIpc,
  openDirectory: openDirectory,
  saveFile: saveFile
}
