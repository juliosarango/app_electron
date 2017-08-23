'use strict'

/*
el objeto app es un objeto que nos permite controlar el ciclo
de vida de un aplicativo y diferentes eventos.
Desde este objeto podemos iniciar, cerrar el aplicativo.
*/

// iniciamos los objetos app y BrowserWindow
import { app, BrowserWindow, Tray } from 'electron'
import devtools from './devtools'
import setupErrors from './handle-errors'
import setMainIpc from './ipcMainEvents'
import os from 'os'
import path from 'path'

/*
solo en el caso en que estemos en el ambiente de desarrollo
ejecutamos la function devtools
*/

if (process.env.NODE_ENV === 'development') {
  devtools()
}

global.win // eslint-disable-line
global.tray // eslint-disable-line

//  ver las propiedades de app
//  console.dir(app);

/*
El objeto blowserWindows es el componente que nos va a permitir
cargar todo contenido visualmente del aplicativo de escritorio
*/

//  ejecutando órdenes cuando la aplicación está lista.
app.on('ready', () => {
  //  instanciando una ventana
  global.win = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'Hola mundo!',
    center: true,
    maximizable: false,
    show: false
  })

  // despues de crear la ventana principal de la app, controlamos los errores
  setupErrors(global.win)

  // llamamos a los eventos desde setMainIpc
  setMainIpc(global.win)

  /*
  win.on('move', () => {
    const position = win.getPosition()
    //  console.log(`La posición actual es: ${position}`)
  })
  /*

  /**
  Podemos cargar 2 tipos de contenido: local y remopo
  Local: La carga es inmediata
  Remoto: La carga dependerá de factores como: red, velocidad de internet.
  */
  global.win.once('ready-to-show', () => {
    global.win.show()
  })

  //cargamos el ícono, en linux hay q revisar ya que genera inconvenientes
  // let icon
  // if (os.platform() === 'win32') {
  //   icon = path.join(__dirname, 'assets','icons','try-icon.ico')
  // } else {
  //   icon = path.join(__dirname, 'assets','icons','try-icon.png')
  // }
  //
  // global.tray = new Tray(icon)
  // global.tray.setToolTip('Platzipics')
  // global.tray.on('click', () => {
  //   // mostramos u ocultamos la ventana al hacer click
  //   global.win.isVisible() ? global.win.hide() : global.win.show()
  // })

  //  win.loadURL('http://devdocs.io/');
  global.win.loadURL(`file://${__dirname}/renderer/index.html`)

  //  detectamos el cierre de la ventana
  global.win.on('closed', () => {
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

//  imprimiendo un mensaje en consola antes de salir
app.on('before-quit', () => console.log('saliendo...'))
