import { setIpc, openDirectory, saveFile, openPreferences,uploadImage, pasteImage } from './main-window/ipcRendererEvents'
import { addImagesEvents, searchImagesEvent, selectEvent, print} from './main-window/images-ui'

window.addEventListener('load', () => {
  setIpc()
  addImagesEvents()
  searchImagesEvent()
  selectEvent()
  buttonEvent('open-directory', openDirectory)
  buttonEvent('save-button', saveFile)
  buttonEvent('open-preferences', openPreferences)
  buttonEvent('print-button', print)
  buttonEvent('upload-button', uploadImage)
  buttonEvent('paste-button', pasteImage)
})

function buttonEvent (id, func) {
  const openDirectory = document.getElementById(id)
  openDirectory.addEventListener('click', func)
}
