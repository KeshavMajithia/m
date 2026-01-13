import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, User, Phone, CreditCard, MapPin, Package, Truck, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/lib/supabase';

function DataEntry() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search || window.location.search);

  // Debug: Log URL parameters
  useEffect(() => {
    console.log('URL Parameters:', {
      country: queryParams.get('country'),
      weight: queryParams.get('weight'),
      carrier: queryParams.get('carrier'),
      rate: queryParams.get('rate'),
      service: queryParams.get('service')
    });
  }, [location.search]);

  // Form state
  const [formData, setFormData] = useState(() => {
    const rate = queryParams.get('rate');
    console.log('Initializing form data with rate:', rate);

    return {
      customerName: '',
      customerPhone: '',
      customerAadhar: '',
      customerPAN: '',
      destinationCountry: queryParams.get('country') || '',
      parcelWeight: queryParams.get('weight') || '',
      selectedCourier: queryParams.get('carrier') || '',
      selectedService: queryParams.get('service') || '',
      basePrice: rate ? parseFloat(rate) : 0,
      priceToCustomer: '',
      ourCost: '',
      status: 'Booked'
    };
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const navigate = useNavigate();

  // Function to generate a unique booking ID
  const generateBookingId = () => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `BK-${timestamp}-${randomStr}`.toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Generate a unique booking ID
      const bookingId = generateBookingId();

      // Prepare the booking data
      const bookingData: Tables['bookings']['Insert'] = {
        booking_id: bookingId, // Add the generated booking ID
        customer_name: formData.customerName,
        customer_phone: formData.customerPhone,
        customer_aadhar: formData.customerAadhar || undefined,
        customer_pan: formData.customerPAN || undefined,
        destination_country: formData.destinationCountry,
        parcel_weight: parseFloat(formData.parcelWeight) || 0,
        selected_courier: formData.selectedCourier,
        selected_service: formData.selectedService,
        base_price: formData.basePrice,
        price_to_customer: parseFloat(formData.priceToCustomer) || 0,
        our_cost: parseFloat(formData.ourCost) || 0,
        status: 'Booked' as const,
        created_at: new Date().toISOString(),
      };

      console.log('Submitting booking data:', bookingData);

      // Insert the booking into Supabase
      const { data, error } = await supabase
        .from('bookings')
        .insert([bookingData])  // Wrap in array as required by Supabase
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Show success message
      setSuccess(true);

      // Reset form after successful submission
      setFormData({
        customerName: '',
        customerPhone: '',
        customerAadhar: '',
        customerPAN: '',
        destinationCountry: '',
        parcelWeight: '',
        selectedCourier: '',
        selectedService: '',
        basePrice: 0,
        priceToCustomer: '',
        ourCost: '',
        status: 'Booked'
      });

      // Redirect to success page or show success message
      setTimeout(() => {
        setSuccess(false);
        navigate('/'); // or to a success page
      }, 3000);

    } catch (err) {
      console.error('Error submitting booking:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="header-gradient px-6 py-12 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center">
            <FileText className="w-10 h-10 mr-4" />
            Booking Data Entry
          </h1>
          <p className="text-xl opacity-90 mb-6">Enter new booking information</p>
          <Link to="/" className="nav-link bg-white/20 text-white hover:bg-white/30">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Success Message */}
        {success && (
          <div className="mb-8 animate-fade-in">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
              <p className="text-green-800 font-medium">✅ Booking submitted successfully!</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-8 animate-fade-in">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
              <p className="text-red-800 font-medium">❌ {error}</p>
            </div>
          </div>
        )}

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="card-modern animate-fade-in">
          {/* Customer Information Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-6 flex items-center text-foreground">
              <User className="w-5 h-5 mr-2 text-primary" />
              Customer Information
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="customerName" className="form-label flex items-center">
                  <User className="w-4 h-4 mr-2 text-primary" />
                  Customer Name*
                </label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label htmlFor="customerPhone" className="form-label flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-primary" />
                  Phone Number*
                </label>
                <input
                  type="tel"
                  id="customerPhone"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div>
                <label htmlFor="customerAadhar" className="form-label flex items-center">
                  <CreditCard className="w-4 h-4 mr-2 text-primary" />
                  Aadhar Number (Optional)
                </label>
                <input
                  type="text"
                  id="customerAadhar"
                  name="customerAadhar"
                  value={formData.customerAadhar}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div>
                <label htmlFor="customerPAN" className="form-label flex items-center">
                  <CreditCard className="w-4 h-4 mr-2 text-primary" />
                  PAN Number (Optional)
                </label>
                <input
                  type="text"
                  id="customerPAN"
                  name="customerPAN"
                  value={formData.customerPAN}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Parcel Information Section */}
          <div className="mb-8 border-t border-border pt-8">
            <h3 className="text-xl font-semibold mb-6 flex items-center text-foreground">
              <Package className="w-5 h-5 mr-2 text-success" />
              Parcel Information
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="destinationCountry" className="form-label flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-success" />
                  Destination Country*
                </label>
                <input
                  type="text"
                  id="destinationCountry"
                  name="destinationCountry"
                  value={formData.destinationCountry}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label htmlFor="parcelWeight" className="form-label flex items-center">
                  <Package className="w-4 h-4 mr-2 text-success" />
                  Parcel Weight (kg)*
                </label>
                <input
                  type="number"
                  id="parcelWeight"
                  name="parcelWeight"
                  value={formData.parcelWeight}
                  onChange={handleChange}
                  step="0.01"
                  min="0.01"
                  className="form-input"
                  required
                />
              </div>
            </div>
          </div>

          {/* Courier Information Section */}
          <div className="mb-8 border-t border-border pt-8">
            <h3 className="text-xl font-semibold mb-6 flex items-center text-foreground">
              <Truck className="w-5 h-5 mr-2 text-warning" />
              Courier Information
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="selectedCourier" className="form-label flex items-center">
                  <Truck className="w-4 h-4 mr-2 text-warning" />
                  Selected Courier*
                </label>
                <input
                  type="text"
                  id="selectedCourier"
                  name="selectedCourier"
                  value={formData.selectedCourier}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label htmlFor="selectedService" className="form-label flex items-center">
                  <Truck className="w-4 h-4 mr-2 text-warning" />
                  Service Type
                </label>
                <input
                  type="text"
                  id="selectedService"
                  name="selectedService"
                  value={formData.selectedService}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Pricing Information Section */}
          <div className="mb-8 border-t border-border pt-8">
            <h3 className="text-xl font-semibold mb-6 flex items-center text-foreground">
              <DollarSign className="w-5 h-5 mr-2 text-destructive" />
              Pricing Information
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="basePrice" className="form-label flex items-center">
                  <DollarSign className="w-4 h-4 mr-2 text-destructive" />
                  Base Price*
                </label>
                <input
                  type="number"
                  id="basePrice"
                  name="basePrice"
                  value={formData.basePrice || ''}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label htmlFor="priceToCustomer" className="form-label flex items-center">
                  <DollarSign className="w-4 h-4 mr-2 text-destructive" />
                  Price to Customer*
                </label>
                <input
                  type="number"
                  id="priceToCustomer"
                  name="priceToCustomer"
                  value={formData.priceToCustomer}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label htmlFor="ourCost" className="form-label flex items-center">
                  <DollarSign className="w-4 h-4 mr-2 text-destructive" />
                  Our Cost*
                </label>
                <input
                  type="number"
                  id="ourCost"
                  name="ourCost"
                  value={formData.ourCost}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="form-input"
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="border-t border-border pt-8">
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit Booking
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm border-t border-border py-8 text-center">

      </footer>
    </div>
  );
}

export default DataEntry;