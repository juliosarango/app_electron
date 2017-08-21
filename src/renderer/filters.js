import fs from 'fs'

// aplicar filtros a las imagenes
function applyFilter (filter, currentImage) {
  let imgObj = new Image() // eslint-disable-line
  imgObj.src = currentImage.src

  filterous.importImage(imgObj, {}) // eslint-disable-line
    .applyInstaFilter(filter)
    .renderHtml(currentImage)
}

function saveImage (fileName, callback) {
  let fileSrc = document.getElementById('image-displayed').src
  fileSrc = fileSrc.replace(/^data:([A-Za-z-+/]);base64,/, '')

  fs.writeFile(fileName, 'imagen', 'base64', callback)
}

module.exports = {
  applyFilter: applyFilter,
  saveImage: saveImage
}
