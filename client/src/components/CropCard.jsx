function CropCard({ crop, price }) {
  return (
    <div>
      <h3>{crop}</h3>
      <p>Market Price: ₹{price}</p>
    </div>
  );
}

export default CropCard;