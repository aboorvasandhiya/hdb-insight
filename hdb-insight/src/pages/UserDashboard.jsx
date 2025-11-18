// userdashboard.jsx
import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("Dashboard");
  const [selectedYear, setSelectedYear] = useState(2025);

  // === FILTER STATE ===
  const [selectedTown, setSelectedTown] = useState("");
  const [selectedFlatType, setSelectedFlatType] = useState("");

  // options coming from SQL via backend
  const [townOptions, setTownOptions] = useState([]);
  const [flatTypeOptions, setFlatTypeOptions] = useState([]);

  // 🔹 NEW: METRICS + CHART DATA FROM BACKEND
  const [totalTx, setTotalTx] = useState(null);
  const [lineData, setLineData] = useState([]);       // for "Average Resale Price Trend By Month"
  const [pricePerSqm, setPricePerSqm] = useState(null);


  // === LOAD OPTIONS FROM BACKEND (same URLs as AdminDashboard) ===

  // 1) Load all towns once
  useEffect(() => {
    fetch("http://localhost:3001/api/towns")
      .then((res) => res.json())
      .then((rows) => {
        // rows = [{ town_id, town_name, ... }]
        const names = rows.map((r) => r.town_name);
        setTownOptions(names);
      })
      .catch((err) => console.error("Error loading towns:", err));
  }, []);

  // 2) When town changes, load flat types for that town
  useEffect(() => {
    if (!selectedTown) {
      setFlatTypeOptions([]);
      setSelectedFlatType("");
      return;
    }

    fetch(
      `http://localhost:3001/api/flat-types?town=${encodeURIComponent(
        selectedTown
      )}`
    )
      .then((res) => res.json())
      // backend already returns ["3-Room", "4-Room", ...]
      .then((list) => setFlatTypeOptions(list || []))
      .catch((err) => console.error("Error loading flat types:", err));
  }, [selectedTown]);

  // 3) NEW: load initial metrics + line chart (no filters yet)
  useEffect(() => {
    // 1) Total Transactions
    fetch("http://localhost:3001/api/metrics/total-transactions")
      .then((res) => res.json())
      .then((data) =>
        setTotalTx(data?.total != null ? Number(data.total) : null)
      )
      .catch((err) => {
        console.error("Error fetching total transactions (user):", err);
        setTotalTx(null);
      });

    // 2) Yearly trend (used for line chart)
    fetch("http://localhost:3001/api/metrics/yearly-trend")
      .then((res) => res.json())
      .then((data) => {
        console.log("USER yearly trend:", data);
        const formatted = (data || []).map((row) => ({
          name: row.year.slice(0, 4), // "2020"
          price: Number(row.avg_price),
        }));
        setLineData(formatted);
      })
      .catch((err) => console.error("yearly trend error (user):", err));

    // 3) Price per SQM
    fetch("http://localhost:3001/api/metrics/price-per-sqm")
      .then((res) => res.json())
      .then((d) =>
        setPricePerSqm(
          d?.price_per_sqm != null ? Number(d.price_per_sqm) : null
        )
      )
      .catch((err) => {
        console.error("Error fetching price-per-sqm (user):", err);
        setPricePerSqm(null);
      });
  }, []);






  // === APPLY FILTER ===
  const handleFilter = () => {
    const params = new URLSearchParams();

    if (selectedTown) {
      params.append("town", selectedTown);
      if (selectedFlatType) {
        params.append("flatType", selectedFlatType);
      }
    }

    // include year if you want it to filter by slider
    params.append("year", selectedYear);

    const qs = params.toString() ? `?${params.toString()}` : "";

    // 1) Total Transactions
    fetch(`http://localhost:3001/api/metrics/total-transactions${qs}`)
      .then((res) => res.json())
      .then((data) =>
        setTotalTx(data?.total != null ? Number(data.total) : null)
      )
      .catch((err) => {
        console.error("Error fetching total transactions (filtered user):", err);
        setTotalTx(null);
      });

    // 2) Yearly trend (line chart)
    fetch(`http://localhost:3001/api/metrics/yearly-trend${qs}`)
      .then((res) => res.json())
      .then((data) => {
        const formatted = (data || []).map((row) => ({
          name: row.year.slice(0, 4),
          price: Number(row.avg_price),
        }));
        setLineData(formatted);
      })
      .catch((err) =>
        console.error("yearly trend error (filtered user):", err)
      );

    // 3) Price per SQM
    fetch(`http://localhost:3001/api/metrics/price-per-sqm${qs}`)
      .then((res) => res.json())
      .then((d) =>
        setPricePerSqm(
          d?.price_per_sqm != null ? Number(d.price_per_sqm) : null
        )
      )
      .catch((err) => {
        console.error("Error fetching price-per-sqm (filtered user):", err);
        setPricePerSqm(null);
      });
  };




  

  // === STATIC SAMPLE DATA (until you hook up handleFilter) ===


  const barData = [
    { town: "Toa Payoh", value: 56635 },
    { town: "Bishan", value: 74779 },
    { town: "Jurong West", value: 19027 },
    { town: "Geylang", value: 43887 },
    { town: "Bedok", value: 8142 },
  ];

  const tableData = [
    {
      town: "Jurong West Blk 63",
      price: "$60000k",
      sentiment: "Neutral sentiment",
    },
    {
      town: "Jurong West Blk 63",
      price: "$60000k",
      sentiment: "Neutral sentiment",
    },
    {
      town: "Jurong West Blk 63",
      price: "$60000k",
      sentiment: "Neutral sentiment",
    },
    {
      town: "Jurong West Blk 63",
      price: "$60000k",
      sentiment: "Neutral sentiment",
    },
    {
      town: "Jurong West Blk 63",
      price: "$60000k",
      sentiment: "Neutral sentiment",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* HEADER */}
      <div className="flex justify-between items-center px-6 py-4 border-b bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">
          HDB Resale Market Analyzer
        </h1>
        <button
          onClick={() => navigate("/account")}
          className="flex items-center space-x-2 text-red-600 font-medium hover:text-red-700 transition"
        >
          <FaUserCircle className="text-xl" />
          <span>Logged in as: {localStorage.getItem("username") || "Guest"}</span>
        </button>
      </div>

      <div className="flex space-x-6 border-b bg-white px-6">
        <button
          onClick={() => {
            setSelectedTab("Dashboard");
            navigate("/dashboard");
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
            navigate("/data");
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
            navigate("/insights");
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

      {/* MAIN LAYOUT */}
      <div className="p-6 grid grid-cols-12 gap-6">
        {/* LEFT FILTER CARD */}
        <div className="col-span-3 bg-white p-4 rounded-xl shadow-sm">
          <div className="mb-3">
            <label className="block text-sm font-semibold mb-1">Town</label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm text-gray-600"
              value={selectedTown}
              onChange={(e) => setSelectedTown(e.target.value)}
            >
              <option value="">Select a Town</option>
              {townOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-semibold mb-1">Flat Type</label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm text-gray-600"
              value={selectedFlatType}
              onChange={(e) => setSelectedFlatType(e.target.value)}
              disabled={!selectedTown || flatTypeOptions.length === 0}
            >
              <option value="">Flat Type</option>
              {flatTypeOptions.map((ft) => (
                <option key={ft} value={ft}>
                  {ft}
                </option>
              ))}
            </select>
          </div>

          <button
            className="w-full bg-lime-50 text-gray-700 py-2 rounded-md hover:bg-lime-100"
            onClick={handleFilter}
          >
            Filter
          </button>
        </div>

        {/* RIGHT: CARDS + CHARTS + TABLE */}
        <div className="col-span-9 flex flex-col gap-6">
          <div className="grid grid-cols-4 gap-4">
            {[
              {
                label: "Total Transactions",
                value: totalTx !== null ? totalTx.toLocaleString() : "—",
              },
              {
                // derive Avg Price from the last lineData point
                label: "Avg Price",
                value:
                  lineData.length > 0
                    ? "SGD " +
                      lineData[lineData.length - 1].price.toLocaleString()
                    : "—",
              },
              {
                label: "Price per SQM",
                value:
                  pricePerSqm != null
                    ? "SGD " + pricePerSqm.toLocaleString()
                    : "—",
              },
              { label: "Market Sentiment", value: "3.8/5" }, // still static for now
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white shadow-sm rounded-xl p-4 text-center"
              >
                <p className="text-sm text-gray-500">{item.label}</p>
                <h3 className="text-lg font-semibold mt-1">{item.value}</h3>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-md font-semibold mb-2">
                Average Resale Price Trend By Year
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={lineData}>
                  <XAxis dataKey="name" interval={1} tickMargin={8}/>
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="price" stroke="#6366f1" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-md font-semibold mb-2">
                Average Resale Price Trend By Town
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="town" width={80} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[5, 5, 5, 5]} />
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
