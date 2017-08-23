import { remote, ipcRenderer } from 'electron'
import settings from 'electron-settings'
import crypto from 'crypto'

window.addEventListener('load', () => {
  cancelButton()
  saveButton()

  //verifocamos si existen datos de las Preferencias
  if (settings.has('cloudup.user')) {
    document.getElementById('cloudup-user').value = settings.get('cloudup.user')
  }

  if (settings.has('cloudup.passwd')) {
    //  desencriptamos para pasar al formulario
    const decipher = crypto.createDecipher('aes192','Platzipics')
    let decrypted = decipher.update(settings.get('cloudup.passwd'),'hex','utf8')
    decrypted += decipher.final('utf8')    
    document.getElementById('cloudup-passwd').value = decrypted
  }

})

function cancelButton () {
  const cancelButton =document.getElementById('cancel-button')

  //  añadimos un listener al evento click
  cancelButton.addEventListener('click', () => {
    //  obtenemos la ventana actual
    const prefsWindow = remote.getCurrentWindow()
    //  cerramos la ventana
    prefsWindow.close()
  })
}

function saveButton () {
  const saveButton =document.getElementById('save-button')

  const prefsForm = document.getElementById('preferences-form')

  //  añadimos un listener al evento click
  saveButton.addEventListener('click', () => {

    // consultamos si el formulario es válido
    if (prefsForm.reportValidity()) {

      //encriptamos la clave
      const cipher = crypto.createCipher('aes192','Platzipics')
      let encrypted = cipher.update(document.getElementById('cloudup-passwd').value)
      encrypted += cipher.final('hex')

      //  guardamos la inforacion del formulario en las Preferencias
      settings.set('cloudup.user', document.getElementById('cloudup-user').value)
      settings.set('cloudup.passwd', encrypted)

      //  obtenemos la ventana actual
      const prefsWindow = remote.getCurrentWindow()
      //  cerramos la ventana
      prefsWindow.close()
    } else {
      ipcRenderer.send('show-dialog', {type: 'error', title: 'Platzipics', message: 'Por favor complete los campos requeridos'})
    }
  })
}
