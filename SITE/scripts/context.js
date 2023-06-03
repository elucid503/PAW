function contextMenu() {

  let selected = null

  const copyIcon = `<i class="bx bx-copy" style="font-size:16px; margin-right: 7px;"></i>`;
  const linkIcon = `<i class="bx bx-link-external" style="font-size:16px; margin-right: 7px;"></i>`;
  const searchIcon = `<i class="bx bx-search" style="font-size:16px; margin-right: 7px;"></i>`;
  const speakIcon = `<i class="bx bx-user-voice" style="font-size:16px; margin-right: 7px;"></i>`;
  const downloadIcon = `<i class="bx bx-download" style="font-size:16px; margin-right: 7px;"></i>`;

  const menuItems = [
    {
      content: `${copyIcon}Copy Text`,
      events: {
        click: (e) => {

          let target = selected

            if ((target.innerText || target.innerText != '') && target.localName != 'body') { 
              navigator.clipboard.writeText(target.innerText)
            }
            else { 
              let note = document.nc.spawnNote('cp_error')
              setTimeout(() => { document.nc.killNote(note.id) }, 3500)
              return 
            }
    
          let note = document.nc.spawnNote('copy')
          setTimeout(() => { document.nc.killNote(note.id) }, 3500)

        }
      }
    },
    {
      content: `${linkIcon}Open Link`,
      events: {
        click: (e) => { 
          
          let target = selected
            
          let link = target.getAttribute('href') || target.getAttribute('src')

          if (!link) {
            let note = document.nc.spawnNote('link_error')
            setTimeout(() => { document.nc.killNote(note.id) }, 3500)
            return 
          }

          window.open(link)

        }
      }
    },
    {
      content: `${searchIcon}Search Web`,
      events: {
        click: (e) => {

          let target = selected

            if ((target.innerText || target.innerText != '') && target.localName != 'body') { 
              window.open(encodeURI(`https://duckduckgo.com/?q=${target.innerText}`))
            }
          
            else { 
              let note = document.nc.spawnNote('search_error')
              setTimeout(() => { document.nc.killNote(note.id) }, 3500)
              return 
            }
        }
      }

    },
    {
      content: `${speakIcon}Speak Text`,
      events: {
        click: (e) => {

          let target = selected

          if ((target.innerText || target.innerText != '') && target.localName != 'body') {

            let speech = new SpeechSynthesisUtterance()

            voices = window.speechSynthesis.getVoices()

            speech.lang = "en"
            speech.voice = voices[0]
            speech.text = target.innerText
            window.speechSynthesis.speak(speech)

          }
        
          else {
            let note = document.nc.spawnNote('speak_error')
            setTimeout(() => { document.nc.killNote(note.id) }, 3500)
            return
          }
        }
      }
    },
    {
      content: `${downloadIcon}Download Media`,
      divider: "top", // top, bottom, top-bottom
      events: {
        click: async (e) => {

          let note = document.nc.spawnNote('download_error')
          setTimeout(() => { document.nc.killNote(note.id) }, 3500)
        
        }
      }

    }
  ];
  class ContextMenu {
    constructor({ target = null, menuItems = [], mode = "dark" }) {
      this.target = target;
      this.menuItems = menuItems;
      this.mode = mode;
      this.menuItemsNode = this.getMenuItemsNode();
      this.isOpened = false;
    }

    getMenuItemsNode() {
      const nodes = [];

      if (!this.menuItems) {
        console.error("getMenuItemsNode :: Please enter menu items");
        return [];
      }

      this.menuItems.forEach((data, index) => {
        const item = this.createItemMarkup(data);
        item.firstChild.setAttribute(
          "style",
          `animation-delay: ${index * 0.03}s`
        );
        nodes.push(item);
      });

      return nodes;
    }

    createItemMarkup(data) {
      const button = document.createElement("BUTTON");
      const item = document.createElement("LI");

      button.innerHTML = data.content;
      button.classList.add("contextMenu-button");
      item.classList.add("contextMenu-item");

      if (data.divider) item.setAttribute("data-divider", data.divider);
      item.appendChild(button);

      if (data.events && data.events.length !== 0) {
        Object.entries(data.events).forEach((event) => {
          const [key, value] = event;
          button.addEventListener(key, value);
        });
      }

      return item;
    }

    renderMenu() {
      const menuContainer = document.createElement("UL");

      menuContainer.classList.add("contextMenu");
      menuContainer.setAttribute("data-theme", this.mode);

      this.menuItemsNode.forEach((item) => menuContainer.appendChild(item));

      return menuContainer;
    }

    closeMenu(menu) {
      if (this.isOpened) {
        this.isOpened = false;
        menu.remove();
      }
    }

    init() {
      const contextMenu = this.renderMenu();
      document.addEventListener("click", () => this.closeMenu(contextMenu));
      window.addEventListener("blur", () => this.closeMenu(contextMenu));

      let modeToggle = document.querySelector(".dark-light");
      
      if (modeToggle) {
        modeToggle.addEventListener("click", () => {

          let theme = contextMenu.getAttribute('data-theme')
          if (theme == 'light') { contextMenu.setAttribute('data-theme', 'dark') } else { contextMenu.setAttribute('data-theme', 'light') }

        })
      }

      document.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        this.isOpened = true;

        const { clientX, clientY } = e;
        document.body.appendChild(contextMenu);

        const positionY =
          clientY + contextMenu.scrollHeight >= window.innerHeight
            ? window.innerHeight - contextMenu.scrollHeight - 20
            : clientY;
        const positionX =
          clientX + contextMenu.scrollWidth >= window.innerWidth
            ? window.innerWidth - contextMenu.scrollWidth - 20
            : clientX;

        contextMenu.setAttribute(
          "style",
          `--width: ${contextMenu.scrollWidth}px;
              --height: ${contextMenu.scrollHeight}px;
              --top: ${positionY}px;
              --left: ${positionX}px;
              --z-index: 101;`,
        );

        selected = e.target
        
      });

    }
  }

  let modeToSelect = 'dark';
  if (!document.body.className.includes('dark')) { modeToSelect = 'light' }

  const menu = new ContextMenu({
    target: '.slider',
    mode: modeToSelect,
    menuItems
  });

  menu.init();

  function removeMessage() {
    const message = document.querySelector(".right-click");
    if (message) message.remove();
  }

  window.addEventListener("click", removeMessage);
  window.addEventListener("contextmenu", removeMessage);

}