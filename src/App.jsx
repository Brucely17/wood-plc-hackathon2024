
import Hero from './components/Hero';
import Benefits from './components/Benefits';
import Collaboration from './components/Collaboration';
import Header from './components/Header';
import Footer from './components/Footer';
// import Services from './components/Services';
function App() {
  return (
    <>
    
    <div className="pt-[4.75rem] lg:pt-[5.25rem] overflow-hidden">
   <Header/>
    <Hero/>
    <Benefits/>

<Collaboration/>
       
        <Footer />

    </div>
  
    </>
  );
}


export default App;