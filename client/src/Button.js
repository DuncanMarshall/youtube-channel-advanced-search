function Button( {isDisabled, label, onClick }) {
  
    let buttonClasses = "button-component ";
    if (isDisabled) {
      	buttonClasses += "bg-gray-400 cursor-not-allowed";
    } else {
      	buttonClasses += "bg-blue-500 hover:bg-blue-700";
    }  

    return (

        <button disabled={isDisabled} className={buttonClasses} onClick={onClick}>
           {label}
        </button>

    );
  }


export default Button;