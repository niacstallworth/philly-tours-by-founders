/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import ARExperience from './pages/ARExperience';
import AdminHunts from './pages/AdminHunts';
import AdminImport from './pages/AdminImport';
import AdminImportGPS from './pages/AdminImportGPS';
import AdminMerchandise from './pages/AdminMerchandise';
import AdminSettings from './pages/AdminSettings';
import AdminTours from './pages/AdminTours';
import Home from './pages/Home';
import HuntDetail from './pages/HuntDetail';
import Merchandise from './pages/Merchandise';
import TourDetail from './pages/TourDetail';
import UserSettings from './pages/UserSettings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "ARExperience": ARExperience,
    "AdminHunts": AdminHunts,
    "AdminImport": AdminImport,
    "AdminImportGPS": AdminImportGPS,
    "AdminMerchandise": AdminMerchandise,
    "AdminSettings": AdminSettings,
    "AdminTours": AdminTours,
    "Home": Home,
    "HuntDetail": HuntDetail,
    "Merchandise": Merchandise,
    "TourDetail": TourDetail,
    "UserSettings": UserSettings,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};