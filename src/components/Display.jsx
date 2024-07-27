

              

              
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import Heading from './Heading'; // Import the Heading component

const PricingList = ({onSubmit}) => {
  const [co2Production, setCo2Production] = useState('');
  const [plantLifeStart, setPlantLifeStart] = useState('');
  const [requiresReinjectionWell, setRequiresReinjectionWell] = useState(false);
  const [reinjectionWellCount, setReinjectionWellCount] = useState('');
  const [reinjectionWellCost, setReinjectionWellCost] = useState('');
  const [wells, setWells] = useState([]);
  const [overallEndYear, setOverallEndYear] = useState('');
  const [jacketCost, setJacketCost] = useState('');
  const [jacketQuantity, setJacketQuantity] = useState('');
  const [topSideModules, setTopSideModules] = useState([]);
  const [miscellaneous, setMiscellaneous] = useState('');

  const handleWellChange = (id, event) => {
    const { name, value, type, checked } = event.target;
    setWells((prevWells) =>
      prevWells.map((well) =>
        well.id === id ? { ...well, [name]: type === 'checkbox' ? checked : value } : well
      )
    );
  };

  const handleAddWell = () => {
    setWells([...wells, { id: wells.length + 1, decommissioningCost: '', pipeline: false, pipelineLength: '', pipelineCost: '', riserLength: '', riserCost: '', endYear: '' }]);
  };

  const handleRemoveWell = (id) => {
    setWells(wells.filter((well) => well.id !== id));
  };

  const handleTopSideModuleChange = (id, event) => {
    const { name, value } = event.target;
    setTopSideModules((prevModules) =>
      prevModules.map((module) =>
        module.id === id ? { ...module, [name]: value } : module
      )
    );
  };

  const handleAddTopSideModule = () => {
    setTopSideModules([...topSideModules, { id: topSideModules.length + 1, cost: '' }]);
  };

  const handleRemoveTopSideModule = (id) => {
    setTopSideModules(topSideModules.filter((module) => module.id !== id));
  };

 
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    const formData = {
      wells,
      overallEndYear,
      jacketCost,
      jacketQuantity,
      topSideModules,
      miscellaneous,
      co2Production,
      plantLifeStart,
      requiresReinjectionWell,
      reinjectionWellCount,
      reinjectionWellCost,
    };
    onSubmit(formData);
  };
  return (
    <form onSubmit={handleSubmit} className="p-5 bg-gradient-to-r border-zinc-50 rounded-lg shadow-lg space-y-5 max-w-lg mx-auto">
      <Heading title='Creation Form'/>

      <div className="bg-n-8 border border-n-6 rounded-lg p-4 mb-4 shadow-md">
        <h3 className="text-xl font-semibold mb-3 text-color-5">General Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-white mb-2">CO2 Production (metric tons/year):</label>
            <input
              type="number"
              value={co2Production}
              onChange={(e) => setCo2Production(e.target.value)}
              className="p-2 border-0 border-gray-300 rounded w-full"
            />
          </div>
          <div>
            <label className="block text-white mb-2">Plant Life Start Year:</label>
            <input
              type="number"
              value={plantLifeStart}
              onChange={(e) => setPlantLifeStart(e.target.value)}
              className="p-2 border-0 border-gray-300 rounded w-full"
            />
          </div>
          <div>
            <label className="block text-white mb-2">
              <input
                type="checkbox"
                checked={requiresReinjectionWell}
                onChange={(e) => setRequiresReinjectionWell(e.target.checked)}
                className="mr-2"
              />
              Requires Reinjection Well
            </label>
          </div>
          {requiresReinjectionWell && (
            <>
              <div>
                <label className="block text-white mb-2">Reinjection Well Count:</label>
                <input
                  type="number"
                  value={reinjectionWellCount}
                  onChange={(e) => setReinjectionWellCount(e.target.value)}
                  className="p-2 border-0 border-gray-300 rounded w-full"
                />
              </div>
              <div>
                <label className="block text-white mb-2">Cost per Reinjection Well ($):</label>
                <input
                  type="number"
                  value={reinjectionWellCost}
                  onChange={(e) => setReinjectionWellCost(e.target.value)}
                  className="p-2 border-0 border-gray-300 rounded w-full"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {wells.map((well) => (
        <div key={well.id} className="bg-n-8 border border-n-6 rounded-lg p-4 mb-4 shadow-md">
          <h3 className="text-xl font-semibold mb-3 text-color-5">Well {well.id}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-white mb-2">Decommissioning Cost ($):</label>
              <input
                type="number"
                name="decommissioningCost"
                value={well.decommissioningCost}
                onChange={(e) => handleWellChange(well.id, e)}
                className="p-2 border-0 border-gray-300 rounded w-full"
              />
            </div>
            <div>
              <label className="block text-white mb-2">Pipeline:</label>
              <input
                type="checkbox"
                name="pipeline"
                checked={well.pipeline}
                onChange={(e) => handleWellChange(well.id, e)}
                className="p-2 border-0 border-gray-300 rounded"
              />
            </div>
            {well.pipeline && (
              <>
                <div className="bg-n-8 border border-n-6 rounded-lg p-4 mb-4 shadow-md">
                  <h4 className="text-lg font-semibold mb-2 text-color-5">Pipeline</h4>
                  <div>
                    <label className="block text-white mb-2">Length (km):</label>
                    <input
                      type="number"
                      name="pipelineLength"
                      value={well.pipelineLength}
                      onChange={(e) => handleWellChange(well.id, e)}
                      className="p-2 border-0 border-gray-300 rounded w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2">Decommissioning Cost per km ($):</label>
                    <input
                      type="number"
                      name="pipelineCost"
                      value={well.pipelineCost}
                      onChange={(e) => handleWellChange(well.id, e)}
                      className="p-2 border-0 border-gray-300 rounded w-full"
                    />
                  </div>
                </div>
                <div className="bg-n-8 border border-n-6 rounded-lg p-4 mb-4 shadow-md">
                  <h4 className="text-lg font-semibold mb-2 text-color-5">Riser</h4>
                  <div>
                    <label className="block text-white mb-2">Length (m):</label>
                    <input
                      type="number"
                      name="riserLength"
                      value={well.riserLength}
                      onChange={(e) => handleWellChange(well.id, e)}
                      className="p-2 border-0 border-gray-300 rounded w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2">Cost ($):</label>
                    <input
                      type="number"
                      name="riserCost"
                      value={well.riserCost}
                      onChange={(e) => handleWellChange(well.id, e)}
                      className="p-2 border-0 border-gray-300 rounded w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2">End Year:</label>
                    <input
                      type="number"
                      name="endYear"
                      value={well.endYear}
                      onChange={(e) => handleWellChange(well.id, e)}
                      className="p-2 border-0 border-gray-300 rounded w-full"
                    />
                  </div>
                </div>
              </>
            )}
            <button
              type="button"
              onClick={() => handleRemoveWell(well.id)}
              className="p-2 text-white bg-red-400 rounded shadow-md hover:bg-red-600"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddWell}
        className="p-2 mb-4 text-white bg-blue-500 rounded shadow-md hover:bg-blue-600"
      >
        <FontAwesomeIcon icon={faPlus} /> Add Well
      </button>

      <div className="bg-n-8 border border-n-6 rounded-lg p-4 mb-4 shadow-md">
        <h3 className="text-xl font-semibold mb-3 text-color-5">Overall End Year</h3>
        <div>
          <label className="block text-white mb-2">Optional End Year:</label>
          <input
            type="number"
            value={overallEndYear}
            onChange={(e) => setOverallEndYear(e.target.value)}
            className="p-2 border-0 border-gray-300 rounded w-full"
          />
        </div>
      </div>

      <div className="bg-n-8 border border-n-6 rounded-lg p-4 mb-4 shadow-md">
        <h3 className="text-xl font-semibold mb-3 text-color-1">Jacket</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-white mb-2">Cost ($):</label>
            <input
              type="number"
              value={jacketCost}
              onChange={(e) => setJacketCost(e.target.value)}
              className="p-2 border-0 border-gray-300 rounded w-full"
            />
          </div>
          <div>
            <label className="block text-white mb-2">Quantity:</label>
            <input
              type="number"
              value={jacketQuantity}
              onChange={(e) => setJacketQuantity(e.target.value)}
              className="p-2 border-0 border-gray-300 rounded w-full"
            />
          </div>
        </div>
      </div>

      {topSideModules.map((module) => (
        <div key={module.id} className="bg-n-8 border border-n-6 rounded-lg p-4 mb-4 shadow-md">
          <h3 className="text-xl font-semibold mb-3 text-color-1">Top Side Module {module.id}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-white mb-2">Cost ($):</label>
              <input
                type="number"
                name="cost"
                value={module.cost}
                onChange={(e) => handleTopSideModuleChange(module.id, e)}
                className="p-2 border-0 border-gray-300 rounded w-full"
              />
            </div>
            <button
              type="button"
              onClick={() => handleRemoveTopSideModule(module.id)}
              className="p-2 text-white bg-red-400 rounded shadow-md hover:bg-red-600"
            >
              <FontAwesomeIcon icon={faTrash} /> 
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddTopSideModule}
        className="p-2 mb-4 text-white bg-color-1 rounded shadow-md hover:bg-blue-600"
      >
        <FontAwesomeIcon icon={faPlus} /> Add Top Side Module
      </button>

      <div className="bg-n-8 border border-n-6 rounded-lg p-4 mb-4 shadow-md">
        <h3 className="text-xl font-semibold mb-3 text-color-1">Miscellaneous</h3>
        <div>
          <label className="block text-white mb-2">Value ($):</label>
          <input
            type="number"
            value={miscellaneous}
            onChange={(e) => setMiscellaneous(e.target.value)}
            className="p-2 border-0 border-gray-400 rounded w-full"
          />
        </div>
      </div>

      <button type="submit" className="p-2 mb-4 text-white border-color-1 border-2  bg-white-400 rounded shadow-md hover:bg-color-1">
        Submit
      </button>
    </form>
  );
};

export default PricingList;
