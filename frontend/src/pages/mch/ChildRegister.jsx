import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPatients, getChildren, registerChild } from "../../services/api";

export default function ChildRegister() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [motherQuery, setMotherQuery] = useState("");
  const [motherResults, setMotherResults] = useState([]);
  const [selectedMother, setSelectedMother] = useState(null);

  const [form, setForm] = useState({
    full_name: "", sex: "MALE", date_of_birth: "",
    birth_weight_kg: "", birth_length_cm: "", apgar_score_1min: "", apgar_score_5min: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    setLoading(true);
    try {
      const data = await getChildren({ page_size: 100 });
      setChildren(data.results ?? data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMotherSearch = async (e) => {
    e.preventDefault();
    if (!motherQuery.trim()) return;
    try {
      const data = await getPatients({ search: motherQuery });
      setMotherResults(data.results ?? data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFormChange = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMother) {
      setError("Please select the mother first.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await registerChild({ mother: selectedMother.id, ...form });
      setSelectedMother(null);
      setMotherQuery("");
      setMotherResults([]);
      setForm({ full_name: "", sex: "MALE", date_of_birth: "", birth_weight_kg: "", birth_length_cm: "", apgar_score_1min: "", apgar_score_5min: "" });
      loadChildren();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Child Records</h1>
      {error && <p>Error: {error}</p>}

      <h2>Register Child</h2>
      <form onSubmit={handleMotherSearch}>
        <input type="text" placeholder="Search mother by name / hospital number" value={motherQuery} onChange={(e) => setMotherQuery(e.target.value)} />
        <button type="submit">Search</button>
      </form>

      {motherResults.length > 0 && (
        <ul>
          {motherResults.map((p) => (
            <li key={p.id}>
              {p.full_name} — {p.hospital_number}{" "}
              <button type="button" onClick={() => setSelectedMother(p)}>Select</button>
            </li>
          ))}
        </ul>
      )}

      {selectedMother && <p>Mother: <strong>{selectedMother.full_name}</strong> ({selectedMother.hospital_number})</p>}

      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Child's name (optional)" value={form.full_name} onChange={handleFormChange("full_name")} />
        <select value={form.sex} onChange={handleFormChange("sex")}>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
        </select>
        <input type="date" value={form.date_of_birth} onChange={handleFormChange("date_of_birth")} required />
        <input type="number" placeholder="Birth weight (kg)" value={form.birth_weight_kg} onChange={handleFormChange("birth_weight_kg")} />
        <input type="number" placeholder="Birth length (cm)" value={form.birth_length_cm} onChange={handleFormChange("birth_length_cm")} />
        <input type="number" placeholder="Apgar 1 min" value={form.apgar_score_1min} onChange={handleFormChange("apgar_score_1min")} />
        <input type="number" placeholder="Apgar 5 min" value={form.apgar_score_5min} onChange={handleFormChange("apgar_score_5min")} />
        <button type="submit" disabled={submitting || !selectedMother}>
          {submitting ? "Registering..." : "Register Child"}
        </button>
      </form>

      <h2>Registered Children</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr><th>Child #</th><th>Name</th><th>Mother</th><th>Sex</th><th>DOB</th><th>Age (months)</th><th></th></tr>
          </thead>
          <tbody>
            {children.map((c) => (
              <tr key={c.id}>
                <td>{c.child_number}</td>
                <td>{c.full_name || "—"}</td>
                <td>{c.mother_name}</td>
                <td>{c.sex}</td>
                <td>{c.date_of_birth}</td>
                <td>{c.age_months}</td>
                <td><Link to={`/mch/children/${c.id}`}>View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}