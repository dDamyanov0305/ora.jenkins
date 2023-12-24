import { observable, action } from "mobx";
import React from 'react'


class SidebarStore {

    @observable activeMenu = 'main'

    navRef = React.createRef()
    topNavRef = React.createRef()
    mainRef = React.createRef()

    expanded = false;
    hovered = false;

    @action setMenu(_, menu){
        if (menu !== 'main') {
            this.navRef.current.classList.add('hasHover')
            this.topNavRef.current.classList.add("expand")
            this.mainRef.current.classList.add("expand")
            this.expanded = true
        }
        else {
            this.expanded = false
            this.navRef.current.classList.remove('hasHover')
            if (!this.expanded && !this.hovered) {
                this.topNavRef.current.classList.remove("expand")
                this.mainRef.current.classList.remove("expand")
            }
        }

        this.activeMenu = menu
    }

    @action topMouseLeave = () => {
        this.navRef.current.classList.add("filter")
    }

    @action topMouseEnter = () => {
        this.navRef.current.classList.remove("filter")
    }

    @action sidebarMouseEnter = () => {
        this.hovered = true
        this.topNavRef.current.classList.add("expand")
        this.mainRef.current.classList.add("expand")
    }

    @action sidebarMouseLeve = () => {
        this.hovered = false
        if (!this.expanded && !this.hovered) {
            this.topNavRef.current.classList.remove("expand")
            this.mainRef.current.classList.remove("expand")
        }
    }

}


const sidebarStore = new SidebarStore()
export default sidebarStore