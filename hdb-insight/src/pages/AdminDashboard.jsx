import React, { useState , useEffect, useMemo} from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";
import { FaUserCircle, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("Dashboard");
  const [selectedYear, setSelectedYear] = useState(2025);

  // NEW: data from backend
  const [totalTx, setTotalTx] = useState(0);
  const [lineData, setLineData] = useState([]);   // for monthly trend chart
  const [barData, setBarData] = useState([]);     // for avg price by town
  const [pricePerSqm, setPricePerSqm] = useState(null); // for price per sqm

  const [towns, setTowns] = useState([]);
  const [selectedTown, setSelectedTown] = useState("");

  const [flatTypes, setFlatTypes] = useState([]);
  const [selectedFlatType, setSelectedFlatType] = useState("");

  const [flatModels, setFlatModels] = useState([]);
  const [selectedFlatModel, setSelectedFlatModel] = useState("");

  //mongodb
  const [districtOverview, setDistrictOverview] = useState([]);  //district performance overview
  const [marketSentiment, setMarketSentiment] = useState("");    //market sentiment






  useEffect(() => {
  // 1. Total Transactions
  fetch("http://localhost:3001/api/metrics/total-transactions")
    .then(res => res.json())
    .then(data => setTotalTx(Number(data.total)))
    .catch(err => console.error("Error fetching total transactions:", err));


  // 2. Monthly trend for line chart
  fetch("http://localhost:3001/api/metrics/yearly-trend")
  .then(res => res.json())
  .then(data => {
    const formatted = data.map(row => ({
      name: row.year.slice(0, 4),  // show only "2020", "2021"
      price: Number(row.avg_price)
    }));
    setLineData(formatted);
  })
  .catch(err => console.error("yearly trend error", err));


  // 3. Average price by town for bar chart (GLOBAL, no filters)
  fetch("http://localhost:3001/api/analytics/avg-price-by-town")
    .then(async (res) => {
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }
      return res.json();
    })
    .then((data) => {
      const formatted = data.map((row) => ({
        town: row.town_name,
        value: Number(row.avg_price),
      }));
      setBarData(formatted);
    })
    .catch((err) => console.error("Error fetching avg price by town:", err));


    // 4. Price per sqm 
    fetch("http://localhost:3001/api/metrics/price-per-sqm")
      .then(res => res.json())
      .then(d => setPricePerSqm(d?.price_per_sqm != null ? Number(d.price_per_sqm) : null))
      .catch(err => {
        console.error("Error fetching price-per-sqm (latest):", err);
        setPricePerSqm(null);
      });

  }, []);


  // load dropdown options from SQL
  useEffect(() => {
    // towns
    fetch("http://localhost:3001/api/towns")
      .then(res => res.json())
      .then(rows => setTowns(rows.map(r => r.town_name)))
      .catch(err => console.error("Error loading towns list:", err));
    /*
    // flat types
    fetch("http://localhost:3001/api/flat-types")
      .then(res => res.json())
      .then(list => setFlatTypes(list || []))
      .catch(err => console.error("Error loading flat types:", err));

    // flat models
    fetch("http://localhost:3001/api/flat-models")
      .then(res => res.json())
      .then(list => setFlatModels(list || []))
      .catch(err => console.error("Error loading flat models:", err));
      */
  }, []);

  // when town changes, load valid flat types for that town
  useEffect(() => {
    if (!selectedTown) {
      setFlatTypes([]);
      setSelectedFlatType("");
      setFlatModels([]);
      setSelectedFlatModel("");
      return;
    }

    fetch(`http://localhost:3001/api/flat-types?town=${encodeURIComponent(selectedTown)}`)
      .then(res => res.json())
      .then(list => {
        setFlatTypes(list || []);
        setSelectedFlatType("");
        setFlatModels([]);
        setSelectedFlatModel("");
      })
      .catch(err => console.error("Error loading flat types:", err));
  }, [selectedTown]);


  // when town + flatType change, load valid flat models
  useEffect(() => {
    if (!selectedTown) {
      setFlatModels([]);
      setSelectedFlatModel("");
      return;
    }

    const params = new URLSearchParams();
    params.append("town", selectedTown);
    if (selectedFlatType) params.append("flatType", selectedFlatType);

    fetch(`http://localhost:3001/api/flat-models?${params.toString()}`)
      .then(res => res.json())
      .then(list => {
        setFlatModels(list || []);
        setSelectedFlatModel("");
      })
      .catch(err => console.error("Error loading flat models:", err));
  }, [selectedTown, selectedFlatType]);



  const handleFilter = () => {
    const params = new URLSearchParams();
    // Priority 1: Town
    if (selectedTown) {
      params.append("town", selectedTown);

      // Priority 2: Flat Type (only if town is chosen)
      if (selectedFlatType) {
        params.append("flatType", selectedFlatType);

        // Priority 3: Flat Model (only if town + type chosen)
        if (selectedFlatModel) {
          params.append("flatModel", selectedFlatModel);
        }
      }
    }

    const queryString = params.toString() ? `?${params.toString()}` : "";

    // 1) Total Transactions
    fetch(`http://localhost:3001/api/metrics/total-transactions${queryString}`)
      .then(res => res.json())
      .then(data => setTotalTx(Number(data.total)))
      .catch(err => console.error("Error fetching total transactions:", err));


    // 2) Yearly trend
    fetch(`http://localhost:3001/api/metrics/yearly-trend${queryString}`)
      .then(res => res.json())
      .then(data => {
        const formatted = (data || []).map(row => ({
          name: row.year.slice(0, 4),
          price: Number(row.avg_price),
        }));
        setLineData(formatted);
      })
      .catch(err => console.error("yearly trend error", err));


    // 3) Average price by town (GLOBAL – ignore filters)
    fetch("http://localhost:3001/api/analytics/avg-price-by-town")
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text}`);
        }
        return res.json();
      })
      .then((data) => {
        const formatted = (data || []).map((row) => ({
          town: row.town_name,
          value: Number(row.avg_price),
        }));
        setBarData(formatted);
      })
      .catch((err) => console.error("Error fetching avg price by town:", err));



    // 4) Price per SQM
    fetch(`http://localhost:3001/api/metrics/price-per-sqm${queryString}`)
      .then(res => res.json())
      .then(d =>
        setPricePerSqm(
          d?.price_per_sqm != null ? Number(d.price_per_sqm) : null
        )
      )
      .catch(err => {
        console.error("Error fetching price-per-sqm:", err);
        setPricePerSqm(null);
      });
  };


  // 5. District Overview from Mongo Feedback (load once)
  useEffect(() => {
    fetch("http://localhost:3001/api/insights/district-overview")
      .then((res) => res.json())
      .then((data) => setDistrictOverview(data || []))
      .catch((err) => console.error("District overview error", err));
  }, []);

  // 6. Update market sentiment when selectedTown or districtOverview changes
  useEffect(() => {
    // No town selected yet
    if (!selectedTown) {
      setMarketSentiment("Select a Town");
      return;
    }

    // Find that town in the overview data (top 10 recent towns)
    const entry = districtOverview.find(
      (row) => row.town.toLowerCase() === selectedTown.toLowerCase()
    );

    if (!entry || entry.avgRating == null || entry.count === 0) {
      setMarketSentiment("No Feedback");
      return;
    }

    // Example text: "Strong (4.2/5)"
    const avg = Number(entry.avgRating).toFixed(1);
    const label = entry.sentiment || "Neutral";

    setMarketSentiment(`${label} (${avg}/5)`);
  }, [selectedTown, districtOverview]);





  //LOGOUT FUNCTION
  function useLogout() {
    const navigate = useNavigate();
    return () => {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
      navigate("/", { replace: true }); // back to Login
    };
  }



  /*
  const lineData = [
    { name: "Jan", price: 520000 },
    { name: "Feb", price: 535000 },
    { name: "Mar", price: 510000 },
    { name: "Apr", price: 545000 },
    { name: "May", price: 560000 },
    { name: "Jun", price: 575000 },
  ];

  const barData = [
    { town: "Central", value: 850000 },
    { town: "Bukit Timah", value: 780000 },
    { town: "Marine Parade", value: 720000 },
    { town: "Bishan", value: 680000 },
    { town: "Toa Payoh", value: 620000 },
    { town: "Bedok", value: 580000 },
    { town: "Jurong West", value: 520000 },
  ];
  

  const tableData = [
    { town: "Central Blk 123", date: "16/10/23", sentiment: "High Demand" },
    { town: "Bukit Timah Blk 456", date: "15/10/23", sentiment: "Premium Market" },
    { town: "Marine Parade Blk 789", date: "14/10/23", sentiment: "Stable Growth" },
    { town: "Bishan Blk 321", date: "13/10/23", sentiment: "Family Preferred" },
    { town: "Toa Payoh Blk 654", date: "12/10/23", sentiment: "Mature Estate" },
    { town: "Bedok Blk 987", date: "11/10/23", sentiment: "Affordable Option" },
    { town: "Jurong West Blk 147", date: "10/10/23", sentiment: "Value Buy" },
  ];
  */

  const logout = useLogout();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <div className="flex justify-between items-center px-6 py-4 border-b bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">HDB Resale Market Analyzer</h1>
        <button
        onClick={logout}
        className="flex items-center space-x-2 text-red-600 font-medium hover:text-red-700 transition"
         title="Logout"
        >
          <FaUserCircle className="text-xl" />
          <span>Logged in as: Admin</span>
        </button>
      </div>
      
      <div className="flex space-x-6 border-b bg-white px-6">
        <button
          onClick={() => {
            setSelectedTab("Dashboard");
            navigate("/admin-dashboard");
          }}
          className={`py-2 border-b-2 ${
            selectedTab === "Dashboard"
              ? "border-red-400 text-red-500 font-medium"
              : "border-transparent text-gray-400"
          }`}
        >
          Dashboard
        </button>

        <button
          onClick={() => {
            setSelectedTab("Data Management");
            navigate("/admin-data");
          }}
          className={`py-2 border-b-2 ${
            selectedTab === "Data Management"
              ? "border-red-400 text-red-500 font-medium"
              : "border-transparent text-gray-400"
          }`}
        >
          Data Management
        </button>

        <button
          onClick={() => {
            setSelectedTab("Insights");
            navigate("/admin-insights");
          }}
          className={`py-2 border-b-2 ${
            selectedTab === "Insights"
              ? "border-red-400 text-red-500 font-medium"
              : "border-transparent text-gray-400"
          }`}
        >
          Insights
        </button>
      </div>
      <div className="p-6 grid grid-cols-12 gap-6">
        <div className="col-span-3 bg-white p-4 rounded-xl shadow-sm">
          <div className="mb-3">
            <label className="block text-sm font-semibold mb-1">Town</label>
            <select
              value={selectedTown}
              onChange={(e) => setSelectedTown(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm text-gray-600"
            >
              <option value="">All Towns</option>
              {towns.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="block text-sm font-semibold mb-1">Flat Type</label>
            <select
              value={selectedFlatType}
              onChange={(e) => setSelectedFlatType(e.target.value)}
              disabled={!selectedTown}
              className="w-full border rounded-md px-3 py-2 text-sm text-gray-600 disabled:bg-gray-100 disabled:text-gray-400"
            >
              <option value="">All Flat Types</option>
              {flatTypes.map((ft) => (
                <option key={ft} value={ft}>
                  {ft}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="block text-sm font-semibold mb-1">Flat Model</label>
            <select
              value={selectedFlatModel}
              onChange={(e) => setSelectedFlatModel(e.target.value)}
              disabled={!selectedTown || !selectedFlatType}
              className="w-full border rounded-md px-3 py-2 text-sm text-gray-600 disabled:bg-gray-100 disabled:text-gray-400"
            >
              <option value="">All Flat Models</option>
              {flatModels.map((fm) => (
                <option key={fm} value={fm}>
                  {fm}
                </option>
              ))}
            </select>
          </div>
 
        <button
          onClick={handleFilter}
          className="w-full bg-lime-50 text-gray-700 py-2 rounded-md hover:bg-lime-100"
        >
          Filter
        </button>
        </div>
        <div className="col-span-9 flex flex-col gap-6">
          <div className="grid grid-cols-4 gap-4">
            {[          
              { label: "Total Transactions", value: totalTx ? totalTx.toLocaleString() : "—" },
              // you can derive avg price from the last lineData point
              {
                label: "Average Price",
                value:
                  lineData.length > 0
                    ? "SGD " + lineData[lineData.length - 1].price.toLocaleString()
                    : "—",
              },
              {
                label: "Price per SQM",
                value: pricePerSqm != null
                  ? "SGD " + pricePerSqm.toLocaleString()
                  : "—",
              },
              {
                label: "Market Sentiment",
                value: marketSentiment || "Select a town",
              },
            ].map((item) => (
              <div key={item.label} className="bg-white shadow-sm rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500">{item.label}</p>
                <h3 className="text-lg font-semibold mt-1">{item.value}</h3>
              </div>
            ))}
          </div>
          {/*
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-md font-semibold mb-2">Market Performance Analysis</h3>
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
              <h3 className="text-md font-semibold mb-2">Premium vs Affordable Districts</h3>
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
          */}

          {/* CHARTS */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-md font-semibold mb-2">Market Performance Analysis</h3>
              <ResponsiveContainer width="100%" height={210}>
                <LineChart data={lineData}>
                  <XAxis dataKey="name" 
                    interval={1}          // <-- show every year
                    tickMargin={8}        // <-- add spacing
                  />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="price" stroke="#6366f1" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>


            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-md font-semibold mb-2">Premium vs Affordable Districts</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData.slice(0, 8)} layout="vertical">
                  <XAxis type="number" 
                    interval={0}          // <-- show every year
                    tickMargin={8}        // <-- add spacing
                  />
                  <YAxis
                    type="category"
                    dataKey="town"
                    interval={0}     // <- show EVERY label; no auto-skip
                    width={140}      // <- a bit wider so names don’t truncate
                  />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6b9080" radius={[5, 5, 5, 5]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>


          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-md font-semibold mb-4">District Performance Overview</h3>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="py-2 px-3 font-semibold">Town</th>
                  <th className="py-2 px-3 font-semibold">Date</th>
                  <th className="py-2 px-3 font-semibold">Sentiment</th>
                </tr>
              </thead>
              <tbody>
                {districtOverview.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-3 px-3 text-gray-500 text-center">
                      No feedback data available.
                    </td>
                  </tr>
                ) : (
                  districtOverview.map((row, i) => (
                    <tr key={i} className="border-t hover:bg-gray-50">
                      <td className="py-2 px-3">{row.town}</td>
                      <td className="py-2 px-3">
                        {new Date(row.latestDate).toLocaleDateString("en-SG")}
                      </td>
                      <td className="py-2 px-3">{row.sentiment}</td>
                    </tr>
                  ))
                )}
              </tbody>

            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
