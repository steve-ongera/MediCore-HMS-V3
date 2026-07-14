import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPatients, getAntenatalProfiles, registerAntenatal } from "../../services/api";

export default function AntenatalRegister() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [patientQuery, setPatientQuery] = useState("");
  const [patientResults, setPatientResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [form, setForm] = useState({
    gravida: "", para: "", lmp: "", blood_group: "UNKNOWN",
    height_cm: "", booking_weight_kg: "", hiv_status: "UNKNOWN",
    high_risk: false, risk_factors: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const data = await getAntenatalProfiles({ page_size: 100 });
      setProfiles(data.results ?? data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSearch = async (e) => {
    e.preventDefault();
    if (!patientQuery.trim()) return;
    try {
      const data = await getPatients({ search: patientQuery });
      setPatientResults(data.results ?? data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFormChange = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) {
      setError("Please select a mother first.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await registerAntenatal({
        mother: selectedPatient.id,
        gravida: Number(form.gravida),
        para: Number(form.para),
        lmp: form.lmp,
        blood_group: form.blood_group,
        height_cm: form.height_cm || undefined,
        booking_weight_kg: form.booking_weight_kg || undefined,
        hiv_status: form.hiv_status,
        high_risk: form.high_risk,
        risk_factors: form.risk_factors,
      });
      setSelectedPatient(null);
      setPatientQuery("");
      setPatientResults([]);
      setForm({
        gravida: "", para: "", lmp: "", blood_group: "UNKNOWN",
        height_cm: "", booking_weight_kg: "", hiv_status: "UNKNOWN",
        high_risk: false, risk_factors: "",
      });
      loadProfiles();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Antenatal Care</h1>
      {error && <p>Error: {error}</p>}

      <h2>Register New Pregnancy</h2>
      <form onSubmit={handlePatientSearch}>
        <input
          type="text"
          placeholder="Search mother by name / phone / hospital number"
          value={patientQuery}
          onChange={(e) => setPatientQuery(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {patientResults.length > 0 && (
        <ul>
          {patientResults.map((p) => (
            <li key={p.id}>
              {p.full_name} — {p.hospital_number}{" "}
              <button type="button" onClick={() => setSelectedPatient(p)}>Select</button>
            </li>
          ))}
        </ul>
      )}

      {selectedPatient && (
        <p>Selected mother: <strong>{selectedPatient.full_name}</strong> ({selectedPatient.hospital_number})</p>
      )}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Gravida</label>
          <input type="number" min="0" value={form.gravida} onChange={handleFormChange("gravida")} required />
        </div>
        <div>
          <label>Para</label>
          <input type="number" min="0" value={form.para} onChange={handleFormChange("para")} required />
        </div>
        <div>
          <label>LMP (Last Menstrual Period)</label>
          <input type="date" value={form.lmp} onChange={handleFormChange("lmp")} required />
        </div>
        <div>
          <label>Blood Group</label>
          <select value={form.blood_group} onChange={handleFormChange("blood_group")}>
            <option value="UNKNOWN">Unknown</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>
        <div>
          <label>Height (cm)</label>
          <input type="number" value={form.height_cm} onChange={handleFormChange("height_cm")} />
        </div>
        <div>
          <label>Booking Weight (kg)</label>
          <input type="number" value={form.booking_weight_kg} onChange={handleFormChange("booking_weight_kg")} />
        </div>
        <div>
          <label>HIV Status</label>
          <select value={form.hiv_status} onChange={handleFormChange("hiv_status")}>
            <option value="UNKNOWN">Unknown</option>
            <option value="POSITIVE">Positive</option>
            <option value="NEGATIVE">Negative</option>
          </select>
        </div>
        <div>
          <label>
            <input type="checkbox" checked={form.high_risk} onChange={handleFormChange("high_risk")} />
            High Risk Pregnancy
          </label>
        </div>
        <div>
          <label>Risk Factors</label>
          <textarea value={form.risk_factors} onChange={handleFormChange("risk_factors")} />
        </div>
        <button type="submit" disabled={submitting || !selectedPatient}>
          {submitting ? "Registering..." : "Register ANC"}
        </button>
      </form>

      <h2>Registered Pregnancies</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ANC #</th>
              <th>Mother</th>
              <th>Hospital #</th>
              <th>Gravida/Para</th>
              <th>EDD</th>
              <th>Gestation (weeks)</th>
              <th>High Risk</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => (
              <tr key={p.id}>
                <td>{p.anc_number}</td>
                <td>{p.mother_name}</td>
                <td>{p.hospital_number}</td>
                <td>{p.gravida}/{p.para}</td>
                <td>{p.edd}</td>
                <td>{p.gestational_age_weeks}</td>
                <td>{p.high_risk ? "Yes" : "No"}</td>
                <td>{p.status}</td>
                <td><Link to={`/mch/antenatal/${p.id}`}>View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}