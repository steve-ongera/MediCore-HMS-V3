import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getChild, administerImmunization, createGrowthRecord } from "../../services/api";

export default function ChildDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [batchNumber, setBatchNumber] = useState({});
  const [growthForm, setGrowthForm] = useState({
    weight_kg: "", height_cm: "", muac_cm: "", nutrition_status: "NORMAL", notes: "",
  });

  useEffect(() => {
    load();
  }, [id]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getChild(id);
      setChild(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminister = async (immunizationId) => {
    try {
      await administerImmunization(immunizationId, { batch_number: batchNumber[immunizationId] || "" });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGrowthChange = (field) => (e) => setGrowthForm((p) => ({ ...p, [field]: e.target.value }));

  const submitGrowth = async (e) => {
    e.preventDefault();
    try {
      await createGrowthRecord({ child: id, ...growthForm });
      setGrowthForm({ weight_kg: "", height_cm: "", muac_cm: "", nutrition_status: "NORMAL", notes: "" });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!child) return null;

  return (
    <div>
      <button type="button" onClick={() => navigate("/mch/children")}>&larr; Back</button>
      <h1>{child.child_number}</h1>
      {error && <p>Error: {error}</p>}

      <section>
        <p>Name: {child.full_name || "Not yet named"}</p>
        <p>Mother: {child.mother_name} ({child.mother_hospital_number})</p>
        <p>Sex: {child.sex}</p>
        <p>Date of Birth: {child.date_of_birth} — Age: {child.age_months} months</p>
        <p>Birth Weight: {child.birth_weight_kg} kg — Birth Length: {child.birth_length_cm} cm</p>
        <p>Apgar Scores: {child.apgar_score_1min} (1 min) / {child.apgar_score_5min} (5 min)</p>
      </section>

      <section>
        <h2>Immunization Schedule</h2>
        <table>
          <thead>
            <tr><th>Vaccine</th><th>Due Date</th><th>Status</th><th>Given Date</th><th>Batch #</th><th></th></tr>
          </thead>
          <tbody>
            {(child.immunizations || []).map((imm) => (
              <tr key={imm.id}>
                <td>{imm.vaccine_name}</td>
                <td>{imm.due_date}</td>
                <td>{imm.status}</td>
                <td>{imm.given_date || "—"}</td>
                <td>
                  {imm.status === "DUE" ? (
                    <input
                      type="text"
                      placeholder="Batch #"
                      value={batchNumber[imm.id] || ""}
                      onChange={(e) => setBatchNumber((p) => ({ ...p, [imm.id]: e.target.value }))}
                    />
                  ) : (
                    imm.batch_number || "—"
                  )}
                </td>
                <td>
                  {imm.status === "DUE" && (
                    <button type="button" onClick={() => handleAdminister(imm.id)}>Mark Given</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Record Growth</h2>
        <form onSubmit={submitGrowth}>
          <input type="number" placeholder="Weight (kg)" value={growthForm.weight_kg} onChange={handleGrowthChange("weight_kg")} />
          <input type="number" placeholder="Height (cm)" value={growthForm.height_cm} onChange={handleGrowthChange("height_cm")} />
          <input type="number" placeholder="MUAC (cm)" value={growthForm.muac_cm} onChange={handleGrowthChange("muac_cm")} />
          <select value={growthForm.nutrition_status} onChange={handleGrowthChange("nutrition_status")}>
            <option value="NORMAL">Normal</option>
            <option value="MODERATE_MALNUTRITION">Moderate Malnutrition</option>
            <option value="SEVERE_MALNUTRITION">Severe Malnutrition</option>
            <option value="OVERWEIGHT">Overweight</option>
          </select>
          <textarea placeholder="Notes" value={growthForm.notes} onChange={handleGrowthChange("notes")} />
          <button type="submit">Save Growth Record</button>
        </form>
      </section>

      <section>
        <h2>Growth History</h2>
        <table>
          <thead><tr><th>Date</th><th>Weight</th><th>Height</th><th>MUAC</th><th>Status</th></tr></thead>
          <tbody>
            {(child.growth_records || []).map((g) => (
              <tr key={g.id}>
                <td>{new Date(g.recorded_at).toLocaleDateString()}</td>
                <td>{g.weight_kg}</td>
                <td>{g.height_cm}</td>
                <td>{g.muac_cm}</td>
                <td>{g.nutrition_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}