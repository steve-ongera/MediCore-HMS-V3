import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAntenatalProfiles, getDueImmunizations, getDeliveryRecords } from "../../services/api";

export default function MCHDashboard() {
  const [activePregnancies, setActivePregnancies] = useState(0);
  const [highRisk, setHighRisk] = useState(0);
  const [dueImmunizations, setDueImmunizations] = useState([]);
  const [recentDeliveries, setRecentDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [profiles, due, deliveries] = await Promise.all([
        getAntenatalProfiles({ status: "ACTIVE", page_size: 200 }),
        getDueImmunizations(),
        getDeliveryRecords({ page_size: 10 }),
      ]);
      const profileList = profiles.results ?? profiles;
      setActivePregnancies(profiles.count ?? profileList.length);
      setHighRisk(profileList.filter((p) => p.high_risk).length);
      setDueImmunizations(due);
      setRecentDeliveries(deliveries.results ?? deliveries);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading MCH dashboard...</div>;

  return (
    <div>
      <h1>Maternal & Child Health</h1>
      {error && <p>Error: {error}</p>}

      <div>
        <p>Active Pregnancies: {activePregnancies}</p>
        <p>High Risk Pregnancies: {highRisk}</p>
        <p>Immunizations Due: {dueImmunizations.length}</p>
      </div>

      <div>
        <Link to="/mch/antenatal"><button type="button">Antenatal Care</button></Link>{" "}
        <Link to="/mch/children"><button type="button">Child Records</button></Link>
      </div>

      <h2>Immunizations Due</h2>
      {dueImmunizations.length === 0 ? (
        <p>No immunizations currently due.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Child</th>
              <th>Vaccine</th>
              <th>Due Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {dueImmunizations.map((imm) => (
              <tr key={imm.id}>
                <td>{imm.child}</td>
                <td>{imm.vaccine_name}</td>
                <td>{imm.due_date}</td>
                <td><Link to={`/mch/children/${imm.child}`}>View Child</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Recent Deliveries</h2>
      {recentDeliveries.length === 0 ? (
        <p>No deliveries recorded yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Delivery #</th>
              <th>Mother</th>
              <th>Mode</th>
              <th>Outcome</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentDeliveries.map((d) => (
              <tr key={d.id}>
                <td>{d.delivery_number}</td>
                <td>{d.mother_name}</td>
                <td>{d.mode_of_delivery}</td>
                <td>{d.outcome}</td>
                <td>{new Date(d.delivery_date).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}