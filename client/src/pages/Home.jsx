import React from "react";
import HeroSlider from "../components/Home/HeroSlider";
import CategoryGrid from "../components/Home/CategoryGrid";
import ProductSlider from "../components/Home/ProductSlider";
import FeatureSection from "../components/Home/FeatureSection";
import { useSelector } from "react-redux";
const Index = () => {
  const { topRatedProducts, newProducts } = useSelector(
    (state) => state.product
  );

  return (
    <div>
      <HeroSlider />

      <div className="max-w-7xl mx-auto px-4">
        <CategoryGrid />

        {newProducts.length > 0 && (
          <ProductSlider title="Sản phẩm mới" products={newProducts} />
        )}

        {topRatedProducts.length > 0 && (
          <ProductSlider
            title="Sản phẩm bán chạy"
            products={topRatedProducts}
          />
        )}

        <FeatureSection />
      </div>
    </div>
  );
};

export default Index;
