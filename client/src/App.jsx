import Navbar from "./components/Navbar";
import CropCard from "./components/CropCard";
import MarketInfo from "./components/MarketInfo";
import FileUpload from "./components/FileUpload";

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

      <FileUpload />
    </>
  );
}

export default App;