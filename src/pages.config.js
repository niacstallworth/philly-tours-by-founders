import Home from './pages/Home';
import TourDetail from './pages/TourDetail';
import AdminTours from './pages/AdminTours';
import AdminImport from './pages/AdminImport';
import ScavengerHunt from './pages/ScavengerHunt';
import AdminScavengerHunts from './pages/AdminScavengerHunts';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "TourDetail": TourDetail,
    "AdminTours": AdminTours,
    "AdminImport": AdminImport,
    "ScavengerHunt": ScavengerHunt,
    "AdminScavengerHunts": AdminScavengerHunts,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};