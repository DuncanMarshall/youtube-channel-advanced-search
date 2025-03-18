const Checkbox = ({ label, state, setState }) => {

	return (
		<>
			<label className="flex items-center space-x-2 cursor-pointer checkbox-label"></label>
			<input
			type="checkbox"
			checked={state}
			onChange={() => setState(!state)}
			className="w-5 h-5 checkbox-component"
			/>
			<span className="checkbox-span">{label}</span>
		</>
  	);
};

export default Checkbox;