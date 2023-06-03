function wordChoice(num, word) { 

  if (num == 1) return word
  else return `${word}s`

  }

async function handleCards() {

  $.ajax({
    url: "https://api.sjparts.org/albums",
    context: document.body
  }).done(function (data) {
    
    let parent = document.getElementsByClassName('albums')[0]
    let stats = document.querySelector('.stat')

    stats.innerHTML = `${data.albums.length} ${wordChoice(data.albums.length, 'album')} • Last updated ${data.lastUpdated}`

    sessionStorage.setItem('cachedAlbums', JSON.stringify(data.albums))
    
    for (const album of data.albums) { 

      let element = document.createElement('div')
      element.className = 'album'
      element.innerHTML = `<div class="album-artwork"> </div>
      <div class="album-details">
        <h2>${album.title}</h2>
        <p class="album-artist">${album.size} ${wordChoice(album.size, 'item')}</p>
      </div>`
      element.setAttribute("albumID", album.id)

      parent.appendChild(element)

      element.childNodes[0].style.background = `url("${album.cover}")`
      element.childNodes[0].style.backgroundSize = `175%`
      element.childNodes[0].style.backgroundPosition = `center`

      const randomNum = Math.floor(Math.random() * 181);
      const colors = ["#fc7e2a", "#3cabe8", '#423ce8', "#b13ce8", '#e83ce5', '#e83c6a']
      
      const randomColor0 = colors[Math.floor(Math.random() * colors.length)];
      let randomColor1 = colors[Math.floor(Math.random() * colors.length)];

      while (randomColor0 === randomColor1) { randomColor1 = colors[Math.floor(Math.random() * colors.length)]; }

      element.style.backgroundImage = `linear-gradient(${randomNum}deg, ${randomColor0} 2%, ${randomColor1}`
      
      element.addEventListener("click", (e) => { 

        window.location = `album?albumID=${element.getAttribute("albumID")}`

      })

    }
  
  })

}

let currentPhoto = null

