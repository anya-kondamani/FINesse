export type Financials = {
  revenue: number
  net_income: number
  total_assets: number
  total_liabilities: number
  current_assets: number
  current_liabilities: number
  operating_cash_flow: number
  capital_expenditures: number
  free_cash_flow: number
}

export type FinancialData = {
  company_id: string
  company_name: string
  ticker: string
  fiscal_year: string
  financials: Financials
  industry_context: string
  risk_factors: string[]
  business_description: string
  index_created: boolean
}