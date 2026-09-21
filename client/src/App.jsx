import Navbar from "./components/Navbar";
import CropCard from "./components/CropCard";
import MarketInfo from "./components/MarketInfo";

function App() {
  return (
    <>
      <Navbar />

      <h1>AgriSense Market Dashboard</h1>

      <CropCard crop="Paddy" price="2500" />

      <MarketInfo
        crop="Paddy"
        district="Thanjavur"
        price="2500"
      />
    </>
  );
}

export default App;