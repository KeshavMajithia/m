import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Package, MapPin, Truck, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { getRatesForCountry } from '../utils/rateService';

function RateFinder() {
  const [country, setCountry] = useState('');
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!country.trim() || !weight || parseFloat(weight) <= 0) {
      setError('Please enter a valid country and weight');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const data = await getRatesForCountry(country.trim(), parseFloat(weight));
      setResults(data);
    } catch (err) {
      console.error('Error fetching rates:', err);
      setError(err.message || 'Failed to fetch rates. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const renderResults = () => {
    if (!results) return null;

    return (
      <div className="mt-8 animate-fade-in">
        <div className="card-modern">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
            <Package className="w-6 h-6 mr-3 text-primary" />
            Shipping Rates for {results.country} ({results.weight} kg)
          </h2>

          {/* Zone Information */}
          {results.zone_mappings && Object.keys(results.zone_mappings).length > 0 && (
            <div className="mb-8 p-6 bg-blue-50/50 rounded-xl border border-blue-100">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-foreground">
                <MapPin className="w-5 h-5 mr-2 text-primary" />
                Zone Mappings
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {results.zone_mappings.fedex_zone && (
                  <div className="flex items-center p-3 bg-white rounded-lg border">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <Truck className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">FedEx Zone</div>
                      <div className="text-sm text-muted-foreground">{results.zone_mappings.fedex_zone}</div>
                    </div>
                  </div>
                )}
                {results.zone_mappings.dhl_zone && (
                  <div className="flex items-center p-3 bg-white rounded-lg border">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                      <Truck className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">DHL Zone</div>
                      <div className="text-sm text-muted-foreground">{results.zone_mappings.dhl_zone}</div>
                    </div>
                  </div>
                )}
                {results.zone_mappings.ups_zone && (
                  <div className="flex items-center p-3 bg-white rounded-lg border">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                      <Truck className="w-5 h-5 text-yellow-700" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">UPS Zone</div>
                      <div className="text-sm text-muted-foreground">{results.zone_mappings.ups_zone}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Available Rates */}
          <h3 className="text-xl font-semibold mb-6 flex items-center text-foreground">
            <DollarSign className="w-6 h-6 mr-2 text-success" />
            Available Rates
          </h3>

          {results.results && results.results.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.results.map((rate, index) => (
                <div key={index} className="card-gradient border border-border hover:border-primary/50 transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-foreground">{rate.carrier}</h4>
                      <p className="text-sm text-muted-foreground flex items-center mt-1">
                        <Clock className="w-4 h-4 mr-1" />
                        {rate.service_type}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Truck className="w-6 h-6 text-primary" />
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-3xl font-bold text-success mb-1">
                      {rate.rate}
                    </div>
                    {rate.zone && (
                      <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Zone: {rate.zone}
                      </div>
                    )}
                  </div>

                  <button
                    className="btn-success w-full flex items-center justify-center"
                    onClick={() => {
                      const cleanRate = String(rate.rawPrice || rate.rate.replace(/[^0-9.]/g, ''));
                      navigate(`/data-entry?country=${encodeURIComponent(results.country)}&weight=${results.weight}&carrier=${encodeURIComponent(rate.carrier)}&rate=${cleanRate}&service=${encodeURIComponent(rate.service_type)}`);
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Book This Rate
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-muted/50 rounded-xl border border-border">
              <h4 className="font-semibold mb-3 text-foreground flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-warning" />
                No Rates Found
              </h4>
              <p className="text-sm text-muted-foreground">
                No rates available for {results.country} at {results.weight}kg. Please try a different country or weight.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="header-gradient px-6 py-12 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center">
            <Search className="w-10 h-10 mr-4" />
            Rate Finder
          </h1>
          <p className="text-xl opacity-90 mb-6">Find the best shipping rates for your international deliveries</p>
          <Link to="/" className="nav-link bg-white/20 text-white hover:bg-white/30">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Search Form */}
        <div className="card-modern max-w-2xl mx-auto mb-8 animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="country" className="form-label flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-primary" />
                  Destination Country
                </label>
                <input
                  type="text"
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g., United States, Germany, Japan"
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label htmlFor="weight" className="form-label flex items-center">
                  <Package className="w-4 h-4 mr-2 text-primary" />
                  Package Weight (kg)
                </label>
                <input
                  type="number"
                  id="weight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g., 2.5"
                  min="0.5"
                  step="0.5"
                  className="form-input"
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Find Rates
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Loading Message */}
        {loading && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg text-center animate-fade-in">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-blue-800 font-medium">Analyzing rates from multiple carriers...</p>
            </div>
          </div>
        )}

        {/* Results */}
        {renderResults()}
      </main>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm border-t border-border py-8 text-center">

      </footer>
    </div>
  );
}

export default RateFinder;