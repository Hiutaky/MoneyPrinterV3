import CreateVideo from "./components/forms/createVideo";
import "./App.css";

function App() {
    return (
        <div className="flex flex-col items-center">
            <div className="xl:container flex flex-col border border-t-0">
                <div className="flex flex-row items-center justify-between py-4 border-b px-5">
                    <h1 className="text-lg font-semibold">$MoneyPrinterV3</h1>
                </div>
                <CreateVideo></CreateVideo>
            </div>
        </div>
    );
}

export default App;
