import React, { useState } from 'react';
import { benefits } from "../constants";
import Heading from "./Heading";
import Section from "./Section";
import Arrow from "../assets/svg/Arrow";
import { GradientLight } from "./design/Benefits";
import ClipPath from "../assets/svg/ClipPath";
import Display from "./Display";
import PricingList from './Display';
import Roadmap from './Roadmap';

const Benefits = () => {
  const [selectedId, setSelectedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(null);

  const handleClick = (id) => {
    setSelectedId(id);
    if (id == 3) {
      setShowForm(true);
    }
  };

  const handleFormSubmit = (data) => {
    setFormData(data);
    setShowForm(false);
  };

 

  return (
    <>
    <Section id="features">
      <div className="relative z-10">
        <Heading
          className="md:max-w-md lg:max-w-2xl"
          title="Desicion and Suggestion for your platform"
        />

        {/* Cards To display Template */}
        <div className="flex flex-wrap justify-center gap-10 mb-10">
          {benefits.map((item) => (
            <div
              className="block relative p-0.5 bg-no-repeat bg-[length:100%_100%] md:max-w-[24rem]"
              style={{
                backgroundImage: `url(${item.backgroundUrl})`,
              }}
              key={item.id}
            >
              <div className="relative z-20 flex flex-col min-h-[22rem] p-[2.4rem] pointer-events-none">
                {/* title, text */}
                <h5 className="h5 mb-5">{item.title}</h5>
                <p className="body-2 mb-6 text-n-3">{item.text}</p>
                <div className="flex items-center mt-auto">
                  <p className="ml-auto font-code text-xs font-bold text-n-1 uppercase tracking-wider">
                    <button
                      onClick={() => handleClick(item.id)}
                      href='/roadmap'
                      className="border pointer-events-auto border-white bg-white text-black px-4 py-2 rounded transition-colors duration-300"
                    >
                      View
                    </button>
                  </p>
                  <Arrow />
                </div>
              </div>

              {/* to display background light */}
              {item.light && <GradientLight />}

              {/* To display background image on hover over cards above */}
              <div
                className="absolute inset-0.5 bg-n-8"
                style={{ clipPath: "url(#benefits)" }}
              >
                {/* opacity is applied here */}
                <div className="absolute inset-0 opacity-0 transition-opacity hover:opacity-10">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      width={380}
                      height={362}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>

              <ClipPath />
            </div>
          ))}
        </div>

       
       
         
      
      </div>
    </Section>
    {selectedId && (
        <Section id="selected-content">
          {selectedId ==3&& showForm ? (
           <>
            <PricingList onSubmit={handleFormSubmit} />
            <>{formData}</>
            </>
          
          ) : (
            <Roadmap selectedId={selectedId} />
          )}
        </Section>
      )}
   
    </>
  );
};

export default Benefits;
