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

  // METRICS + CHART DATA FROM BACKEND
  const [totalTx, setTotalTx] = useState(null);
  const [lineData, setLineData] = useState([]); // "Average Resale Price Trend By Year"
  const [pricePerSqm, setPricePerSqm] = useState(null);
  const [barData, setBarData] = useState([]);     // for avg price by town

  const [marketSentiment, setMarketSentiment] = useState("—");
  const [districtOverview, setDistrictOverview] = useState([]); 
  const [townFeedback, setTownFeedback] = useState([]);


  // 1) Load all towns once
  useEffect(() => {
    fetch("http://localhost:3001/api/towns")
      .then((res) => res.json())
      .then((rows) => {
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
      .then((list) => setFlatTypeOptions(list || []))
      .catch((err) => console.error("Error loading flat types:", err));
  }, [selectedTown]);

  // 3) Initial metrics + line chart (no filters)
  useEffect(() => {
    // Total Transactions
    fetch("http://localhost:3001/api/metrics/total-transactions")
      .then((res) => res.json())
      .then((data) =>
        setTotalTx(data?.total != null ? Number(data.total) : null)
      )
      .catch((err) => {
        console.error("Error fetching total transactions (user):", err);
        setTotalTx(null);
      });

    // Yearly trend (line chart)
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

    // Price per SQM
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

    // Avg Price by Town (bar chart)
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

  }, []);

  // 5. District Overview from Mongo + PSQL
  useEffect(() => {
    fetch("http://localhost:3001/api/insights/district-overview")
      .then(res => res.json())
      .then(data => setDistrictOverview(data))
      .catch(err => console.error("District overview error", err));
  }, []);


  // 6. Update market sentiment when selectedTown or districtOverview changes
  useEffect(() => {
    if (!selectedTown) {
      setMarketSentiment("Select a Town");
      return;
    }

    const entry = districtOverview.find(
      (row) => row.town.toLowerCase() === selectedTown.toLowerCase()
    );

    if (!entry || entry.avgRating == null || entry.ratingCount === 0) {
      setMarketSentiment("No Feedback");
      return;
    }

    const avg = Number(entry.avgRating).toFixed(1);
    const label = entry.sentiment || "Neutral";

    setMarketSentiment(`${label} (${avg}/5)`);
  }, [selectedTown, districtOverview]);




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

    // Total Transactions
    fetch(`http://localhost:3001/api/metrics/total-transactions${qs}`)
      .then((res) => res.json())
      .then((data) =>
        setTotalTx(data?.total != null ? Number(data.total) : null)
      )
      .catch((err) => {
        console.error("Error fetching total transactions (filtered user):", err);
        setTotalTx(null);
      });

    // Yearly trend (line chart)
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

    // Price per SQM
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

    // 4) REFRESH DISTRICT OVERVIEW so summary row uses latest ratings
    fetch("http://localhost:3001/api/insights/district-overview")
      .then((res) => res.json())
      .then((data) => setDistrictOverview(data || []))
      .catch((err) =>
        console.error("District overview error (filtered user):", err)
      );

    // 5) FEEDBACK FOR SELECTED TOWN ONLY
    if (selectedTown) {
      fetch(
        `http://localhost:3001/api/insights?town=${encodeURIComponent(
          selectedTown
        )}`
      )
        .then((res) => res.json())
        .then((docs) => setTownFeedback(docs || []))
        .catch((err) => {
          console.error("Error fetching town feedback:", err);
          setTownFeedback([]);
        });
    } else {
      setTownFeedback([]);
    }
  
  };


  const selectedTownSummary = selectedTown
    ? districtOverview.find(
        (r) => r.town.toLowerCase() === selectedTown.toLowerCase()
      )
    : null;

  const hasTownReviews =
    selectedTownSummary && selectedTownSummary.ratingCount > 0;



  /* === STATIC SAMPLE DATA (for town bar chart + table) ===
  const barData = [
    { town: "Toa Payoh", value: 56635 },
    { town: "Bishan", value: 74779 },
    { town: "Jurong West", value: 19027 },
    { town: "Geylang", value: 43887 },
    { town: "Bedok", value: 8142 },
  ];
  */

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
          <span>
            Logged in as: {localStorage.getItem("username") || "Guest"}
          </span>
        </button>
      </div>

      {/* TABS */}
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
            <label className="block text-sm font-semibold mb-1">
              Flat Type
            </label>
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
          {/* Metric cards */}
          <div className="grid grid-cols-4 gap-4">
            {[
              {
                label: "Total Transactions",
                value: totalTx !== null ? totalTx.toLocaleString() : "—",
              },
              {
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
              { label: "Market Sentiment", value: marketSentiment},
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

          {/* Charts */}
          <div className="grid grid-cols-2 gap-6">
            {/* Line chart */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-md font-semibold mb-2">
                Average Resale Price Trend By Year
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={lineData}>
                  <XAxis dataKey="name" interval={1} tickMargin={8} />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#6366f1"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Static bar chart */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-md font-semibold mb-2">
                Average Resale Price Trend By Town
              </h3>
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

          {/* market analysis table */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-md font-semibold mb-4">Market Analysis</h3>

            {/* === CASE 1: NO TOWN SELECTED → SHOW ALL TOWNS OVERVIEW === */}
            {!selectedTown ? (
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="py-2 px-3 font-semibold">Town</th>
                    <th className="py-2 px-3 font-semibold">Latest Feedback</th>
                    <th className="py-2 px-3 font-semibold">Avg Rating</th>
                    <th className="py-2 px-3 font-semibold">Reviews</th>
                    <th className="py-2 px-3 font-semibold">Avg Price</th>
                    <th className="py-2 px-3 font-semibold">Price per SQM</th>
                    <th className="py-2 px-3 font-semibold">Total Transactions</th>
                    <th className="py-2 px-3 font-semibold">Sentiment</th>
                  </tr>
                </thead>
                <tbody>
                  {districtOverview.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-3 px-3 text-gray-500 text-center"
                      >
                        No overview data available.
                      </td>
                    </tr>
                  ) : (
                    districtOverview.map((row, i) => (
                      <tr key={i} className="border-t hover:bg-gray-50">
                        <td className="py-2 px-3">{row.town}</td>
                        <td className="py-2 px-3">
                          {row.latestDate
                            ? new Date(row.latestDate).toLocaleDateString("en-SG")
                            : "—"}
                        </td>
                        <td className="py-2 px-3">
                          {row.avgRating != null
                            ? `${Number(row.avgRating).toFixed(1)}/5`
                            : "No rating"}
                        </td>
                        <td className="py-2 px-3">
                          {row.ratingCount != null ? row.ratingCount : 0}
                        </td>
                        <td className="py-2 px-3">
                          {row.avgPrice != null
                            ? `SGD ${Number(row.avgPrice).toLocaleString()}`
                            : "—"}
                        </td>
                        <td className="py-2 px-3">
                          {row.pricePerSqm != null
                            ? `SGD ${Number(row.pricePerSqm).toLocaleString()}`
                            : "—"}
                        </td>
                        <td className="py-2 px-3">
                          {row.totalTransactions != null
                            ? Number(row.totalTransactions).toLocaleString()
                            : "—"}
                        </td>
                        <td className="py-2 px-3">{row.sentiment}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <>
                {/* === CASE 2: TOWN SELECTED → ONE SUMMARY ROW === */}
                <table className="w-full border-collapse text-sm mb-4">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="py-2 px-3 font-semibold">Town</th>
                      <th className="py-2 px-3 font-semibold">Latest Feedback</th>
                      <th className="py-2 px-3 font-semibold">Avg Rating</th>
                      <th className="py-2 px-3 font-semibold"># Reviews</th>
                      <th className="py-2 px-3 font-semibold">Avg Price</th>
                      <th className="py-2 px-3 font-semibold">Price per SQM</th>
                      <th className="py-2 px-3 font-semibold">Total Transactions</th>
                      <th className="py-2 px-3 font-semibold">Sentiment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!selectedTownSummary ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="py-3 px-3 text-gray-500 text-center"
                        >
                          No overview data for {selectedTown}.
                        </td>
                      </tr>
                    ) : (
                      <tr className="border-t hover:bg-gray-50">
                        <td className="py-2 px-3">{selectedTownSummary.town}</td>
                        <td className="py-2 px-3">
                          {selectedTownSummary.latestDate
                            ? new Date(
                                selectedTownSummary.latestDate
                              ).toLocaleDateString("en-SG")
                            : "—"}
                        </td>
                        <td className="py-2 px-3">
                          {selectedTownSummary.avgRating != null
                            ? `${Number(selectedTownSummary.avgRating).toFixed(1)}/5`
                            : "No rating"}
                        </td>
                        <td className="py-2 px-3">
                          {selectedTownSummary.ratingCount != null
                            ? selectedTownSummary.ratingCount
                            : 0}
                        </td>
                        <td className="py-2 px-3">
                          {selectedTownSummary.avgPrice != null
                            ? `SGD ${Number(
                                selectedTownSummary.avgPrice
                              ).toLocaleString()}`
                            : "—"}
                        </td>
                        <td className="py-2 px-3">
                          {selectedTownSummary.pricePerSqm != null
                            ? `SGD ${Number(
                                selectedTownSummary.pricePerSqm
                              ).toLocaleString()}`
                            : "—"}
                        </td>
                        <td className="py-2 px-3">
                          {selectedTownSummary.totalTransactions != null
                            ? Number(
                                selectedTownSummary.totalTransactions
                              ).toLocaleString()
                            : "—"}
                        </td>
                        <td className="py-2 px-3">
                          {selectedTownSummary.sentiment}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* === FEEDBACK LIST FOR THAT TOWN === */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">
                    Resident Feedback for {selectedTown}
                  </h4>
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-100 text-left">
                        <th className="py-2 px-3 font-semibold">Date</th>
                        <th className="py-2 px-3 font-semibold">User</th>
                        <th className="py-2 px-3 font-semibold">Rating</th>
                        <th className="py-2 px-3 font-semibold">Comment</th>
                        <th className="py-2 px-3 font-semibold">Tags</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!hasTownReviews ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-3 px-3 text-gray-500 text-center"
                          >
                            No feedback submitted yet for {selectedTown}.
                          </td>
                        </tr>
                      ) : townFeedback.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-3 px-3 text-gray-500 text-center"
                          >
                            Loading feedback…
                          </td>
                        </tr>
                      ) : (
                        townFeedback.map((fb, i) => (
                          <tr key={fb._id || i} className="border-t hover:bg-gray-50">
                            <td className="py-2 px-3">
                              {fb.date
                                ? new Date(fb.date).toLocaleDateString("en-SG")
                                : "—"}
                            </td>
                            <td className="py-2 px-3">
                              {fb.username || "Anonymous"}
                            </td>
                            <td className="py-2 px-3">
                              {fb.rating != null ? `${fb.rating}/5` : "—"}
                            </td>
                            <td className="py-2 px-3">{fb.comment}</td>
                            <td className="py-2 px-3">
                              {Array.isArray(fb.tags) && fb.tags.length > 0
                                ? fb.tags.join(", ")
                                : "—"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
