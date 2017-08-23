/*
El proceso principal es el proceso de Node.js (main process) que interactua con
los recursos nativos de la maquina, y el otro proceso de Electron es el procesos
de renderizado (rendered process), los dos procesos corren en dos hilos diferentes.
*/

import { ipcRenderer, remote } from 'electron'
import settings from 'electron-settings'
import { addImagesEvents, selectFirstImage, clearImages, loadImages} from './images-ui'
import { saveImage } from './filters'
import path from 'path'
import os from 'os'

function setIpc () {

  //  preguntamos si hay un directorio x defecto donde leer las imágenes
  if (settings.has('directory')) {
    ipcRenderer.send('load-directory', settings.get('directory'))
  }


  // lo que se ejecuta cuando enviamos el evento 'load-images'
  ipcRenderer.on('load-images', (event, dir, images) => {
    clearImages()
    loadImages(images)
    addImagesEvents()
    selectFirstImage()
    settings.set('directory', dir)
    document.getElementById('directory').innerHTML = dir
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

/** Para abrir esta ventana utilizamos el api de remote que utiliza parte del electron
    que están diseñados para correr en el proceso principal sin tener que recurrir a la comunicación
    entre procesos del ipc
    Esta forma de comunicación es diferente a la forma como llamamos a save-image, load-images, open-directory, show-dialog
 */
function openPreferences () {
  const BrowserWindow = remote.BrowserWindow
  //  accedemos a la instancia de la ventana principal
  const mainWindow = remote.getGlobal('win')

  const preferencesWindow = new BrowserWindow({
    width: 400,
    height: 400,
    title: 'Preferencias',
    modal: true,
    frame: false,
    show: false
  })

  //controlamos las diferentes plataformas sobre las cuales ejecuto la app

  if (os.platform() !== 'win32') {
    // estableces como ventana principal a la ventana del proceso principal
    // esto debido a que esta propiedad no está disponible para windows
    preferencesWindow.setParentWindow(mainWindow)
  }
  //una vez que haya cargado todos los recursos del html mostramos la ventana
  preferencesWindow.once('ready-to-show', () => {
      preferencesWindow.show()
      preferencesWindow.focus()
  })

  preferencesWindow.loadURL(`file://${path.join(__dirname,'..')}/preferences.html`)
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
  saveFile: saveFile,
  openPreferences
}
