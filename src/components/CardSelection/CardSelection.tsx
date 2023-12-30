import React, { Dispatch, SetStateAction } from "react";

interface SelectionCardProps {
  title: string;
  selected: boolean;
  onSelect: Dispatch<SetStateAction<string>>;
}
const CardSelection: React.FC<SelectionCardProps> = ({ title, selected, onSelect }) => {
    const handleClick = () => {
      onSelect(title);
    };
  
    const cardStyle = selected ? { backgroundColor: "#e0e0e0" } : {}; // Example styling for selected card
  
    return (
      <div className="selection-card" onClick={handleClick} style={cardStyle}>
        {title}
      </div>
    );
  };
  export default CardSelection;