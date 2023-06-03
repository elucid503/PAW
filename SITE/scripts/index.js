function events() { 

    const body = document.querySelector("body"),
        nav = document.querySelector("nav"),
        modeToggle = document.querySelector(".dark-light"),
        socials = document.querySelector(".socials"),
        sidebarOpen = document.querySelector(".sidebarOpen");

    let getMode = localStorage.getItem("mode");
        
    if (getMode && getMode === "dark-mode") {
            body.classList.add("dark");
    }
    else if (!getMode) { 
            body.classList.add("dark");
    }

    if (modeToggle) {
        modeToggle?.addEventListener("click", () => {
            modeToggle.classList.toggle("active");
            body.classList.toggle("dark");
            if (!body.classList.contains("dark")) {
                localStorage.setItem("mode", "light-mode");
            } else {
                localStorage.setItem("mode", "dark-mode");
            }
        });
    }
      
    sidebarOpen.addEventListener("click" , () =>{
        nav.classList.toggle("active");
    });

    socials.addEventListener("click", (e) => { 

        if (e.target.className.includes('instagram')) { 

            window.open('https://instagram.com/sjp_arts')

        }

    })

    body.addEventListener("click" , e =>{
        let clickedElm = e.target;

        if(!clickedElm.classList.contains("sidebarOpen") && !clickedElm.classList.contains("menu")){
            nav.classList.remove("active");
        }
    });
}