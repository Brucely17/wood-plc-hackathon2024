import pandas as pd

# Load the data
carbon_data_path = 'carbon.csv'
hydrogen_data_path = 'hydrogen.csv'
carbon_df = pd.read_csv(carbon_data_path)
hydrogen_df = pd.read_csv(hydrogen_data_path)

# Define constants
CO2_PRODUCTION = 1.2e6  # 1.2 million tonnes per annum
PLANT_LIFETIME_START = 2034
PLANT_LIFETIME_END = 2055

# Decommissioning costs
export_pipeline_cost = 275000 * 20  # Cost for 400 km pipeline
export_riser_cost = 11500 * 15  # Cost for 80 m riser

# Production wells
production_wells = [{
    'well_cost': 6900000,
    'well_cost_unit': 1,
    'pipeline_cost': 210000,
    'pipeline_length': 2,
    'riser_cost': 10500,
    'riser_length': 15,
    'requires_pipeline': True,
    'max_sequestration_rate': 2e6  # Maximum sequestration rate per well in tonnes per annum
},
{
    'well_cost': 4400000,
    'well_cost_unit': 1,
    'pipeline_cost': 230000,
    'pipeline_length': 1,
    'riser_cost': 11500,
    'riser_length': 15,
    'requires_pipeline': True,
    'max_sequestration_rate': 2e6  # Maximum sequestration rate per well in tonnes per annum
}]

jacket_cost = 15750000  # Cost for 2 jackets
jacket_units = 1  # Number of jackets
topside_modules = [
    {'module_cost': 1575000, 'unit_count': 1},
    {'module_cost': 2750000, 'unit_count': 1},
    {'module_cost': 2100000, 'unit_count': 1},
    {'module_cost': 3069000, 'unit_count': 1},
    {'module_cost': 575000, 'unit_count': 1},
]
misc_costs = 0  # Miscellaneous costs

# Define additional constants
requires_reinjection = True  # Whether reinjection wells are required
reinjection_well_count = 10  # Number of reinjection wells
reinjection_well_cost_per_well = 3000000  # Cost per reinjection well

# Define functions
def calculate_decommissioning_cost(
    export_pipeline_cost, export_riser_cost,
    production_wells, jacket_cost, jacket_units, topside_modules, misc_costs,
    reinjection_well_count, reinjection_well_cost_per_well
):
    total_well_costs = 0
    pipeline_length = 0
    
    for well in production_wells:
        well_cost = well['well_cost'] * well['well_cost_unit']
        pipeline_length += well['pipeline_length'] if well['requires_pipeline'] else 0
        pipeline_cost = well['pipeline_cost'] * well['pipeline_length'] if well['requires_pipeline'] else 0
        riser_cost = well['riser_cost'] * well['riser_length'] if well['requires_pipeline'] else 0
        total_well_costs += well_cost + pipeline_cost + riser_cost

    total_jacket_costs = jacket_cost * jacket_units
    total_topside_costs = sum(module['module_cost'] * module['unit_count'] for module in topside_modules)

    reinjection_well_cost_total = reinjection_well_count * reinjection_well_cost_per_well if requires_reinjection else 0

    total_cost = (export_pipeline_cost + export_riser_cost + total_well_costs + 
                  total_jacket_costs + total_topside_costs + misc_costs + 
                  reinjection_well_cost_total)
    print("Decommissioning Cost:", total_cost)
    return total_cost, pipeline_length

def calculate_net_ccs_cost(data, year_start, year_end, pipeline_length, production_wells):
    total_net_cost = 0
    total_sequestration_capacity = sum(well['max_sequestration_rate'] for well in production_wells)
    
    for year in range(year_start, year_end + 1):
        yearx = year - year % 5
        row = data[(data['Type'] == 'Offshore') & (data['Year'] == yearx)]
        if not row.empty:
            row = row.iloc[0]
            revenue = row.get('Sale_price', 1)
            capture_cost = row.get('Cost_capture', 1)
            transport_cost = row.get('Cost_transport', 1) * pipeline_length
            storage_cost = row.get('Cost_storage', 1)
            total_cost = capture_cost + transport_cost + storage_cost
            net_cost = total_cost - revenue
            total_net_cost += net_cost * total_sequestration_capacity
    print("CCS Total Net Cost:", total_net_cost)
    return total_net_cost

def calculate_net_hydrogen_cost(data, year_start, year_end, pipeline_length, installed_capacity=1000, operating_hours_per_year=2080):
    total_net_cost = 0
    for year in range(year_start, year_end + 1, 5):
        yearx=year-year%5
        for tech in ['Alkaline', 'PEM']:
            row = data[(data['Type'] == tech) & (data['Year'] == yearx)]
            if not row.empty:
                row = row.iloc[0]
                sell_price = row.get('Sell Price / kg', 0)
                production_cost = row.get('Cost of Production /kg ($) (Operational)', 0)
                transport_cost_per_100km = row.get('Cost of Transport /kg/100km', 0)
                capital_cost_per_kw = row.get('Cost for Installation /kW ($) (Capital Cost)', 0)
                efficiency = row.get('Efficiency (kWh/kgH2)', 1)
                
                # Calculate transport cost based on pipeline length
                transport_cost = transport_cost_per_100km * (pipeline_length / 100)
                
                # Calculate annual hydrogen production
                annual_hydrogen_production = installed_capacity * operating_hours_per_year / efficiency
                
                # Capital cost should be considered for the initial year only
                capital_cost = capital_cost_per_kw * installed_capacity if year == year_start else 0

                # Calculate total cost per kg of hydrogen
                total_cost = production_cost + transport_cost + capital_cost / annual_hydrogen_production

                # Calculate net cost
                net_cost_per_kg = total_cost - sell_price
                total_net_cost += net_cost_per_kg * annual_hydrogen_production
    print("h2",total_net_cost)
    return total_net_cost

def compare_options(
    export_pipeline_cost, export_riser_cost,
    production_wells, jacket_cost, jacket_units, topside_modules, misc_costs,
    ccs_data, hydrogen_data, plant_lifetime_start, plant_lifetime_end, co2_production,
    reinjection_well_count, reinjection_well_cost_per_well
):
    # Calculate decommissioning cost and pipeline length
    decommissioning_cost, pipeline_length = calculate_decommissioning_cost(
        export_pipeline_cost, export_riser_cost,
        production_wells, jacket_cost, jacket_units, topside_modules, misc_costs,
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

# Compare options and provide insights
result = compare_options(
    export_pipeline_cost, export_riser_cost,
    production_wells, jacket_cost, jacket_units, topside_modules, misc_costs,
    carbon_df, hydrogen_df, PLANT_LIFETIME_START, PLANT_LIFETIME_END, CO2_PRODUCTION,
    reinjection_well_count, reinjection_well_cost_per_well
)

def final():
    return result

