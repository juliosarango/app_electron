'use strict'

/*
el objeto app es un objeto que nos permite controlar el ciclo
de vida de un aplicativo y diferentes eventos.
Desde este objeto podemos iniciar, cerrar el aplicativo.
*/

// iniciamos los objetos app y BrowserWindow
import { app, BrowserWindow,ipcMain, dialog } from 'electron'
import devtools from './devtools'
import isImage from 'is-image'
import filesize from 'filesize'
import fs from 'fs'
import path from 'path'

/*
solo en el caso en que estemos en el ambiente de desarrollo
ejecutamos la function devtools
*/

if (process.env.NODE_ENV === 'development') {
  devtools()
}

let win
//  ver las propiedades de app
//  console.dir(app);

/*
El objeto blowserWindows es el componente que nos va a permitir
cargar todo contenido visualmente del aplicativo de escritorio
*/

//  ejecutando órdenes cuando la aplicación está lista.
app.on('ready', () => {
  //  instanciando una ventana
  win = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'Hola mundo!',
    center: true,
    maximizable: false,
    show: false
  })

  win.on('move', () => {
    const position = win.getPosition()
    //  console.log(`La posición actual es: ${position}`)
  })

  /**
  Podemos cargar 2 tipos de contenido: local y remopo
  Local: La carga es inmediata
  Remoto: La carga dependerá de factores como: red, velocidad de internet.
  */
  win.once('ready-to-show', () => {
    win.show()
  })

  //  win.loadURL('http://devdocs.io/');
  win.loadURL(`file://${__dirname}/renderer/index.html`)

  //  detectamos el cierre de la ventana
  win.on('closed', () => {
    win = null
    app.quit()
  })
})

// se recibe el argumento Date desde el proceso de renderizado
// Recibe el evento ping, proceso y vuelve a enviar el evento pong
/*
ipcMain.on('ping', (event,arg) => {
  console.log(`se recibio ping - ${arg}`)
  event.sender.send('pong', new Date())
})
*/

// cuadro de dialogo del boton abrir
ipcMain.on('open-directory', (event) => {
  dialog.showOpenDialog(win, {
    title: 'Seleccione la nueva ubicación',
    buttonLabel: 'Abrir ubicación',
    properties: ['openDirectory']
  },
(dir) => {
  if (dir) {
    const images = []
    console.log(dir)
    // leemos el directorio seleccionado
    fs.readdir(dir[0], (err, files) => {
      if (err) throw err

      for (let i = 0; i < files.length; i++) {
        // recorremos todos los archivos de un directorio y preguntamos si es una imagen
        if (isImage(files[i])) {
          // devuelve la ruta completa de la imagen que se esta procesando
          let imageFile = path.join(dir[0], files[i])
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
      event.sender.send('load-images', images)

    })
  }
})
})

// cuadro de dialogo del boton guardar
ipcMain.on('open-save-dialog', (event, ext) => {
  dialog.showSaveDialog(win, {
    title: 'Guardad imagen modificada',
    buttonLabel: 'Guardar imagen',
    filters: [{name:'Images', extensions: [ext.substring(1)]}]
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



//  imprimiendo un mensaje en consola antes de salir
app.on('before-quit', () => console.log('saliendo...'))
