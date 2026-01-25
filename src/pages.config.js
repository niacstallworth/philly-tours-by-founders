import AdminImport from './pages/AdminImport';
import AdminMerchandise from './pages/AdminMerchandise';
import AdminTours from './pages/AdminTours';
import Home from './pages/Home';
import Merchandise from './pages/Merchandise';
import TourDetail from './pages/TourDetail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminImport": AdminImport,
    "AdminMerchandise": AdminMerchandise,
    "AdminTours": AdminTours,
    "Home": Home,
    "Merchandise": Merchandise,
    "TourDetail": TourDetail,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};