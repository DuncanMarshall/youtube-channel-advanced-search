
const { chromium,  Locator, ElementHandle  } = require('playwright');

export type video = {  
    title: string;  
    id: string;  
    published: number;  
    duration: number;  
    views: number;  
    element: typeof ElementHandle;  
};