async function handleAlbum(id) {

  let albums = sessionStorage.getItem('cachedAlbums')
  if (albums) { albums = JSON.parse(albums) }

  else {

    $.ajax({
      url: "https://api.sjparts.org/albums",
      context: document.body
    }).done(function (data) {

      sessionStorage.setItem('cachedAlbums', JSON.stringify(data.albums))
      albums = data.albums

      albumWork(albums, id)

    })

  }

  albumWork(albums, id)

}
    
  function albumWork(albums, id) { 

    let chosen = albums?.find((apiAlbum) => apiAlbum.id == id)
    if (!chosen) { return }

    let details0 = document.querySelector(".albumTitle") 
    let details1 = document.querySelector(".albumDescription") 
    let title = document.querySelector(".background") 
    
    title.style.background = `url("${chosen?.cover}")`
    title.style.backgroundSize = `cover`
    title.style.backgroundPosition = `center`

    details0.innerHTML = chosen.title
    details1.innerHTML = `${chosen.size} ${wordChoice(chosen.size, 'item')}`

    let modal = document.getElementById("imageModal")
    let modelImg = document.getElementById("modalImage")
    let metaModal = document.getElementById("metadata")
    let metaContent = document.getElementById("metadata-content")
          
    $.ajax({
      url: `https://api.sjparts.org/media?id=${chosen.id}`,
      context: document.body
    }).done(function (data) {

      let last = chosen.coverID

      setInterval(() => { 

        let random = data.media[Math.floor(Math.random() * data.media.length)]
        while (random.id === last && data.media.length > 1) { random = data.media[Math.floor(Math.random() * data.media.length)] }

        last = random.id

        $( '.albumIntro .background').fadeOut('slow', function(){
          $('.albumIntro .background').css({
            backgroundImage: `url('${random.media.compressed}')`
          }).fadeIn('slow');
       } )
    
        title.style.transition = 'background-image 0.5s ease-in-out'
        title.style.backgroundSize = `cover`
        title.style.backgroundPosition = `center`


      }, 4000)

      let parent = document.querySelector('.container .masonry')
      let loading = document.querySelector('.ImagesLoading')
      
      let loaded = 0
      let elements = []

      function displayDone() { 

        if (data.author) {
          details1.innerHTML = `${chosen.size} ${wordChoice(chosen.size, 'item')} • Photos and videos taken by ${data.author}`
        } 

        loading.style.display = 'none'
        parent.append(...elements)

        elements.forEach((element) => {
          
          element.addEventListener("mouseover", (e) => {

            element.style.transform = 'scale(1.10)'
            elements.filter((el) => el !== element).forEach((el) => el.style.opacity = '50%')
            
  
          })
  
          element.addEventListener("mouseleave", (e) => {
  
            element.style.transform = 'scale(1)'
            elements.filter((el) => el !== element).forEach((el) => el.style.opacity = '100%')
  
          })
  
          
        })

      }    

      for (const photo of data.media) { 

        let element = document.createElement('div')
        element.className = 'brick'
        element.innerHTML = `<img src="${photo.media.compressed}">`

        elements.push(element)

        element.childNodes[0].addEventListener('load', () => {
          loaded += 1
        
          if (loaded >= 15) { 

            displayDone()
            
          }   
        })
        element.childNodes[0].addEventListener('error', () => {
          loaded += 1
        
          if (loaded >= 15) { 

            displayDone()
            
          }   
        })

        element.addEventListener("click", (e) => {

          currentPhoto = photo

          if (photo.type.includes('video')) {

            modelImg.style = new Object()

            modal.innerHTML = `<video class="modal-content" id="modalImage" controls autoplay name="media"><source src="${photo.media.lossless}" type="${photo.type}"></video>  
            <div class="caption" id="caption"><i id="imgControl" buttonID="last"class='bx bx-chevron-left'></i><i buttonID = "meta" class='bx bx-info-circle'></i><i buttonID="download"class='bx bx-link-external'></i><i buttonID = 'close' class='bx bx-exit-fullscreen'></i><i id="imgControl" buttonID="next"class='bx bx-chevron-right'></i></div>`
            modelImg = document.getElementById("modalImage")

          }

          else {

            modelImg.style = new Object()
            modelImg.src = photo.media.compressed
            
            modelImg.src = photo.media.lossless
                      
          }
            
          modal.style.display = "block"

          document.body.style.overflow = "hidden"

          metaContent.innerHTML = `<h2>Media Info</h2>
          <hr>
          <span id="detail">Taken On</span> <span id="value">${photo.metadata.taken}</span>
          <br>
          <span id="detail">Resolution</span> <span id="value">${photo.metadata.dimensions.width}px • ${photo.metadata.dimensions.height}px</span>
          <br>
          <span id="detail">Shutter Speed</span> <span id="value">${apertureSpeedToHuman(parseFloat(photo.metadata.exposure))}</span>
          <br>
          <span id="detail">Camera</span> <span id="value">${photo.metadata.camera.model?.replace("_", "-") || "Unknown"}</span>
          <br>
          <span id="detail">Focal Length</span> <span id="value">${photo.metadata.focalLength || 24 }mm</span>
          <br>
          <span id="detail">Aperture</span> <span id="value">ƒ${photo.metadata.aperture || 4}</span>
          <br>
          <span id="detail">ISO</span> <span id="value">${photo.metadata.iso || 420}</span>
          <br>
          <div class="metaControls">
          <button id="closeMetadata">Close</button>
          </div>`

          zoom()
          
        })
  
      }

      metaModal.onclick = function (e) { 

        if (e.target.className.includes('metaModal') || e.target.id.includes('closeMetadata')) {

          metaModal.style.display = 'none'
          
        }


      }

      modal.onclick = function (e) {

        if (!["modal-content", "caption"].includes(e.target.className) && !e.target.className.includes('bx')) {

          modal.innerHTML = `<img class="modal-content" id="modalImage" draggable="false">
          <div class="caption" id="caption"><i id="imgControl" buttonID="last"class='bx bx-chevron-left'></i><i buttonID = "meta" class='bx bx-info-circle'></i><i buttonID="download"class='bx bx-link-external'></i><i buttonID = 'close' class='bx bx-exit-fullscreen'></i><i id="imgControl" buttonID="next"class='bx bx-chevron-right'></i></div>`
          modelImg = document.getElementById("modalImage")
          
          modelImg.src = "https://cdn.discordapp.com/attachments/1001943537300025354/1068305472748277870/8D0AA6F7-80B2-499C-AECA-402C8F59E14C.png"
          modal.style.display = "none";
          document.body.style.overflowY = "scroll"
  
        }

        if (e.target.className.includes('bx')) { 

          if (e.target.getAttribute('buttonID') == 'download') { 

            window.open(modelImg.src)
            
          }

          if (e.target.getAttribute('buttonID') == 'meta') { 

            metaModal.style.display = "flex"

          }

          if (e.target.getAttribute('buttonID') == 'close') { 

            modal.innerHTML = `<img class="modal-content" id="modalImage" draggable="false">
            <div class="caption" id="caption"><i id="imgControl" buttonID="last"class='bx bx-chevron-left'></i><i buttonID = "meta" class='bx bx-info-circle'></i><i buttonID="download"class='bx bx-link-external'></i><i buttonID = 'close' class='bx bx-exit-fullscreen'></i><i id="imgControl" buttonID="next"class='bx bx-chevron-right'></i></div>`
            modelImg = document.getElementById("modalImage")
            caption = document.getElementById("caption")
            modelImg.src = "https://cdn.discordapp.com/attachments/1001943537300025354/1068305472748277870/8D0AA6F7-80B2-499C-AECA-402C8F59E14C.png"
            modal.style.display = "none";
            document.body.style.overflowY = "scroll"
        
          }

          if (e.target.getAttribute('buttonID') == 'last') { 
            
            let index = data.media.indexOf(currentPhoto)
            if (index <= 0) { 
              let note = document.nc.spawnNote('scroll_err')
              setTimeout(() => { document.nc.killNote(note.id) }, 3500)
              return  
            }

            currentPhoto = data.media[index - 1]

            if (currentPhoto.type.includes('video')) {

              modelImg.style = new Object()
  
              modal.innerHTML = `<video class="modal-content" id="modalImage" controls autoplay name="media"><source src="${currentPhoto.media.lossless}" type="${currentPhoto.type}"></video>  
              <div class="caption" id="caption"><i id="imgControl" buttonID="last"class='bx bx-chevron-left'></i><i buttonID = "meta" class='bx bx-info-circle'></i><i buttonID="download"class='bx bx-link-external'></i><i buttonID = 'close' class='bx bx-exit-fullscreen'></i><i id="imgControl" buttonID="next"class='bx bx-chevron-right'></i></div>`
              modelImg = document.getElementById("modalImage")
  
            }
  
            else {
  
              modal.innerHTML = `<img class="modal-content" id="modalImage" draggable="false">
              <div class="caption" id="caption"><i id="imgControl" buttonID="last"class='bx bx-chevron-left'></i><i buttonID = "meta" class='bx bx-info-circle'></i><i buttonID="download"class='bx bx-link-external'></i><i buttonID = 'close' class='bx bx-exit-fullscreen'></i><i id="imgControl" buttonID="next"class='bx bx-chevron-right'></i></div>`  
              modelImg = document.getElementById("modalImage")
              caption = document.getElementById("caption")  
              modelImg.style = new Object()
              modelImg.src = "https://cdn.discordapp.com/attachments/1001943537300025354/1068305472748277870/8D0AA6F7-80B2-499C-AECA-402C8F59E14C.png"
              modelImg.src = currentPhoto.media.lossless
            
            }
  

          }
          if (e.target.getAttribute('buttonID') == 'next') { 

            let index = data.media.indexOf(currentPhoto)
            if (index == data.media.length - 1) { 
              let note = document.nc.spawnNote('scroll_err')
              setTimeout(() => { document.nc.killNote(note.id) }, 3500)
              return
            }
            
            currentPhoto = data.media[index + 1]

            if (currentPhoto.type.includes('video')) {

              modelImg.style = new Object()
  
              modal.innerHTML = `<video class="modal-content" id="modalImage" controls autoplay name="media"><source src="${currentPhoto.media.lossless}" type="${currentPhoto.type}"></video>  
              <div class="caption" id="caption"><i id="imgControl" buttonID="last"class='bx bx-chevron-left'></i><i buttonID = "meta" class='bx bx-info-circle'></i><i buttonID="download"class='bx bx-link-external'></i><i buttonID = 'close' class='bx bx-exit-fullscreen'></i><i id="imgControl" buttonID="next"class='bx bx-chevron-right'></i></div>`
              modelImg = document.getElementById("modalImage")
  
            }
  
            else {
  
              modal.innerHTML = `<img class="modal-content" id="modalImage" draggable="false">
              <div class="caption" id="caption"><i id="imgControl" buttonID="last"class='bx bx-chevron-left'></i><i buttonID = "meta" class='bx bx-info-circle'></i><i buttonID="download"class='bx bx-link-external'></i><i buttonID = 'close' class='bx bx-exit-fullscreen'></i><i id="imgControl" buttonID="next"class='bx bx-chevron-right'></i></div>`  
              modelImg = document.getElementById("modalImage")
              caption = document.getElementById("caption")  
              modelImg.style = new Object()
              modelImg.src = "https://cdn.discordapp.com/attachments/1001943537300025354/1068305472748277870/8D0AA6F7-80B2-499C-AECA-402C8F59E14C.png"
              modelImg.src = currentPhoto.media.lossless
            
            }
  

          }


        }


      }

      modal.ondblclick = function (e) { 

        $(".modal-content").css("transform", 'perspective(100px) translate3d(' + 0 + 'px, ' + 0 + 'px, ' + 0 + 'px)');

      }
      
    })

  }

