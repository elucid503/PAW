async function handleEvents() { 

    function wordChoice(num, word) { 

        if (num == 1) return word
        else return `${word}s`
      
    }

    function truncateString(str, num) {
        if (str.length > num) {
          return str.slice(0, num) + "...";
        } else {
          return str;
        }
      }
      
    function renderEvents() {

        var bg = document.querySelector('.item-bg');
        var items = document.querySelectorAll('.news__item');
        var item = document.querySelector('.news__item');
    
        function cLog(content) {
            console.log(content)
        }
    
        if ($(window).width() > 800) {
            $(document).on("mouseover", ".news__item", function (_event, _element) {
    
                var newsItem = document.querySelectorAll('.news__item');
                newsItem.forEach(function (element, index) {
                    element.addEventListener('mouseover', function () {
                        var x = this.getBoundingClientRect().left;
                        var y = this.getBoundingClientRect().top;
                        var width = this.getBoundingClientRect().width;
                        var height = this.getBoundingClientRect().height;
    
                        $('.item-bg').addClass('active');
                        $('.news__item').removeClass('active');
                        // $('.news__item').removeClass('active');
    
    
                        bg.style.width = width + 'px';
                        bg.style.height = height + 'px';
                        bg.style.transform = 'translateX(' + x + 'px ) translateY(' + y + 'px)';
                    });
    
                    element.addEventListener('mouseleave', function () {
                        $('.item-bg').removeClass('active');
                        $('.news__item').removeClass('active');
                    });
    
                });
    
            });
        }
    
    
        var swiper = new Swiper('.news-slider', {
            allowTouchMove: false,
            effect: 'coverflow',
            loop: true,
            centeredSlides: true,
            keyboard: false,
            spaceBetween: 0,
            slidesPerView: 'auto',
            speed: 500,
            effect: 'slide',
            coverflowEffect: {
                rotate: 0,
                stretch: 0,
                depth: 0,
                modifier: 3,
                slideShadows: false
            },
            breakpoints: {
                480: {
                    spaceBetween: 0,
                    centeredSlides: true
                }
            },
            simulateTouch: true,
            navigation: {
                nextEl: '.news-slider-next',
                prevEl: '.news-slider-prev'
            },
            pagination: {
                el: '.news-slider__pagination',
                clickable: true
            },
            on: {
                init: function () {
                    var activeItem = document.querySelector('.swiper-slide-active');
    
                    if (!activeItem) { return }
                    var sliderItem = activeItem.querySelector('.news__item');
    
                    $('.swiper-slide-active .news__item').addClass('active');
    
                    var x = sliderItem.getBoundingClientRect().left;
                    var y = sliderItem.getBoundingClientRect().top;
                    var width = sliderItem.getBoundingClientRect().width;
                    var height = sliderItem.getBoundingClientRect().height;
    
    
                    $('.item-bg').addClass('active');
    
                    bg.style.width = width + 'px';
                    bg.style.height = height + 'px';
                    bg.style.transform = 'translateX(' + x + 'px ) translateY(' + y + 'px)';
                }
            }
        });
    
        swiper.on('touchEnd', function () {
            $('.news__item').removeClass('active');
            $('.swiper-slide-active .news__item').addClass('active');
        });
    
        swiper.on('slideChange', function () {
            $('.news__item').removeClass('active');
        });
    
        swiper.on('slideChangeTransitionEnd', function () {
            $('.news__item').removeClass('active');
            var activeItem = document.querySelector('.swiper-slide-active');
            if (!activeItem) { return }
    
            var sliderItem = activeItem.querySelector('.news__item');
    
            $('.swiper-slide-active .news__item').addClass('active');
    
            var x = sliderItem.getBoundingClientRect().left;
            var y = sliderItem.getBoundingClientRect().top;
            var width = sliderItem.getBoundingClientRect().width;
            var height = sliderItem.getBoundingClientRect().height;
    
    
            $('.item-bg').addClass('active');
    
            bg.style.width = width + 'px';
            bg.style.height = height + 'px';
            bg.style.transform = 'translateX(' + x + 'px ) translateY(' + y + 'px)';
        });
        
    }

    renderEvents()

    // Calander
    
    $.ajax({
        url: `https://api.sjparts.org/events`,
        context: document.body
    }).done(function (data) {

        const days = new Object()
        data?.events?.forEach((event) => {
            if (!days[event?.times?.day]) { days[event?.times?.day] = [] }
            days[event?.times?.day].push(event.id)
        })
        
        const currentDate=document.querySelector(".current-date");
        daysTag=document.querySelector(".days");
        prevNextIcon = document.querySelectorAll(".icons span");
        let date = new Date();
        currYear=date.getFullYear();
        currMonth=date.getMonth();
        const months=["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        const renderCalander = () => {
            let firstDateofMonth=new Date(currYear,currMonth,1).getDay();
            lastDateofMonth=new Date(currYear,currMonth+1,0).getDate();
            lastDayofMonth=new Date(currYear,currMonth,lastDateofMonth).getDay()
            lastDateoflastMonth=new Date(currYear,currMonth,0).getDate();
            let liTag=" ";
            for(let i=firstDateofMonth;i>0;i--)
                {
                liTag+=`<li class="inactive">${lastDateoflastMonth-i+1}</li>`;
                }
            for(let i=1;i<=lastDateofMonth;i++)
                {
                let isToday = i === date.getDate() && currMonth === new Date().getMonth() && currYear === new Date().getFullYear() ? "active" : "";

                if (Object.keys(days).includes(i.toString())) {
                    
                    let eventsToday = days[i.toString()]

                    for (const eventToday of eventsToday) { 

                        let apiEvent = data?.events.filter((event) => event.id == eventToday)

                        apiEvent.forEach((event) => { 

                            if (months.indexOf(event.times.month) !== currMonth || parseInt(event.times.year) !== currYear) { isToday = "" }
                            else { isToday = "event" }

                        })
                        
                    }

                }

                tooltip = ''
                if (isToday !== '') { tooltip = `<span class="tooltiptext">${days[i.toString()]?.length || 0} ${wordChoice(days[i.toString()]?.length || 0, 'Event')}<br><span class="miniText">Click for all events</span></span>` }

                liTag += `<li class="${isToday}">${i}${tooltip}</li>`;
                }
            for(let i=lastDayofMonth;i<6;i++)
                {
                liTag+=`<li class="inactive">${i-lastDayofMonth+1}</li>`;
                }
            currentDate.innerText= `${months[currMonth]}, ${currYear}`;
            daysTag.innerHTML=liTag;
    }
        renderCalander();
        prevNextIcon.forEach(icon=>{
        icon.addEventListener('click',()=>{
            currMonth=icon.id==="prev"?currMonth-1:currMonth+1;
            if(currMonth<0||currMonth>11)
            {
                date=new Date(currYear,currMonth);
                currYear=date.getFullYear();
                currMonth=date.getMonth();
            }
            else
            {
                date=new Date();
            }
            renderCalander();
        })
            
        });
    
        const newsContainer = document.querySelector('div.news-slider__wrp.swiper-wrapper')

        function urlify(text) {
            var urlRegex = /(https?:\/\/[^\s]+)/g;
            return text.replace(urlRegex, function (url) {
                return '<a target="_blank"  href="' + url + '">' + url + '</a>';
            })
        }

        let regex = /(<([^>]+)>)/ig

        function format(description) { 
        
            description = description.replace(regex, '')

            description = urlify(description)

            let operand = ''

            if (description.length > 275) { 

                operand = '...'

            }

            description = description.substring(0, 275) + operand

            return description

        }

        data.events.forEach((event) => { 

            const element = document.createElement('div')
            element.className = 'news-slider__item swiper-slide'
            element.innerHTML = `<div class="news__item">
            <div class="news-date">
              <span class="news-date__title">${event.times.month} ${event.times.day}</span>
              <span class="news-date__txt"><i class='bx bx-calendar-event' ></i> ${event.times.startTime ? `${event.times.startTime} - ${event.times.endTime}` : 'All Day'}</span>
              <br>
              <span class="news-date__location" ><i class='bx bxs-map' ></i> ${event.location}</span>
            </div>
            <div class="news__title">
              ${event.name}
            </div>
            <p class="news__txt">
            ${format(event.description)}
            </p>
          </div>`
            
            newsContainer.appendChild(element)
            renderEvents()

        })

        let metaModal = document.getElementById("metadata")
        let metaContent = document.getElementById("metadata-content")

        daysTag.addEventListener('click', (e) => { 

            if (e.target.className.includes('event')) { 

                let day = e.target.innerHTML.substring(0, 2).replace("<", "")

                let events = data?.events?.filter((event) => event.times.day == day)

                let compiled = new Array()

                events.forEach((event) => {
                    
                    let innerHTML = ''
                    if (events.indexOf(event) == 0) { innerHTML += `<h2>${event.times.month} ${event.times.day}, ${event.times.year}</h2><hr>` }

                    innerHTML += `
                    <span id="eventTitle">${event.name}</span>
                    <br>
                    <span id="detail">Event Starts</span> <span id="value">${event.times.starts}</span>
                    <br>
                    <span id="detail">Event Ends</span> <span id="value">${event.times.ends}</span>
                    <br>
                    <br>
                    <span id="detail">Event Location</span> <span id="value">${truncateString(event.location, 25)}</span>
                    <br>
                    <span id="detail">Event Description</span> <span id="value">${truncateString(event.description.replace(regex, ''), 25)}</span>
                    <br>
                    <br>
                    <span id="detail">Event Created</span> <span id="value">${event.times.created}</span>
                    <br>
                    <span id="detail">Event Last Updated</span> <span id="value">${event.times.updated}</span>`
                    
                    if (events.indexOf(event) == events.length - 1) { 

                        innerHTML += `<div class="metaControls">
                        <button id="closeMetadata">Close</button>
                        <button id="viewEvent" url="${event.url}"><i class='bx bx-link-external' ></i> Open Event</button>
                        </div>`

                    }

                    else { 

                        innerHTML += `<div class="metaControls">
                        <button id="viewEvent" url="${event.url}"><i class='bx bx-link-external' ></i> Open Event</button>
                        </div>`

                    }

                    compiled.push(innerHTML)

                })

                metaContent.innerHTML = compiled.join('<br>')
            
                metaModal.style.display = "flex"
                metaModal.style.zIndex = "100"
                document.body.style.overflow = 'hidden'

                
            }
            
            
        })

        metaModal.onclick = function (e) { 

            if (e.target.id.includes('viewEvent')) { 

                window.open(e.target.getAttribute('url'))

            }

            if (e.target.className.includes('metaModal') || e.target.id.includes('closeMetadata')) {
    
                metaModal.style.display = 'none'
                document.body.style.overflow = 'scroll'
              
            }

          }

    })
    
}