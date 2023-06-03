function landingPage() {

  slidesPlugin(0)

  const slides = document.querySelectorAll('.slide')

  if (!slides || slides.length < 1) { return }

  let ind = 0
  for (const slide of slides) {
    slide.relationalIndex = ind
    slide.addEventListener('click', () => {
      clearActiveClasses(slides)
      slidesPlugin(slide.relationalIndex)
    })
    ind += 1
  }
  
  let newsCards = document.querySelectorAll('.news-card')

  for (const newsCard of newsCards) { 

    newsCard.addEventListener("click", (e) => { 

      if (newsCard.className.includes('first')) { 
  
        window.open("https://sjparts.org/events")
  
      }
  
      else if (newsCard.className.includes('second')) { 
  
        window.open("https://sjparts.org/media")
  
      }
  
      else if (newsCard.className.includes('third')) { 
  
        window.open("https://sjparts.org/soon.html")
  
      }
  
    })
  
  }

  
  
  let folder = 0
  newsCards.forEach((card) => { 

    folder += 1
    let imageElement = card.children[0]

    let last = localStorage.getItem(`random-0${folder}`)
    if (!last) { last = 0 }
    let chosen = parseInt(last) + 1
    if (chosen > 5) { chosen = 1 }
    localStorage.setItem(`random-0${folder}`, chosen)
    imageElement.style.background = `url('/images/promo/home-0${folder}/promo-0${chosen}.JPG')`
    imageElement.style.backgroundSize = 'cover'
    imageElement.style.backgroundPosition = 'center'
    imageElement.style.backgroundRepeat = 'no-repeat'

  })

          
  $.ajax({
    url: `https://api.sjparts.org/featured`,
    context: document.body
  }).done(function (data) {

    const slides = document.querySelectorAll('.container .slide')

    if (data.featured?.id) { 
      
      $.ajax({
        url: `https://api.sjparts.org/media?id=${data.featured.id}`,
        context: document.body
      }).done(function (data) {
    
        let index = 0
        for (const photo of data.media) {

          slides[index].style.backgroundImage = `url("${photo.media.compressed}")`
          index += 1

        }

      })

    }
    
  })

  
  
}

setInterval(() => {

  const slides = document.querySelectorAll('.slide')

  if (!slides || slides.length < 1) { return }

  let nextSlide = parseInt(localStorage.getItem('slide')) + 1

  if (!slides[nextSlide]) { nextSlide = 0 }

  clearActiveClasses(slides)
  slidesPlugin(nextSlide)

 }, 4500)


function slidesPlugin(activeSlide) {
  localStorage.setItem('slide', activeSlide)
  const slides = document.querySelectorAll('.slide')

  slides[activeSlide].classList.add('active')

}

function clearActiveClasses(slides) {
  slides.forEach((slide) => {
     slide.classList.remove('active')
  })
}



