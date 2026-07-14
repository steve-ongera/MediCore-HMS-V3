import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getAntenatalProfile, createANCVisit, recordDelivery, createPostnatalVisit,
} from "../../services/api";

export default function ANCProfileDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [ancForm, setAncForm] = useState({
    gestational_age_weeks: "", weight_kg: "", bp_systolic: "", bp_diastolic: "",
    fundal_height_cm: "", fetal_heartbeat_bpm: "", fetal_presentation: "",
    urinalysis: "", hemoglobin_level: "", notes: "", next_appointment: "",
  });

  const [deliveryForm, setDeliveryForm] = useState({
    delivery_date: "", mode_of_delivery: "SVD", outcome: "LIVE_BIRTH",
    place_of_delivery: "Facility", complications: "", blood_loss_ml: "",
    child_full_name: "", child_sex: "MALE", birth_weight_kg: "",
    birth_length_cm: "", apgar_score_1min: "", apgar_score_5min: "",
  });

  const [pncForm, setPncForm] = useState({
    visit_day: "", mother_bp_systolic: "", mother_bp_diastolic: "", mother_temp_c: "",
    lochia_assessment: "", breastfeeding_status: "", child_weight_kg: "", child_temp_c: "", notes: "",
  });

  useEffect(() => {
    load();
  }, [id]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAntenatalProfile(id);
      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAncChange = (field) => (e) => setAncForm((p) => ({ ...p, [field]: e.target.value }));
  const handleDeliveryChange = (field) => (e) => setDeliveryForm((p) => ({ ...p, [field]: e.target.value }));
  const handlePncChange = (field) => (e) => setPncForm((p) => ({ ...p, [field]: e.target.value }));

  const submitAncVisit = async (e) => {
    e.preventDefault();
    try {
      await createANCVisit({ profile: id, ...ancForm });
      setAncForm({
        gestational_age_weeks: "", weight_kg: "", bp_systolic: "", bp_diastolic: "",
        fundal_height_cm: "", fetal_heartbeat_bpm: "", fetal_presentation: "",
        urinalysis: "", hemoglobin_level: "", notes: "", next_appointment: "",
      });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const submitDelivery = async (e) => {
    e.preventDefault();
    try {
      const result = await recordDelivery(id, {
        ...deliveryForm,
        blood_loss_ml: deliveryForm.blood_loss_ml || undefined,
        birth_weight_kg: deliveryForm.birth_weight_kg || undefined,
        birth_length_cm: deliveryForm.birth_length_cm || undefined,
        apgar_score_1min: deliveryForm.apgar_score_1min || undefined,
        apgar_score_5min: deliveryForm.apgar_score_5min || undefined,
      });
      if (result.child) {
        navigate(`/mch/children/${result.child.id}`);
        return;
      }
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const submitPnc = async (e) => {
    e.preventDefault();
    try {
      await createPostnatalVisit({ profile: id, ...pncForm });
      setPncForm({
        visit_day: "", mother_bp_systolic: "", mother_bp_diastolic: "", mother_temp_c: "",
        lochia_assessment: "", breastfeeding_status: "", child_weight_kg: "", child_temp_c: "", notes: "",
      });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!profile) return null;

  const isActive = profile.status === "ACTIVE";

  return (
    <div>
      <button type="button" onClick={() => navigate("/mch/antenatal")}>&larr; Back</button>
      <h1>{profile.anc_number}</h1>
      {error && <p>Error: {error}</p>}

      <section>
        <p>Mother: {profile.mother_name} ({profile.hospital_number})</p>
        <p>Gravida/Para: {profile.gravida}/{profile.para}</p>
        <p>LMP: {profile.lmp} — EDD: {profile.edd} — Gestation: {profile.gestational_age_weeks} weeks</p>
        <p>Blood Group: {profile.blood_group} — HIV: {profile.hiv_status}</p>
        <p>High Risk: {profile.high_risk ? "Yes" : "No"} {profile.risk_factors && `(${profile.risk_factors})`}</p>
        <p>Status: {profile.status}</p>
      </section>

      {isActive && (
        <section>
          <h2>Record ANC Visit</h2>
          <form onSubmit={submitAncVisit}>
            <input type="number" placeholder="Gestational age (weeks)" value={ancForm.gestational_age_weeks} onChange={handleAncChange("gestational_age_weeks")} />
            <input type="number" placeholder="Weight (kg)" value={ancForm.weight_kg} onChange={handleAncChange("weight_kg")} />
            <input type="number" placeholder="BP Systolic" value={ancForm.bp_systolic} onChange={handleAncChange("bp_systolic")} />
            <input type="number" placeholder="BP Diastolic" value={ancForm.bp_diastolic} onChange={handleAncChange("bp_diastolic")} />
            <input type="number" placeholder="Fundal height (cm)" value={ancForm.fundal_height_cm} onChange={handleAncChange("fundal_height_cm")} />
            <input type="number" placeholder="Fetal heartbeat (bpm)" value={ancForm.fetal_heartbeat_bpm} onChange={handleAncChange("fetal_heartbeat_bpm")} />
            <input type="text" placeholder="Fetal presentation" value={ancForm.fetal_presentation} onChange={handleAncChange("fetal_presentation")} />
            <input type="text" placeholder="Urinalysis" value={ancForm.urinalysis} onChange={handleAncChange("urinalysis")} />
            <input type="number" placeholder="Hemoglobin level" value={ancForm.hemoglobin_level} onChange={handleAncChange("hemoglobin_level")} />
            <textarea placeholder="Notes" value={ancForm.notes} onChange={handleAncChange("notes")} />
            <input type="date" placeholder="Next appointment" value={ancForm.next_appointment} onChange={handleAncChange("next_appointment")} />
            <button type="submit">Save ANC Visit</button>
          </form>
        </section>
      )}

      <section>
        <h2>ANC Visit History</h2>
        <table>
          <thead>
            <tr><th>#</th><th>Weeks</th><th>Weight</th><th>BP</th><th>FHR</th><th>Next Appt</th></tr>
          </thead>
          <tbody>
            {(profile.visits || []).map((v) => (
              <tr key={v.id}>
                <td>{v.visit_number}</td>
                <td>{v.gestational_age_weeks}</td>
                <td>{v.weight_kg}</td>
                <td>{v.bp_systolic}/{v.bp_diastolic}</td>
                <td>{v.fetal_heartbeat_bpm}</td>
                <td>{v.next_appointment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {isActive && (
        <section>
          <h2>Record Delivery</h2>
          <form onSubmit={submitDelivery}>
            <input type="datetime-local" value={deliveryForm.delivery_date} onChange={handleDeliveryChange("delivery_date")} required />
            <select value={deliveryForm.mode_of_delivery} onChange={handleDeliveryChange("mode_of_delivery")}>
              <option value="SVD">Spontaneous Vaginal Delivery</option>
              <option value="ASSISTED">Assisted Vaginal Delivery</option>
              <option value="CAESAREAN">Caesarean Section</option>
              <option value="BREECH">Breech Delivery</option>
            </select>
            <select value={deliveryForm.outcome} onChange={handleDeliveryChange("outcome")}>
              <option value="LIVE_BIRTH">Live Birth</option>
              <option value="STILLBIRTH">Stillbirth</option>
            </select>
            <input type="text" placeholder="Place of delivery" value={deliveryForm.place_of_delivery} onChange={handleDeliveryChange("place_of_delivery")} />
            <textarea placeholder="Complications" value={deliveryForm.complications} onChange={handleDeliveryChange("complications")} />
            <input type="number" placeholder="Blood loss (ml)" value={deliveryForm.blood_loss_ml} onChange={handleDeliveryChange("blood_loss_ml")} />

            {deliveryForm.outcome === "LIVE_BIRTH" && (
              <>
                <h3>Baby Details</h3>
                <input type="text" placeholder="Baby's name (optional)" value={deliveryForm.child_full_name} onChange={handleDeliveryChange("child_full_name")} />
                <select value={deliveryForm.child_sex} onChange={handleDeliveryChange("child_sex")}>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
                <input type="number" placeholder="Birth weight (kg)" value={deliveryForm.birth_weight_kg} onChange={handleDeliveryChange("birth_weight_kg")} />
                <input type="number" placeholder="Birth length (cm)" value={deliveryForm.birth_length_cm} onChange={handleDeliveryChange("birth_length_cm")} />
                <input type="number" placeholder="Apgar 1 min" value={deliveryForm.apgar_score_1min} onChange={handleDeliveryChange("apgar_score_1min")} />
                <input type="number" placeholder="Apgar 5 min" value={deliveryForm.apgar_score_5min} onChange={handleDeliveryChange("apgar_score_5min")} />
              </>
            )}
            <button type="submit">Record Delivery</button>
          </form>
        </section>
      )}

      <section>
        <h2>Delivery History</h2>
        <table>
          <thead><tr><th>Delivery #</th><th>Date</th><th>Mode</th><th>Outcome</th></tr></thead>
          <tbody>
            {(profile.deliveries || []).map((d) => (
              <tr key={d.id}>
                <td>{d.delivery_number}</td>
                <td>{new Date(d.delivery_date).toLocaleString()}</td>
                <td>{d.mode_of_delivery}</td>
                <td>{d.outcome}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {profile.status === "DELIVERED" && (
        <section>
          <h2>Record Postnatal Visit</h2>
          <form onSubmit={submitPnc}>
            <input type="number" placeholder="Day post-delivery" value={pncForm.visit_day} onChange={handlePncChange("visit_day")} required />
            <input type="number" placeholder="Mother BP Systolic" value={pncForm.mother_bp_systolic} onChange={handlePncChange("mother_bp_systolic")} />
            <input type="number" placeholder="Mother BP Diastolic" value={pncForm.mother_bp_diastolic} onChange={handlePncChange("mother_bp_diastolic")} />
            <input type="number" placeholder="Mother Temp (°C)" value={pncForm.mother_temp_c} onChange={handlePncChange("mother_temp_c")} />
            <input type="text" placeholder="Lochia assessment" value={pncForm.lochia_assessment} onChange={handlePncChange("lochia_assessment")} />
            <input type="text" placeholder="Breastfeeding status" value={pncForm.breastfeeding_status} onChange={handlePncChange("breastfeeding_status")} />
            <input type="number" placeholder="Child weight (kg)" value={pncForm.child_weight_kg} onChange={handlePncChange("child_weight_kg")} />
            <input type="number" placeholder="Child Temp (°C)" value={pncForm.child_temp_c} onChange={handlePncChange("child_temp_c")} />
            <textarea placeholder="Notes" value={pncForm.notes} onChange={handlePncChange("notes")} />
            <button type="submit">Save PNC Visit</button>
          </form>
        </section>
      )}

      <section>
        <h2>Postnatal Visit History</h2>
        <table>
          <thead><tr><th>Day</th><th>Mother BP</th><th>Child Weight</th><th>Date</th></tr></thead>
          <tbody>
            {(profile.postnatal_visits || []).map((v) => (
              <tr key={v.id}>
                <td>{v.visit_day}</td>
                <td>{v.mother_bp_systolic}/{v.mother_bp_diastolic}</td>
                <td>{v.child_weight_kg}</td>
                <td>{new Date(v.visit_date).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}