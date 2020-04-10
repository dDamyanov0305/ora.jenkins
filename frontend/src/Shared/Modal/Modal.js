import React from 'react'
import './modal.css'
import { observer } from 'mobx-react';


const Modal = observer(({ show, children }) => {
    const showHideClassname = show ? "modal display-block" : "modal display-none";

    return (
        <div className={showHideClassname}>
          <section className="modal-main">
            {children}
          </section>
        </div>
      );
})

export default Modal