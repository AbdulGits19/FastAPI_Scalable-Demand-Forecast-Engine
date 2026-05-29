import pandas as pd

def calculate_inventory_stockout_risks(historical_data_json: list, current_stock_map: dict):
    """
    Phase 3 Business Logic: Analyzes historical quantities sold to compute daily burn rates,
    predicting how many days of runway are left before a stockout occurs.
    """
    if not historical_data_json:
        return []

    df = pd.DataFrame(historical_data_json)
    df['quantity'] = pd.to_numeric(df['quantity'], errors='coerce').fillna(0)
    
    # Calculate the average consumption rate per product per day
    velocity_df = df.groupby('product_name').agg(
        total_units=('quantity', 'sum'),
        active_days=('sale_date', 'nunique')
    ).reset_index()

    # Daily Burn Rate = Total Volume / Distinct Days active
    velocity_df['daily_burn_rate'] = velocity_df['total_units'] / velocity_df['active_days'].replace(0, 1)
    
    risks_payload = []
    for _, row in velocity_df.iterrows():
        p_name = row['product_name']
        burn_rate = round(float(row['daily_burn_rate']), 2)
        
        # Pull current quantity from our operational stock map
        stock_available = current_stock_map.get(p_name, 500) 
        
        # Runway days = Available Stock / Daily Burn Rate
        days_remaining = int(stock_available // burn_rate) if burn_rate > 0 else 999
        
        # Assign risk category flags based on structural runway windows
        if days_remaining <= 3:
            risk_status = "CRITICAL SHORTAGE"
        elif days_remaining <= 7:
            risk_status = "MODERATE RISK"
        else:
            risk_status = "SAFE STABLE"

        risks_payload.append({
            "product_name": p_name,
            "average_daily_demand": burn_rate,
            "estimated_current_stock": stock_available,
            "predicted_days_runway": days_remaining,
            "risk_classification": risk_status
        })

    # Sort so that the most urgent stockout risks bubble to the top of the list
    return sorted(risks_payload, key=lambda x: x['predicted_days_runway'])