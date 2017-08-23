import fs from 'fs-extra'

// aplicar filtros a las imagenes
function applyFilter (filter, currentImage) {
  let imgObj = new Image() // eslint-disable-line
  imgObj.src = currentImage.dataset.original

  filterous.importImage(imgObj, {}) // eslint-disable-line
    .applyInstaFilter(filter)
    .renderHtml(currentImage)
}

function saveImage (fileName, callback) {
  let fileSrc = document.getElementById('image-displayed').src

  // controlamos que la imagen haya sido modificada
  // en caso de que no haya sido modificada, simplemente copiamos la imagen con el modulo fs.extra de npm
  if (fileSrc.indexOf(';base64,') !== -1) {

    fileSrc = fileSrc.replace(/^data:([A-Za-z-+/]+);base64,/, '')
    fs.writeFile(fileName, fileSrc, 'base64', callback)
  } else {
    //  devolver la ruta del archivo
    fileSrc = fileSrc.replace('file://', '')
    fs.copy(fileSrc, fileName, callback)
  }
}

module.exports = {
  applyFilter: applyFilter,
  saveImage: saveImage
}
