'use strict'

/*
el objeto app es un objeto que nos permite controlar el ciclo
de vida de un aplicativo y diferentes eventos.
Desde este objeto podemos iniciar, cerrar el aplicativo.
*/

// iniciamos los objetos app y BrowserWindow
import { app, BrowserWindow } from 'electron'
import devtools from './devtools'

/*
solo en el caso en que estemos en el ambiente de desarrollo
ejecutamos la function devtools
*/

if (process.env.NODE_ENV === 'development') {
  devtools()
}
//  ver las propiedades de app
//  console.dir(app);

/*
El objeto blowserWindows es el componente que nos va a permitir
cargar todo contenido visualmente del aplicativo de escritorio
*/

//  ejecutando órdenes cuando la aplicación está lista.
app.on('ready', () => {
  //  instanciando una ventana
  let win = new BrowserWindow({
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

//  imprimiendo un mensaje en consola antes de salir
app.on('before-quit', () => console.log('saliendo...'))
