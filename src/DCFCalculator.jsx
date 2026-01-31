import React, { useState } from 'react';
import { Calculator, TrendingUp, DollarSign } from 'lucide-react';

/**
 * DCF Calculator Component for Hard Difficulty Questions
 * Allows students to build a discounted cash flow model
 */
const DCFCalculator = ({ companyData, onSubmit }) => {
  const [dcfInputs, setDcfInputs] = useState({
    year1_fcf: '',
    year2_fcf: '',
    year3_fcf: '',
    wacc: '8.0',
    terminal_growth: '3.0',
    shares_outstanding: ''
  });

  const [calculatedValues, setCalculatedValues] = useState(null);

  // Calculate historical FCF growth rate
  const getHistoricalGrowth = () => {
    // This would use historical data from previous filings
    // For demo purposes, showing estimated growth
    return 15.0; // 15% growth rate
  };

  const calculateDCF = () => {
    const { year1_fcf, year2_fcf, year3_fcf, wacc, terminal_growth, shares_outstanding } = dcfInputs;
    
    // Convert inputs to numbers
    const fcf1 = parseFloat(year1_fcf);
    const fcf2 = parseFloat(year2_fcf);
    const fcf3 = parseFloat(year3_fcf);
    const discountRate = parseFloat(wacc) / 100;
    const terminalRate = parseFloat(terminal_growth) / 100;
    const shares = parseFloat(shares_outstanding);

    // Calculate present value of projected cash flows
    const pv_fcf1 = fcf1 / Math.pow(1 + discountRate, 1);
    const pv_fcf2 = fcf2 / Math.pow(1 + discountRate, 2);
    const pv_fcf3 = fcf3 / Math.pow(1 + discountRate, 3);

    // Calculate terminal value
    const terminal_fcf = fcf3 * (1 + terminalRate);
    const terminal_value = terminal_fcf / (discountRate - terminalRate);
    const pv_terminal = terminal_value / Math.pow(1 + discountRate, 3);

    // Calculate enterprise value and equity value per share
    const enterprise_value = pv_fcf1 + pv_fcf2 + pv_fcf3 + pv_terminal;
    const value_per_share = enterprise_value / shares;

    setCalculatedValues({
      pv_fcf1: pv_fcf1.toFixed(2),
      pv_fcf2: pv_fcf2.toFixed(2),
      pv_fcf3: pv_fcf3.toFixed(2),
      terminal_value: terminal_value.toFixed(2),
      pv_terminal: pv_terminal.toFixed(2),
      enterprise_value: enterprise_value.toFixed(2),
      value_per_share: value_per_share.toFixed(2)
    });
  };

  const handleInputChange = (field, value) => {
    setDcfInputs(prev => ({ ...prev, [field]: value }));
    setCalculatedValues(null); // Reset calculations when inputs change
  };

  const handleSubmit = () => {
    if (!calculatedValues) {
      calculateDCF();
    } else {
      onSubmit(calculatedValues);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
          <Calculator className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">DCF Valuation Model</h3>
          <p className="text-gray-600">Build a 3-year discounted cash flow model</p>
        </div>
      </div>

      {/* Current FCF Reference */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border-2 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-900 font-medium mb-1">Current Free Cash Flow</p>
            <p className="text-3xl font-bold text-blue-700">
              ${(companyData.financials.freeCashFlow / 1000000).toFixed(0)}M
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-900 font-medium mb-1">Historical Growth Rate</p>
            <p className="text-2xl font-bold text-emerald-600">
              {getHistoricalGrowth()}%
            </p>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="space-y-6 mb-6">
        <div>
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Projected Free Cash Flows (in millions)
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year 1 FCF</label>
              <input
                type="number"
                step="0.01"
                value={dcfInputs.year1_fcf}
                onChange={(e) => handleInputChange('year1_fcf', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                placeholder="190"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year 2 FCF</label>
              <input
                type="number"
                step="0.01"
                value={dcfInputs.year2_fcf}
                onChange={(e) => handleInputChange('year2_fcf', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                placeholder="218"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year 3 FCF</label>
              <input
                type="number"
                step="0.01"
                value={dcfInputs.year3_fcf}
                onChange={(e) => handleInputChange('year3_fcf', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                placeholder="251"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WACC (%)
              <span className="text-xs text-gray-500 ml-1">Industry avg: 8%</span>
            </label>
            <input
              type="number"
              step="0.1"
              value={dcfInputs.wacc}
              onChange={(e) => handleInputChange('wacc', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Terminal Growth (%)
              <span className="text-xs text-gray-500 ml-1">Typically 2-3%</span>
            </label>
            <input
              type="number"
              step="0.1"
              value={dcfInputs.terminal_growth}
              onChange={(e) => handleInputChange('terminal_growth', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shares Outstanding (M)
            </label>
            <input
              type="number"
              step="0.01"
              value={dcfInputs.shares_outstanding}
              onChange={(e) => handleInputChange('shares_outstanding', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
              placeholder="500"
            />
          </div>
        </div>
      </div>

      {/* Calculation Results */}
      {calculatedValues && (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-6 border-2 border-gray-300">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Valuation Results
          </h4>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">PV of Year 1 FCF</p>
              <p className="text-xl font-bold text-gray-900">${calculatedValues.pv_fcf1}M</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">PV of Year 2 FCF</p>
              <p className="text-xl font-bold text-gray-900">${calculatedValues.pv_fcf2}M</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">PV of Year 3 FCF</p>
              <p className="text-xl font-bold text-gray-900">${calculatedValues.pv_fcf3}M</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">PV of Terminal Value</p>
              <p className="text-xl font-bold text-gray-900">${calculatedValues.pv_terminal}M</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg p-4 border-2 border-emerald-400">
              <p className="text-sm text-emerald-900 font-medium mb-1">Enterprise Value</p>
              <p className="text-2xl font-bold text-emerald-700">${calculatedValues.enterprise_value}M</p>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-4 border-2 border-blue-400">
              <p className="text-sm text-blue-900 font-medium mb-1">Fair Value per Share</p>
              <p className="text-2xl font-bold text-blue-700">${calculatedValues.value_per_share}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleSubmit}
        disabled={!dcfInputs.year1_fcf || !dcfInputs.year2_fcf || !dcfInputs.year3_fcf || !dcfInputs.shares_outstanding}
        className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 font-semibold text-lg shadow-lg"
      >
        {!calculatedValues ? 'Calculate Valuation' : 'Submit Answer'}
      </button>

      {/* Educational Note */}
      <div className="mt-6 bg-amber-50 rounded-xl p-4 border-l-4 border-amber-400">
        <p className="text-sm text-amber-900">
          <span className="font-semibold">💡 Learning Note:</span> DCF valuation is highly sensitive to 
          assumptions about growth rates and discount rates. Small changes in WACC or terminal growth 
          can significantly impact the final valuation. Always perform sensitivity analysis!
        </p>
      </div>
    </div>
  );
};

export default DCFCalculator;