// Copyright (c) Pascal Brand
// MIT License

import PropTypes from 'prop-types';
import { useState, useEffect, useRef } from "react";
import './RchDropdown.scss'
// import { RchIcons } from "./RchIcons";


/// Can be used with
///    { RchIcon['dropdown'][true] }
/// to render the dropdown icon, when the dropdown is opened (true)


// search for icons at https://react-icons.github.io/react-icons/
import { SlMagnifier } from "react-icons/sl";
import { AiFillCaretDown, AiFillCaretUp } from "react-icons/ai"

const RchIcons = {
  dropdown: {
    true: <AiFillCaretUp />,
    false: <AiFillCaretDown />,
  },
  searchbar: {
    true: <SlMagnifier />,
    false: <SlMagnifier />,
  }
}

const RchDropdown = (
  {
    type,               // type of dropdown: dropdown, or searchbar
    initialValue,       // initial value of the box
    list,               // list of items to be shown in the dropdown when opened, or in the searchbar when guessing
    valueFromItem,      // how the item is printed
    onChange,
    onSelect,           // ({ index, item }) function, called when an item is selected from the dropdown
    maxNbInCol = -1       // max number elements in a colum
  }
) => {

  // whether or not a list is shown below the button
  const [isOpen, setIsOpen] = useState(false);
  const toggleIsOpen = (e) => { e.preventDefault(); setIsOpen(!isOpen); console.log(`toggleIsOpen`); }
  const updateIsOpen = (newState) => { if (isOpen != newState) { setIsOpen(newState); } }
  const dropdownRef = useRef(null)

  // value shown in in the button
  const [value, setValue] = useState(initialValue);

  // the item in the list that is hovered thanks to the keyboard
  const [hovered, setHovered] = useState(-1)
  const decHovered = () => setHovered((prev) => {
    if (prev <= 0) {
      return list.length - 1
    } else {
      return (prev - 1)
    }
  })
  const incHovered = () => setHovered((prev) => (prev + 1) % list.length)

  // function raised when an item from the list is selected
  const selectItem = ({ index, item }) => {
    updateIsOpen(false);                         // close the dropdown or the guesses
    setValue(valueFromItem(item));            // set the new value to display in the button
    onSelect({ index: index, item: item });   // call the external callback for action with this selection
  }

  function onKeyUp({ key }) {
    if (key === "Enter") {
      console.log(`Enter ${list} ${isOpen}`)
      if (list && isOpen) {
        console.log(`list && isOpen`)
        if (hovered) {
          selectItem({ index: hovered, item: list[hovered] })
        } else {
          selectItem({ index: 0, item: list[0] })
        }
      }
    } else if (key === "Escape") {
      updateIsOpen(false);
    } else if (key === "ArrowUp") {
      if (list && isOpen) {
        decHovered()
      }
    } else if (key === "ArrowDown") {
      if (list && isOpen) {
        incHovered()
      }
    }
  }

  function handleClick(e) {
    // check if we click outside this dropdown button
    // in this case, we close it
    for (let parent = e.target.parentNode; parent !== null; parent = parent.parentNode) {
      if (parent === dropdownRef.current) {
        return;   // do not close as the clicked div is a child of this dropdown button
      }
    }
    setIsOpen(false)
  }

  useEffect(() => {
    if (isOpen) {
      if (hovered !== -1) {
        setHovered(-1)
      }
      addEventListener('click', handleClick);
      return () => window.removeEventListener("click", handleClick);    // remove this event listener when isOpen is modified
      // so when it is closed, there is no event handler
    }
  }, [isOpen])

  let styleColumns = {}
  if (list && maxNbInCol !== -1) {
    const value = Math.floor(list.length / maxNbInCol) + 1
    styleColumns = { columns: value.toString() }
  }

  return (
    <div ref={dropdownRef} className="rch-dropdown" onClick={toggleIsOpen} onKeyUp={onKeyUp} >
      <div className="rch-dropdown__top">
        {(type === 'dropdown') &&
          <button className="menu__button rch-dropdown__top-toclick">
            <div className='rch-dropdown__button'>
              <div>{value}</div>
              <div>
                {RchIcons[type][isOpen]}
              </div>
            </div>
          </button>}

        {(type === 'searchbar') &&
          <input
            className="rch-dropdown__top-toclick"
            type="text"
            value={value}
            onChange={(e) => { updateIsOpen(true); setValue(e.target.value); onChange(e.target.value); }}
            onFocus={(e) => { updateIsOpen(true); setValue(e.target.value); onChange(e.target.value); }}
          />
        }

      </div>

      {(list && isOpen) ? (
        <ul className="rch-dropdown__list" style={styleColumns}>
          {
            list.map((item, index) => (
                <li key={index} className="rch-dropdown__list-item">
                  <button className="menu__button rch-dropdown__list-item" onClick={() => selectItem({ index: index, item: item })}>
                    {valueFromItem(item)}
                  </button>
                </li>
            ))
          }
        </ul>
      ) : null}
    </div>
  );
}

export default RchDropdown;

RchDropdown.propTypes = {
  type: PropTypes.string.isRequired,
  initialValue: PropTypes.string.isRequired,
  list: PropTypes.array,
  valueFromItem: PropTypes.func.isRequired,
  onChange: PropTypes.func,
  onSelect: PropTypes.func.isRequired,
  maxNbInCol: PropTypes.number
}
