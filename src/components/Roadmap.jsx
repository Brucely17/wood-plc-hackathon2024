import React, { useState } from 'react';
import Heading from "./Heading";
import Section from "./Section";
import PricingList from './Display';

const Roadmap = ({ selectedId }) => {
  const [formData, setFormData] = useState(null);
  const [backendResponse, setBackendResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const handleFormSubmit = async (data) => {
    setFormData(data);
    setIsLoading(true);
    setError(null);
  
    try {
      const response = await fetch('http://127.0.0.1:5000/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const result = await response.json();
      if (result && typeof result === 'object') {
        setBackendResponse(result);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while processing your request.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // const handleFormSubmit = async (data) => {
  //   console.log(data)
  //   setFormData(data);
  //   setIsLoading(true);
  //   setError(null);

  //   try {
  //     const response = await fetch('http://127.0.0.1:5000/calculate', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(data),
  //     });

  //     if (!response.ok) {
  //       throw new Error('Network response was not ok');
  //     }

  //     const result = await response.json();
  //     console.log(result);
  //     setBackendResponse(result);
  //   } catch (error) {
  //     console.error('Error:', error);
  //     setError('An error occurred while processing your request.');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const renderSection = (title, content) => (
    <div className="bg-gray-800 text-white shadow-lg rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <p className="text-lg leading-relaxed">{content}</p>
    </div>
  );

  const getContentForId = (id) => {
    switch (id) {
      case '0':
        return {
          title: 'Option 1: Detailed Analysis',
          decommissioning: '$43,771,500',
          ccs: '$112,000,000',
          alkaline: '$39,524,689.66',
          pem: '$39,668,629.63',
          conclusion: 'Hydrogen (Alkaline technology) is preferred with a net cost of $39,524,689.66. Consider Alkaline Hydrogen for better profitability and efficiency. Hydrogen production via Alkaline technology offers a more favorable balance of production and transport costs, yielding lower net costs compared to the alternative technology.',
        };
      case '1':
        return {
          title: 'Option 2: Detailed Analysis',
          decommissioning: '$363,030,000',
          ccs: '$40,000,000',
          alkaline: '$28,934,344.83',
          pem: '$29,043,037.04',
          conclusion: 'Hydrogen (Alkaline technology) is preferred with a net cost of $28,934,344.83. Consider Alkaline Hydrogen for better profitability and efficiency. Hydrogen production via Alkaline technology offers a more favorable balance of production and transport costs, yielding lower net costs compared to the alternative technology.',
        };
      case '2':
        return {
          title: 'Option 3: Detailed Analysis',
          decommissioning: '$51,299,500',
          ccs: '$186,000,000',
          alkaline: '$103,386,022.16',
          pem: '$103,910,111.11',
          conclusion: 'Decommissioning is preferred with a cost of $51,299,500.00, as it is lower than the net costs of CCS ($186,000,000.00) and Hydrogen ($103,386,022.16).',
        };
        case '3':
          return {
            title: 'Option 3: Detailed Analysis',
            decommissioning: backendResponse ? backendResponse.totalDecommissioningCost : 'N/A',
            ccs: backendResponse ? backendResponse.netCCSCost : 'N/A',
            alkaline: backendResponse ? backendResponse.netHydrogenCost : 'N/A',
            pem: backendResponse ? backendResponse.netHydrogenCost : 'N/A',
            conclusion: backendResponse ? backendResponse.decision : 'No decision available',
          };
      
    }
  };


const { title, decommissioning, ccs, alkaline, pem, conclusion } = getContentForId(selectedId) || {};

if (selectedId === '3') {
  return (
    <Section className="overflow-hidden" id="roadmap">
      <PricingList onSubmit={handleFormSubmit} />
      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {backendResponse ? (
        <div className="container flex flex-wrap gap-2 w-1/2">
        <Heading className=" text-color-1 md:max-w-md lg:max-w-2xl" title='Analysis and Suggestion ' />
        {decommissioning && renderSection(<p className="text-color-1">Decommissioning Cost</p>, decommissioning)}
        {/* {ccs && renderSection(<p className="text-color-1">CCS Total Net Cost</p>, ccs)} */}
        {alkaline && renderSection(<p className="text-color-1">Total Net Cost for Alkaline</p>, alkaline)}
        {pem && renderSection(<p className="text-color-1">Total Net Cost for PEM</p>, pem)}
        {conclusion && renderSection(<p className="text-color-1">Conclusion</p>, conclusion)}
      </div>
      ) : null}
    </Section>
  );
} else if (selectedId !== null) {
  return (
    <Section className="overflow-hidden" id="roadmap">
      <div className="container flex flex-wrap gap-2 w-1/2">
        <Heading className=" text-color-1 md:max-w-md lg:max-w-2xl" title='Analysis and Suggestion ' />
        {decommissioning && renderSection(<p className="text-color-1">Decommissioning Cost</p>, decommissioning)}
        {ccs && renderSection(<p className="text-color-1">CCS Total Net Cost</p>, ccs)}
        {alkaline && renderSection(<p className="text-color-1">Total Net Cost for Alkaline</p>, alkaline)}
        {pem && renderSection(<p className="text-color-1">Total Net Cost for PEM</p>, pem)}
        {conclusion && renderSection(<p className="text-color-1">Conclusion</p>, conclusion)}
      </div>
    </Section>
  );
}

return null;
}
export default Roadmap;
