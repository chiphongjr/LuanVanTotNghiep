import { Menu, User, ShoppingCart, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleAuthPopup, toggleSidebar } from "../../store/slices/popupSlice";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import { axiosInstance } from "../../lib/axios";
import { formatVND } from "../../utils/formatVND";

const Navbar = () => {
  const { cart } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (!search.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const { data } = await axiosInstance.get(
          `/product/search-suggest?keyword=${search}`
        );
        setSuggestions(data.products || []);
      } catch (error) {
        console.log(error);
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const location = useLocation();

useEffect(() => {
  setSuggestions([]);
}, [location.pathname]);

  const handleSearch = (e) => {
    if (e.key === "Enter" && search.trim()) {
      navigate(`/products?search=${search.trim()}`);
      setSuggestions([]);
      e.target.blur();
    }
  };

  // const cartItemsCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;
  const cartItemsCount = cart?.cart_total_quantity || 0
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b shadow">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-2 ">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 rounded hover:bg-gray-200"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1
            onClick={() => {
              navigate("/");
              setSearch("");
              setSuggestions([]);
            }}
            className="text-xl font-bold cursor-pointer"
          >
            JrShop
          </h1>
        </div>

        {/* Center - Search */}
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {/*drop down search*/}
          {search && suggestions.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-white border rounded-lg shadow-lg z-50 overflow-hidden">
              {suggestions.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    navigate(`/product/${product.id}`);
                    setSearch("");
                    setSuggestions([]);
                  }}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-100 transition relative"
                >
                  <img
                    src={product.images?.[0]?.url}
                    alt={product.name}
                    className="items-center object-contain w-16 h-16 border rounded-md"
                  />
                  <div className="flex flex-col flex-1">
                    <p className="text-lg font-medium text-gray-800 line-clamp-1 absolute top-2">
                      {product.name}
                    </p>
                    <span className="text-md font-semibold text-red-500">
                      {formatVND(product.price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch(toggleAuthPopup())}
            className="p-2 rounded hover:bg-gray-200"
          >
            <User className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate("/cart")}
            className="relative p-2 rounded hover:bg-gray-200"
          >
            <ShoppingCart className="w-5 h-5" />
             {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {cartItemsCount}
              </span>
            )} 
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
