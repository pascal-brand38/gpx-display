// Copyright (c) Pascal Brand
// MIT License

import { FaRegCircleCheck, FaRegCircleXmark } from "react-icons/fa6";
import './Modal.scss'
import logo from "../img/loader-bars.svg"

function Loading() {
  return (
    <div className="modal">
      <img src={logo} width={50} alt='' />
    </div>
  );
}

function YesNo(text1, text2, handleResponse) {
  return (
    <div className="modal">
      <div className="modal--box">
      <div className='modal--text'>
          {text1}
        </div>
        <div className='modal--text'>
          {text2}
        </div>
        <div className="modal--buttons">
          <div> <FaRegCircleCheck className="modal--button modal--yes" onClick={() => handleResponse(true)} /> </div>
          <div> <FaRegCircleXmark className="modal--button modal--no" onClick={() => handleResponse(false)} /> </div>
        </div>
      </div>
    </div>
  );
}

export { Loading, YesNo }
