import React, { useState, useEffect, useCallback } from "react";



import SearchSection from './SearchSection';
import ImportSection from './ImportSection';
import './App.css';




const App = () => {
    useEffect(() => {
        document.title = 'Channel Advanced Search';
      }, []);
    return (
        <>
            <h1>YouTube Channel Advanced Search</h1>

            <div id="instructions">
                
            <p>Paste in the channel id (including the @, where appropriate) in the import section, and hit import.</p>
            
            <p>Make sure update is checked to only import until the latest result we already have stored.</p>

            <p>Once imported, you can search the channel in the search section.</p>
            </div>

            <div>
                <ImportSection />
            </div>
            <div>
                <SearchSection />
            </div>
        </>
    );
};

export default App;

