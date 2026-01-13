import React from 'react';
import { Link } from 'react-router-dom';
import { Search, FileText, Shield, TrendingUp, Globe, Clock } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <header className="header-gradient px-6 py-16 text-center relative">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <Globe className="w-12 h-12 mr-4" />
            <h1 className="text-5xl font-bold">Majithia International Courier</h1>
          </div>
          <p className="text-xl opacity-90 mb-8">Your Trusted Partner for International Shipping</p>
          <div className="flex items-center justify-center space-x-8 text-sm">
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              <span>Fast Delivery</span>
            </div>
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              <span>Secure Shipping</span>
            </div>
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              <span>Best Rates</span>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Options Section */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8 animate-slide-up">
          {/* Rate Finder Card */}
          <div className="card-modern group">
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mr-4 group-hover:bg-primary/20 transition-colors duration-300">
                <Search className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Rate Finder</h2>
            </div>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Find the best shipping rates for your international parcels across multiple carriers with real-time pricing.
            </p>
            <Link to="/rate-finder" className="btn-primary w-full text-center block">
              Find Rates
            </Link>
          </div>
          
          {/* Data Entry Card */}
          <div className="card-modern group">
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 bg-success/10 rounded-2xl flex items-center justify-center mr-4 group-hover:bg-success/20 transition-colors duration-300">
                <FileText className="w-7 h-7 text-success" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Data Entry</h2>
            </div>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Enter booking information for new shipments with comprehensive customer and parcel details.
            </p>
            <Link to="/data-entry" className="btn-success w-full text-center block">
              Enter Data
            </Link>
          </div>

          {/* Admin Dashboard Card */}
          <div className="card-gradient group border-warning/20">
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 bg-warning/10 rounded-2xl flex items-center justify-center mr-4 group-hover:bg-warning/20 transition-colors duration-300">
                <Shield className="w-7 h-7 text-warning" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Admin Dashboard</h2>
            </div>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Manage and track all bookings with comprehensive analytics and reporting.
            </p>
            <Link to="/admin" className="btn-warning w-full text-center block">
              Admin Access
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20 text-center">
          <h3 className="text-3xl font-bold text-foreground mb-12">Why Choose Majithia International?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-xl font-semibold mb-3">Global Network</h4>
              <p className="text-muted-foreground">Extensive network covering destinations worldwide with reliable partners.</p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-success" />
              </div>
              <h4 className="text-xl font-semibold mb-3">Fast Processing</h4>
              <p className="text-muted-foreground">Quick rate comparisons and efficient booking management system.</p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-warning" />
              </div>
              <h4 className="text-xl font-semibold mb-3">Best Rates</h4>
              <p className="text-muted-foreground">Competitive pricing with multiple carrier options for optimal cost savings.</p>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm border-t border-border py-8 text-center">
        <p className="text-muted-foreground">© 2025 Majithia International Courier. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;