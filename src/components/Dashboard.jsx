import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { FaUserCircle } from "react-icons/fa";

const Dashboard= () => {
  const [selectedTab, setSelectedTab] = useState("Dashboard");

  const lineData = [
    { name: "08 May", price: 520 },
    { name: "09 May", price: 350 },
    { name: "10 May", price: 400 },
    { name: "11 May", price: 360 },
  ];

  const barData = [
    { town: "Toa Payoh", value: 56635 },
    { town: "Bishan", value: 74779 },
    { town: "Jurong West", value: 19027 },
    { town: "Geylang", value: 43887 },
    { town: "Bedok", value: 8142 },
  ];

  const tableData = [
    { town: "Jurong West Blk 63", price: "$60000k", sentiment: "Neutral sentiment" },
    { town: "Jurong West Blk 63", price: "$60000k", sentiment: "Neutral sentiment" },
    { town: "Jurong West Blk 63", price: "$60000k", sentiment: "Neutral sentiment" },
    { town: "Jurong West Blk 63", price: "$60000k", sentiment: "Neutral sentiment" },
    { town: "Jurong West Blk 63", price: "$60000k", sentiment: "Neutral sentiment" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <div className="flex justify-between items-center px-6 py-3 border-b bg-white shadow-sm">
        <h1 className="text-xl font-semibold">HDB Resale Market Analyzer</h1>
        <div className="flex items-center space-x-2 text-red-600 font-medium">
          <FaUserCircle className="text-xl" />
          <span>Logged in as: Cust1</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 border-b bg-white px-6">
        {["Dashboard", "Data Management", "Insights"].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`py-2 border-b-2 ${
              selectedTab === tab
                ? "border-red-400 text-red-500 font-medium"
                : "border-transparent text-gray-400"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="p-6 grid grid-cols-12 gap-6">
        <div className="col-span-3 bg-white p-4 rounded-xl shadow-sm">
          <div className="mb-3">
            <label className="block text-sm font-semibold mb-1">Town</label>
            <select className="w-full border rounded-md px-3 py-2 text-sm text-gray-600">
              <option value="">Select a Town</option>
                <option value="Ang Mo Kio">Ang Mo Kio</option>
                <option value="Bedok">Bedok</option>
                <option value="Bishan">Bishan</option>
                <option value="Bukit Merah">Bukit Merah</option>
                <option value="Bukit Timah">Bukit Timah</option>
                <option value="Central">Central</option>
                <option value="Clementi">Clementi</option>
                <option value="Geylang">Geylang</option>
                <option value="Kallang/Whampoa">Kallang/Whampoa</option>
                <option value="Marine Parade">Marine Parade</option>
                <option value="Pasir Ris">Pasir Ris</option>
                <option value="Queenstown">Queenstown</option>
                <option value="Serangoon">Serangoon</option>
                <option value="Tampines">Tampines</option>
                <option value="Toa Payoh">Toa Payoh</option>
                <option value="Bukit Batok">Bukit Batok</option>
                <option value="Bukit Panjang">Bukit Panjang</option>
                <option value="Choa Chu Kang">Choa Chu Kang</option>
                <option value="Hougang">Hougang</option>
                <option value="Jurong East">Jurong East</option>
                <option value="Jurong West">Jurong West</option>
                <option value="Punggol">Punggol</option>
                <option value="Sembawang">Sembawang</option>
                <option value="Sengkang">Sengkang</option>
                <option value="Tengah">Tengah</option>
                <option value="Woodlands">Woodlands</option>
                <option value="Yishun">Yishun</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="block text-sm font-semibold mb-1">Flat Type</label>
            <select className="w-full border rounded-md px-3 py-2 text-sm text-gray-600">
              <option>Flat Type</option>
              <option>2-Room</option>
              <option>4-Room Flexi</option>
              <option>5-Room</option>
              <option>EXEC Apartment</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1">Transaction Year</label>
            <input type="range" min="2000" max="2025" className="w-full accent-red-400" />
          </div>
          <button className="w-full bg-lime-50 text-gray-700 py-2 rounded-md hover:bg-lime-100">
            Filter
          </button>
        </div>
        <div className="col-span-9 flex flex-col gap-6">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Total Transactions", value: "1.5M+" },
              { label: "Avg Price", value: "SGD 580,000" },
              { label: "Price per SQM", value: "SGD 580" },
              { label: "Market Sentiment", value: "3.8/5" },
            ].map((item) => (
              <div key={item.label} className="bg-white shadow-sm rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500">{item.label}</p>
                <h3 className="text-lg font-semibold mt-1">{item.value}</h3>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-md font-semibold mb-2">Average Resale Price Trend By Month</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={lineData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="price" stroke="#6366f1" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-md font-semibold mb-2">Average Resale Price Trend By Town</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="town" width={80} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6b9080" radius={[5, 5, 5, 5]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-md font-semibold mb-4">Market Analysis</h3>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="py-2 px-3 font-semibold">Town</th>
                  <th className="py-2 px-3 font-semibold">Price</th>
                  <th className="py-2 px-3 font-semibold">Sentiment</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="py-2 px-3">{row.town}</td>
                    <td className="py-2 px-3">{row.price}</td>
                    <td className="py-2 px-3">{row.sentiment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
