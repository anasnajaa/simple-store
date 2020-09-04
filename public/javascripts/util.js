const util = {
    uuid: () => ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)),
    setHtml: (id, html)=>{ document.getElementById(id).innerHTML = html; },
    appendHtml: (id, html) => { document.getElementById(id).insertAdjacentHTML("beforeend", html); },
    enableElement: (id) => { document.getElementById(id).disabled = false; },
    disableElement: (id) => { document.getElementById(id).disabled = true; },
    onClick: (id, func) => { document.getElementById(id).addEventListener("click", func); },
    getVal: (id) => { 
        const el = document.getElementById(id);
        if(el.type === "number") {
            return (el.value === "" || el.value === null) ? 0 : el.value;
        } else if (el.type === "text"){
            return (el.value === "" || el.value === null) ? "" : el.value;
        } else if (el.type === "radio"){
            return el.checked;
        }
    },
    setVal: (id, val) => {
        const el = document.getElementById(id);
        if(el.type === "number") {
            el.value = val;
        } else if (el.type === "text"){
            el.value = val;
        } else if (el.type === "radio"){
            el.checked = val;
        }
    },
    setButton: (id, html, disabled)=> {
        util.setHtml(id, html);
        document.getElementById(id).disabled = disabled;
    },
    triggerClick: (id) => {
        document.getElementById(id).click();
    },
    initMobileMenu: ()=>{
        let collapseElements = document.querySelectorAll('[data-toggle="collapse"]');
        const CLASS_SHOW = 'show';
        const CLASS_COLLAPSE = 'collapse';
        const CLASS_COLLAPSING = 'collapsing';
        const CLASS_COLLAPSED = 'collapsed';
        const ANIMATION_TIME = 350;

        const handleCollapseElementClick = (e) => {
            let el = e.currentTarget;
            let collapseTargetId = el.dataset.target || el.href || null;
            if (collapseTargetId) {
                let targetEl = document.querySelector(collapseTargetId);
                let isShown = targetEl.classList.contains(CLASS_SHOW) || targetEl.classList.contains(CLASS_COLLAPSING);
                if(!isShown) {
                    targetEl.classList.remove(CLASS_COLLAPSE);
                    targetEl.classList.add(CLASS_COLLAPSING);
                    targetEl.style.height = 0;
                    targetEl.classList.remove(CLASS_COLLAPSED);
                    setTimeout(() => {
                        targetEl.classList.remove(CLASS_COLLAPSING);
                        targetEl.classList.add(CLASS_COLLAPSE, CLASS_SHOW);
                        targetEl.style.height = '';
                    }, ANIMATION_TIME);
                    targetEl.style.height = `${targetEl.scrollHeight}px`;
                } else {
                    targetEl.style.height = `${targetEl.getBoundingClientRect().height}px`;
                    targetEl.offsetHeight;
                    targetEl.classList.add(CLASS_COLLAPSING);
                    targetEl.classList.remove(CLASS_COLLAPSE, CLASS_SHOW);
                    targetEl.style.height = '';
                    setTimeout(() => {
                        targetEl.classList.remove(CLASS_COLLAPSING);
                        targetEl.classList.add(CLASS_COLLAPSE);
                    }, ANIMATION_TIME);
                }
            }
        }

        for (let i = 0; i < collapseElements.length; i++) {
            collapseElements[i].addEventListener('click', handleCollapseElementClick);
        };
    },
    showModal: (id) => {
        const locModal = document.getElementById(id);
        locModal.style.backgroundColor = 'rgba(0,0,0,0.5)';
        locModal.style.display = 'block';
        locModal.style.opacity = 0;
        locModal.style.overflow = 'auto';
        setTimeout(() => { 
            locModal.style.opacity = 1; 
            locModal.className = "modal fade show"; 
        }, 100);
    },
    hideModal: (id) => {
        const locModal = document.getElementById(id);
        setTimeout(() => { 
            locModal.style.opacity = 0; 
            locModal.className = "modal fade hide";
            setTimeout(()=>{
                locModal.remove();
            }, 100);
        });
    },
    initModal: (id, title, bodyId, footerId) => {
        const closeId = util.uuid();
        document.body.insertAdjacentHTML("beforeend", templates.modal(id, title, bodyId, footerId, closeId));
        document.getElementById(closeId).addEventListener("click", ()=>{
            util.hideModal(id);
        });
    },
    formatDate: (date) => { 
        if(typeof(date) === "string"){
            date = new Date(date);
        }
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} - ${date.getHours()}:${date.getMinutes()}`
    },
    listenForFileChanges: (fileInputId, callback)=>{
        document.getElementById(fileInputId).onchange = () => {
            const files = document.getElementById(fileInputId).files;
            const file = files[0];
            if(file == null){ 
                callback(null); 
            } else {
                callback(file);
            }  
        };
    },
};