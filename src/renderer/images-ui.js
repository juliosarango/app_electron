import url from 'url'
import path from 'path'
import { applyFilter } from './filters'

// Agrega todos los eventos a las imagenes
function addImagesEvents () {
  const thumbs = document.querySelectorAll('li.list-group-item')
  for (let i = 0; i < thumbs.length; i++) {
    thumbs[i].addEventListener('click', function () {
      changeImage(this)
    })
  }
}

function changeImage (node) {
  if (node) {
    const selected = document.querySelector('li.selected')
    if (selected) {
      selected.classList.remove('selected')
    }

    node.classList.add('selected')
    const image = document.getElementById('image-displayed')
    image.src = node.querySelector('img').src
    image.dataset.original = image.src
    // cuando cambiamos de imagen, restablecemos los filtros
    document.getElementById('filters').selectedIndex = 0
  } else {
    document.getElementById('image-displayed').src = ''
  }
}

function selectFirstImage () {
  const image = document.querySelector('li.list-group-item:not(.hidden)')
  changeImage(image)
}

// evento para el cambio de los filtros
function selectEvent () {
  const select = document.getElementById('filters')

  select.addEventListener('change', function () {
    applyFilter(this.value, document.getElementById('image-displayed'))
  })
}

function searchImagesEvent () {
  const searchBox = document.getElementById('search-box')

  searchBox.addEventListener('keyup', function () {
    const regex = new RegExp(this.value.toLowerCase(), 'gi')
    //  aplicamos el filtro
    if (this.value.length > 0) {
      const thumbs = document.querySelectorAll('li.list-group-item img')
      for (let i = 0; i < thumbs.length; i++) {
        //  thumbs[i].src devuelve una url, x eso utilizamos url y path para trabajar con ellos
        const fileUrl = url.parse(thumbs[i].src)
        const fileName = path.basename(fileUrl.pathname)
        //  si el nombre no coincide con el existente en la lista, ocultamos la imagen, caso contrario la mostramos
        if (fileName.match(regex)) {
          thumbs[i].parentNode.classList.remove('hidden')
        } else {
          thumbs[i].parentNode.classList.add('hidden')
        }
      }
      selectFirstImage()
    }
    //  en el caso de que el filtro esté vacio
    else {
      const ocultos = document.querySelectorAll('li.hidden')
      for (let i = 0; i < ocultos.length; i++) {
        ocultos[i].classList.remove('hidden')
      }
    }
  })
}

function clearImages() {
  const oldImages = document.querySelectorAll('li.list-group-item')
  for (let i = 0; i < oldImages.length; i++) {
    oldImages[i].parentNode.removeChild(oldImages[i])
  }
}

function loadImages(images) {
  const imagesList = document.querySelector('ul.list-group')

  for (let i = 0; i < images.length; i++) {
    const node = `<li class="list-group-item">
      <img class="media-object pull-left" src="${images[i].src}" width="32" height="32">
      <div class="media-body">
        <strong>${images[i].filename}</strong>
        <p>${images[i].size}</p>
      </div>
    </li>`
    imagesList.insertAdjacentHTML('beforeend', node)
  }
}

module.exports = {
  addImagesEvents: addImagesEvents,
  changeImage: changeImage,
  selectFirstImage: selectFirstImage,
  selectEvent: selectEvent,
  searchImagesEvent: searchImagesEvent,
  clearImages: clearImages,
  loadImages: loadImages
}
