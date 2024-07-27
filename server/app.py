from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the data
carbon_data_path = 'carbon.csv'
hydrogen_data_path = 'hydrogen.csv'
carbon_df = pd.read_csv(carbon_data_path)
hydrogen_df = pd.read_csv(hydrogen_data_path)

# Constants
CO2_PRODUCTION = 5e6  # 1.2 million tonnes per annum
INSTALLED_CAPACITY = 1000  # Installed capacity in kW
OPERATING_HOURS_PER_YEAR = 5000  # Operating hours per year

# Calculation functions
def calculate_decommissioning_cost(export_pipeline_cost=0, export_riser_cost=0, production_wells=None, 
                                   jacket_cost=0, jacket_units=0, topside_modules=None, misc_costs=0,
                                   reinjection_well_count=0, reinjection_well_cost_per_well=0):
    if production_wells is None:
        production_wells = []
    if topside_modules is None:
        topside_modules = []

    total_well_costs = 0
    pipeline_length = 0
    
    for well in production_wells:
        well_cost = int(well.get('decommissioningCost', 0))
        pipeline_length += int(well.get('pipelineLength', 0)) if well.get('pipeline') else 0
        pipeline_cost = int(well.get('pipelineCost', 0)) * int(well.get('pipelineLength', 0)) if well.get('pipeline') else 0
        riser_cost = int(well.get('riserCost', 0)) * int(well.get('riserLength', 0)) if well.get('pipeline') else 0
        total_well_costs += well_cost + pipeline_cost + riser_cost

    total_jacket_costs = int(jacket_cost) * int(jacket_units)
    total_topside_costs = sum(int(module['cost']) for module in topside_modules)
    reinjection_well_cost_total = int(reinjection_well_count) * int(reinjection_well_cost_per_well)

    total_cost = (int(export_pipeline_cost) + int(export_riser_cost) + total_well_costs + 
                  total_jacket_costs + total_topside_costs + int(misc_costs) + 
                  reinjection_well_cost_total)
    return total_cost, pipeline_length

# def calculate_net_ccs_cost(data, year_start, year_end, pipeline_length, production_wells):
#     total_net_cost = 0
#     total_sequestration_capacity = sum(int(well.get('maxSequestrationRate', 0)) for well in production_wells)
    
#     for year in range(year_start, year_end + 1):
#         yearx = year - year % 5
#         row = data[(data['Type'] == 'Offshore') & (data['Year'] == yearx)]
#         if not row.empty:
#             row = row.iloc[0]
#             revenue = float(row.get('Sale_price', 1))
#             capture_cost = float(row.get('Cost_capture', 1))
#             transport_cost = float(row.get('Cost_transport', 1)) * pipeline_length
#             storage_cost = float(row.get('Cost_storage', 1))
#             total_cost = capture_cost + transport_cost + storage_cost
#             net_cost = total_cost - revenue
#             total_net_cost += net_cost * total_sequestration_capacity
#     return total_net_cost
def calculate_net_ccs_cost(data, year_start, year_end, pipeline_length, production_wells):
    total_net_cost = 0
    total_sequestration_capacity = sum(2 for well in production_wells)
    
    for year in range(year_start, year_end + 1):
        yearx = year - year % 5
        row = data[(data['Type'] == 'Offshore') & (data['Year'] == yearx)]
        if not row.empty:
            row = row.iloc[0]
            revenue =float( row.get('Sale_price', 1))
            capture_cost = float(row.get('Cost_capture', 1))
            transport_cost = float(row.get('Cost_transport', 1) * pipeline_length)
            storage_cost = float(row.get('Cost_storage', 1))
            total_cost = capture_cost + transport_cost + storage_cost
            net_cost = total_cost - revenue
            total_net_cost += net_cost * total_sequestration_capacity
    print("CCS Total Net Cost:", total_net_cost)
    return total_net_cost

def calculate_net_hydrogen_cost(data, year_start, year_end, pipeline_length):
    total_net_cost = 0
    for year in range(year_start, year_end + 1, 5):
        yearx = year - year % 5
        for tech in ['Alkaline', 'PEM']:
            row = data[(data['Type'] == tech) & (data['Year'] == yearx)]
            if not row.empty:
                row = row.iloc[0]
                sell_price = float(row.get('Sell Price / kg', 0))
                production_cost = float(row.get('Cost of Production /kg ($) (Operational)', 0))
                transport_cost_per_100km = float(row.get('Cost of Transport /kg/100km', 0))
                capital_cost_per_kw = float(row.get('Cost for Installation /kW ($) (Capital Cost)', 0))
                efficiency = float(row.get('Efficiency (kWh/kgH2)', 1))
                
                transport_cost = transport_cost_per_100km * pipeline_length / 100
                total_cost = production_cost + transport_cost
                net_cost = total_cost - sell_price
                total_net_cost += net_cost * INSTALLED_CAPACITY * OPERATING_HOURS_PER_YEAR / efficiency
    return total_net_cost

