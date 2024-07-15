// Copyright (c) Pascal Brand
// MIT License

import './Loading.scss'
import logo from "../img/loader-bars.svg"

function Loading() {
  return (
    <div className="loading--flex loading--modal">
      <img src={logo} width={50} alt='' />
    </div>
  );
}

export { Loading }
