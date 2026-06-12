import React from 'react';
import { BarChart3 } from 'lucide-react';

export default function AdminReports({ orders, revenue }: any) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Sales Report</h2>
      
      <div className="mb-8 p-6 bg-gray-900 rounded-2xl text-white">
        <h3 className="text-gray-400 font-medium mb-1">Total Lifetime Revenue</h3>
        <p className="text-4xl font-bold text-white mb-6">৳{revenue.toLocaleString()}</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-gray-800 pt-6">
          <div>
            <p className="text-gray-400 text-sm">Total Orders</p>
            <p className="font-bold text-lg">{orders.length}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Avg Order Value</p>
            <p className="font-bold text-lg">৳{orders.length ? Math.round(revenue / orders.length).toLocaleString() : 0}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Completed</p>
            <p className="font-bold text-lg text-green-400">{orders.filter((o:any)=>o.status==='delivered').length}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Pending</p>
            <p className="font-bold text-lg text-yellow-400">{orders.filter((o:any)=>o.status==='pending').length}</p>
          </div>
        </div>
      </div>
      
      <div className="p-6 border border-gray-200 rounded-2xl bg-white text-center">
        <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="font-bold text-gray-900 text-lg">Detailed charts are coming soon.</h3>
        <p className="text-gray-500 text-sm max-w-md mx-auto mt-2">Export functionality and advanced demographic deep-dives will be available in the version 2 platform update.</p>
      </div>
    </div>
  );
}
