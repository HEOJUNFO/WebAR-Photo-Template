import "../styles.css"
import React, { useState } from 'react';

export default function UploadEditor({  onSettingChange }) {
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        
        if (file) {
            const fileURL = URL.createObjectURL(file);

        
            const fileMap = new Map();
            fileMap.set(file.name, file);

            load(fileMap);
            
            return;
        }
    };

    const load = (fileMap) => {
        let rootFile;
        let rootPath;
        Array.from(fileMap).forEach(([path, file]) => {
            if (file.name.match(/\.(gltf|glb)$/)) {
                rootFile = file;
                rootPath = path.replace(file.name, '');
            }
        });

        if (!rootFile) {
            console.log('No .gltf or .glb asset found.');
            return;
        }

        view(rootFile, rootPath, fileMap);
    };


    const view = (rootFile, rootPath, fileMap) => {
    
        const fileURL = typeof rootFile === 'string' ? rootFile : URL.createObjectURL(rootFile);

        onSettingChange({ rootFile: rootFile, rootPath: rootPath, fileMap: fileMap })

        if (typeof rootFile === 'object') URL.revokeObjectURL(fileURL);
        
        return;
    }
 

  return (
   
    <div className="setting-item">
        <label className="slider-label" htmlFor="diamondCountSlider">모델링 업로드</label>
        <input type="file" id="modelUpload" onChange={handleFileChange} />
     </div>
 
  )
}
