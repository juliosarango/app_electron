import { app, dialog } from 'electron'

function relaunchApp (win) {
  dialog.showMessageBox(win, {
    type: 'error',
    title: 'Platzipics',
    message: 'Ocurrio un error inesperado, se reiniciara el aplicativo'
  }, () => {
    // cuando se haga clic en el boton aceptar, se lanza nuevamente el aplicativo y se cierra el anterios
    app.relaunch()
    app.exit(0)
  })
}

// funcion para controlar errores
function setupErrors (win) {
  // cuando no responda la app, relanzamos la app llamando a la funcion relaunchApp
  win.webContents.on('crashed', () => {
    relaunchApp(win)
  })

  // cuando se esta tardando demasiado en responder
  win.on('unresponsive', () => {
    dialog.showMessageBox(win, {
      type: 'warning',
      title: 'Platzipics',
      message: 'Un proceso esta tardando demasiado, puede esperar o reniciar el aplicativo'
    }
  )
})

  // error desconocido
  process.on('uncaughtException', () => {
    // en este caso como ejemplo enviamos a reniciar el app, pero podemos capturar el error
    // con un parametro en la function flecha y analizar ese error (err) => { console.log(err) }
    relaunchApp(win)
  })
}

module.exports = setupErrors
