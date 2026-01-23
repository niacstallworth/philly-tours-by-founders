import AdminImport from './pages/AdminImport';
import AdminMerchandise from './pages/AdminMerchandise';
import AdminScavengerHunts from './pages/AdminScavengerHunts';
import AdminTours from './pages/AdminTours';
import Home from './pages/Home';
import Merchandise from './pages/Merchandise';
import ScavengerHunt from './pages/ScavengerHunt';
import TourDetail from './pages/TourDetail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminImport": AdminImport,
    "AdminMerchandise": AdminMerchandise,
    "AdminScavengerHunts": AdminScavengerHunts,
    "AdminTours": AdminTours,
    "Home": Home,
    "Merchandise": Merchandise,
    "ScavengerHunt": ScavengerHunt,
    "TourDetail": TourDetail,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};