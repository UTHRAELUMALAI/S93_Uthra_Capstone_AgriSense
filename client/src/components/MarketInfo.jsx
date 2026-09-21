function MarketInfo({ crop, district, price }) {
  return (
    <div>
      <h2>Market Information</h2>
      <p>Crop: {crop}</p>
      <p>District: {district}</p>
      <p>Price: ₹{price}</p>
    </div>
  );
}

export default MarketInfo;