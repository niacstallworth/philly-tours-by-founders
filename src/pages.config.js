import AdminImport from './pages/AdminImport';
import AdminScavengerHunts from './pages/AdminScavengerHunts';
import AdminTours from './pages/AdminTours';
import Home from './pages/Home';
import ScavengerHunt from './pages/ScavengerHunt';
import TourDetail from './pages/TourDetail';
import Merchandise from './pages/Merchandise';
import AdminMerchandise from './pages/AdminMerchandise';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminImport": AdminImport,
    "AdminScavengerHunts": AdminScavengerHunts,
    "AdminTours": AdminTours,
    "Home": Home,
    "ScavengerHunt": ScavengerHunt,
    "TourDetail": TourDetail,
    "Merchandise": Merchandise,
    "AdminMerchandise": AdminMerchandise,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};