const subSecondStops = [10, 13, 15, 20, 25, 30, 40, 50, 60, 80, 100, 125, 160, 200, 250, 320, 400, 500, 640, 800, 1000, 1200, 1400, 1600, 1900, 2000, 4000, 8000, 12000 ];

const findClosest = (arr, search) => {
  return arr.reduce((prev, curr) => (Math.abs(curr - search) < Math.abs(prev - search) ? curr : prev));
};

const apertureSpeedToHuman = apertureSpeed => {
  if (apertureSpeed >= 1) {
    return `${apertureSpeed}`;
  }
  if ((1 / apertureSpeed) % 1 === 0) {
    return `1/${1 / apertureSpeed}`;
  }
  const rounded = Math.round(1 / apertureSpeed);
  if (subSecondStops.includes(rounded)) {
    return `1/${rounded}`;
  }
  const closest = findClosest(subSecondStops, 1 / apertureSpeed);
  if (closest) {
    return `1/${closest}`;
  }

  throw "Error: No match - this should not happen";
};

function GetURLParameter(sParam)
{
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) 
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) 
        {
            return sParameterName[1];
        }
    }
}

function zoom() { 

  var translateX = 0,
    translateY = 0,
    translateZ = 0,
    stepZ = 10,
    initial_obj_X = 0,
    initial_obj_Y = 0,
    initial_mouse_X = 0,
    initial_mouse_Y = 0;

  function apply_coords() {
    $(".modal-content").css("transform", 'perspective(100px) translate3d(' + translateX + 'px, ' + translateY + 'px, ' + translateZ + 'px)');
  }

  $(".modal-content").on("mousewheel DOMMouseScroll", function(e) {

    e.preventDefault();
    var delta = e.delta || e.originalEvent.wheelDelta;
    var zoomOut;
    if (delta === undefined) {
      delta = e.originalEvent.detail;
      zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
      zoomOut = !zoomOut;
    } else {
      zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
    }

    if (zoomOut) {
      if (translateZ - stepZ < 0) { translateZ = 0 }
      else { translateZ = translateZ - stepZ; }
    } else {
      if (translateZ - stepZ >= 50) { return }
      else { translateZ = translateZ + stepZ; }
    }
    apply_coords();

  });


  let is_dragging = false;
  $(".modal-content")
    .mousedown(function(e) {
      is_dragging = true;
    })
    .mousemove(function(e) {
      if (is_dragging) {
        e.preventDefault();
        var currentX = e.type === 'touchend' ? e.changedTouches[0].pageX : e.pageX;
        var currentY = e.type === 'touchend' ? e.changedTouches[0].pageY : e.pageY;
        translateX = initial_obj_X + (currentX - initial_mouse_X);
        translateY = initial_obj_Y + (currentY - initial_mouse_Y);
        apply_coords();
      } else {
        initial_mouse_X = e.type === 'touchend' ? e.changedTouches[0].pageX : e.pageX;
        initial_mouse_Y = e.type === 'touchend' ? e.changedTouches[0].pageY : e.pageY;
        initial_obj_X = translateX;
        initial_obj_Y = translateY;
      }
    })
    $(".modal").mouseup(function () {
      is_dragging = false;
    });

}