def compare_options(
    export_pipeline_cost, export_riser_cost,
    production_wells, jacket_cost, jacket_units, topside_modules, misc_costs,
    ccs_data, hydrogen_data, plant_lifetime_start, plant_lifetime_end, co2_production,
    reinjection_well_count, reinjection_well_cost_per_well
):
    # Calculate decommissioning cost and pipeline length
    decommissioning_cost, pipeline_length = calculate_decommissioning_cost(
        export_pipeline_cost, export_riser_cost, production_wells,
        jacket_cost, jacket_units, topside_modules, misc_costs,
        reinjection_well_count, reinjection_well_cost_per_well
    )
    
    # Calculate net costs
    total_net_ccs_cost = calculate_net_ccs_cost(ccs_data, plant_lifetime_start, plant_lifetime_end, pipeline_length, production_wells)
    total_net_hydrogen_cost = calculate_net_hydrogen_cost(hydrogen_data, plant_lifetime_start, plant_lifetime_end, pipeline_length)

    # Decision
    if decommissioning_cost < total_net_ccs_cost and decommissioning_cost < total_net_hydrogen_cost:
        return (f"Decommissioning is preferred with a cost of ${decommissioning_cost:,.2f}, "
                f"as it is lower than the net costs of CCS (${total_net_ccs_cost:,.2f}) and Hydrogen (${total_net_hydrogen_cost:,.2f}).")

    if total_net_ccs_cost < total_net_hydrogen_cost:
        return (f"CCS is preferred with a net cost of ${total_net_ccs_cost:,.2f}. "
                f"Consider onshore CCS for lower capture costs over time. The net cost analysis shows that CCS is more cost-effective "
                f"compared to Hydrogen production.")
    else:
        return (f"Hydrogen is preferred with a net cost of ${total_net_hydrogen_cost:,.2f}. "
                f"Consider Alkaline Hydrogen for better profitability and efficiency. Hydrogen production via Alkaline technology offers "
                f"a more favorable balance of production and transport costs, yielding lower net costs compared to PEM technology.")

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.json
    print(data)
    export_pipeline_cost = int(data.get('exportPipelineCost', 0))
    export_riser_cost = int(data.get('exportRiserCost', 0))
    production_wells = data.get('wells', [])
    jacket_cost = int(data.get('jacketCost', 0))
    jacket_units = int(data.get('jacketQuantity', 0))
    topside_modules = data.get('topSideModules', [])
    misc_costs = int(data.get('miscellaneous', 0))
    reinjection_well_count = int(data.get('reinjectionWellCount', 0))
    reinjection_well_cost_per_well = int(data.get('reinjectionWellCost', 0))
    pipeline_length = int(data.get('pipelineLength', 0))
    plant_lifetime_start = int(data.get('plantLifeStart', 0))
    overall_end_year = int(data.get('overallEndYear', 0))


    total_cost, pipeline_length = calculate_decommissioning_cost(
        export_pipeline_cost, export_riser_cost, production_wells,
        jacket_cost, jacket_units, topside_modules, misc_costs,
        reinjection_well_count, reinjection_well_cost_per_well
    )

    net_ccs_cost = calculate_net_ccs_cost(carbon_df, plant_lifetime_start, overall_end_year, pipeline_length, production_wells)
    net_hydrogen_cost = calculate_net_hydrogen_cost(hydrogen_df, plant_lifetime_start, overall_end_year, pipeline_length)

    decision = compare_options(
        export_pipeline_cost, export_riser_cost,
        production_wells, jacket_cost, jacket_units, topside_modules, misc_costs,
        carbon_df, hydrogen_df, plant_lifetime_start, overall_end_year, CO2_PRODUCTION,
        reinjection_well_count, reinjection_well_cost_per_well
    )

    return jsonify({
        'totalDecommissioningCost': total_cost,
        'netCCSCost': net_ccs_cost,
        'netHydrogenCost': net_hydrogen_cost,
        'decision': decision
    })

if __name__ == '__main__':
    app.run(debug=True)
