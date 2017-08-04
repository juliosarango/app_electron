import url from 'url'
import path from 'path'

window.addEventListener('load', () => {
  addImagesEvents()
  searchImagesEvent()
})

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
    document.querySelector('li.selected').classList.remove('selected')
    node.classList.add('selected')
    document.getElementById('image-displayed').src = node.querySelector('img').src
  } else {
    document.getElementById('image-displayed').src = ''
  }

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

function selectFirstImage () {
  const image = document.querySelector('li.list-group-item:not(.hidden)')
  changeImage(image)
}
