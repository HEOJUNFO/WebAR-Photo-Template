import React, { Suspense, useState } from 'react';
import { createRoot } from "react-dom/client";
import "./styles.css"; // Assuming this is where the provided CSS is
import DiamondApp from "./apps/App";
import UploadApp from "./apps/UploadApp";
import DiamondEditor from './editors/DiamondEditor';
import UploadEditor from './editors/UploadEditor';


function Main() {
    const [settings, setSettings] = useState({});
    const [selectedTemplate, setSelectedTemplate] = useState("diamond"); 

  
    const handleSettingChange = (newSetting) => {
        setSettings({ ...settings, ...newSetting });
    };

    const handleTemplateChange = (e) => {
        setSelectedTemplate(e.target.value);
    };

    const appComponents = {
        diamond: DiamondApp,
        upload: UploadApp,
    };
    const SelectedApp = appComponents[selectedTemplate];

    const editorComponents = {
        diamond: DiamondEditor,
        upload: UploadEditor,
    };
    const SelectedEditor = editorComponents[selectedTemplate];

    return (
        <div className="main-container" style={{ display: 'flex', width: '100%', height: '100%' }}>
            <div className="canvas-container" style={{ width: '80%', height: '100%' }}>
            <Suspense fallback={null}>
             <SelectedApp settings={settings} />
            </Suspense>
            </div>
            <div className="editor-container">
                <div className="template-selector">
                    <label>템플릿: </label>
                    <select value={selectedTemplate} onChange={handleTemplateChange}>
                        {Object.keys(appComponents).map(template => (
                            <option key={template} value={template}>{template}</option>
                        ))}
                    </select>
                </div>
                <SelectedEditor  onSettingChange={handleSettingChange} />
            </div>
        </div>
    );
}

createRoot(document.getElementById("root")).render(<Main />);