import React, { useState, useEffect, useCallback } from "react";

const CollapsibleSection = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(true);

    const toggleOpen = useCallback(() => {
        setIsOpen((prev) => !prev);  // Toggle state
        console.log("work")
    }, []);

    useEffect(() => {
        toggleOpen(); // Call only once on mount

    }, [toggleOpen]); // No re-renders from this useEffect
    return (
    <div>
        <div onClick={toggleOpen} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <span className="collapsible-arrow" style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0s' }}>▶</span>
            <h2 className="collapsible-title">{title}</h2>
        </div>
        {isOpen && <div className="collapsible-content" >{children}</div>}
    </div>
    );
};

export default CollapsibleSection;