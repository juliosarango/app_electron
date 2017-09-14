/*
El proceso principal es el proceso de Node.js (main process) que interactua con
los recursos nativos de la maquina, y el otro proceso de Electron es el procesos
de renderizado (rendered process), los dos procesos corren en dos hilos diferentes.
*/

import { ipcRenderer, remote, clipboard } from 'electron'
import settings from 'electron-settings'
import { addImagesEvents, selectFirstImage, clearImages, loadImages} from './images-ui'
import { saveImage } from './filters'
import Cloudup from 'cloudup-client'
import path from 'path'
import os from 'os'
import crypto from 'crypto'


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

      document.getElementById('image-displayed').dataset.filtered = file
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

function uploadImage () {
  //obtenemos la imagen

  let imageNode = document.getElementById('image-displayed')
  let image

  // si la imagen tiene filtros, sacamos la informacion del dataset que se
  // agrego al momento de guardar la imagen, caso contrario elegimos el src original
  if (imageNode.dataset.filtered) {
    image = imageNode.dataset.filtered
  } else {
    image = imageNode.src
  }

  // reemplazamos el protocolo file x vacio
  image = image.replace('file://', '')
  //extraemos el nombre
  let fileName = path.basename(image)

  if (settings.has('cloudup.user') && settings.has('cloudup.passwd')) {

    document.getElementById('overlay').classList.toggle('hidden')
    const decipher = crypto.createDecipher('aes192','Platzipics')
    let decrypted = decipher.update(settings.get('cloudup.passwd'),'hex','utf8')
    decrypted += decipher.final('utf8')
    console.log(decrypted)
    const client = Cloudup({
      user: settings.get('cloudup.user'),
      pass: decrypted
    });

    const stream = client.stream({
      title: `Platzipics-${fileName}`
    })

    stream.file(image)
          .save((err) => {
            document.getElementById('overlay').classList.toggle('hidden')
            if (err) {              
              showDialog('error', 'Platzipics', `Verifique su conexion y/o sus credenciales de cloudup`)
            } else {
              clipboard.writeText(stream.url)
              showDialog('info', 'Platzipics', `Imagen guardada correctamente - ${stream.url}, el enlace se copio al portapapeles`)
            }
          })
  } else {
    showDialog('error', 'Platzipics', 'Por favor complete las preferencias de cloudup')
  }
}
//  usar el clipboard, el clipboard puede trabajar con diferente tipo de informacion.

function pasteImage () {
  const image = clipboard.readImage()

  //  devuelve el data de la imagen en base64
  const data = image.toDataURL()

  //  preguntamos si la imagen es valida, data esta en base64
  if (data.indexOf('data:image/png;base64') !== -1 && !image.isEmpty()) {
    let mainImage = document.getElementById('image-displayed')
    mainImage.src = data
    mainImage.dataset.original = data
  } else {
    showDialog('error', 'Platzipics', 'No hay una imagen valida en el portapapeles')
  }

}

module.exports = {
  setIpc: setIpc,
  openDirectory: openDirectory,
  saveFile: saveFile,
  openPreferences,
  uploadImage: uploadImage,
  pasteImage: pasteImage
}
