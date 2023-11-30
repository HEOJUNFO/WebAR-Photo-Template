import "../styles.css"
import React, { useState } from 'react';


export default function DiamondEditor({  onSettingChange }) {
  const [diamondCount, setDiamondCount] = useState(20);

  const handleSettingChange = (value) => {
      setDiamondCount(value);
      onSettingChange({ diamondCount: value });
  };
  return (
   
    <div className="setting-item">
        <label className="slider-label" htmlFor="diamondCountSlider">다이아몬드 수 설정</label>
        <input
                    id="diamondCountSlider"
                    type="range"
                    min="1"
                    max="100"
                    value={diamondCount}
                    onChange={(e) => handleSettingChange(parseInt(e.target.value))}
                />
     </div>
 
  )
}


