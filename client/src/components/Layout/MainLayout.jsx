import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
// import SearchOverlay from "./SearchOverlay";
// import CartSidebar from "./CartSidebar";
import ProfilePanel from "./ProfilePanel";
import LoginModal from "./LoginModal";
import Footer from "./Footer";

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col">
      <Navbar />
      <Sidebar />
      {/* <SearchOverlay /> */}
      {/* <CartSidebar /> */}
      <ProfilePanel />
      <LoginModal />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;
