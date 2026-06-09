/* ============================================================
   <diamonde-abaque> — Calculateur d'abaque pour diamonde.fr
   Web Component (Custom Element + Shadow DOM)

   Intégration Webflow :
     <script src="https://CDN/diamonde-abaque.js" defer></script>
     <diamonde-abaque></diamonde-abaque>

   Isolation totale CSS / JS vis-à-vis du site hôte.
   Vanilla JS, aucune dépendance.
   ============================================================ */
(function () {
  "use strict";

  /* ----------------------------------------------------------
     Matériaux : nom -> [HF_Coeficiant_Effort, HF_Emoy]
     - HF_Coeficiant_Effort = "mater" (1er élément)
     - HF_Emoy              = valeur cible (2e élément)
     ---------------------------------------------------------- */
  var MATERIALS = {
    "ABEBAY": [1.3, 0.2],
    "ABETE": [0.8, 0.22],
    "ABETE COMUN": [0.8, 0.22],
    "ACAJOU BASSAM": [1.5, 0.18],
    "ACAJOU BLANC": [1.5, 0.18],
    "ACAJOU D'AFRIQUE": [1.5, 0.18],
    "AFRICAN MAHOGANY": [1.5, 0.18],
    "AHAFO": [1.5, 0.18],
    "AKOGA": [2.1, 0.17],
    "AKUK": [1.5, 0.18],
    "ALAMO": [0.7, 0.22],
    "ASSENG-ASSIE": [1.3, 0.2],
    "ASSI": [1.3, 0.2],
    "AZOBE": [2.1, 0.17],
    "BAKELITE": [2.5, 0.05],
    "BOKOI": [1.3, 0.2],
    "BONGOSSI": [2.1, 0.17],
    "BONKOLE": [2.1, 0.17],
    "CAOBA DEL GALON": [1.5, 0.18],
    "CAPA DE TABACO": [1.6, 0.18],
    "CHENE": [1.4, 0.18],
    "COTTONWOOD": [0.7, 0.22],
    "COUATARI": [1.6, 0.18],
    "DEKE": [1.5, 0.18],
    "EBA": [2.1, 0.17],
    "EICHE": [1.4, 0.18],
    "EKI": [2.1, 0.17],
    "EKKI": [2.1, 0.17],
    "ERI KIRE": [1.5, 0.18],
    "ETERNIT": [2, 0.12],
    "FIR": [0.8, 0.22],
    "HDF": [2.5, 0.12],
    "HEAVY AFRICAN MAHOGANY": [1.5, 0.18],
    "HENDUI": [2.1, 0.17],
    "HETRE": [1, 0.21],
    "HPL": [2.7, 0.09],
    "IMBIREMA": [1.6, 0.18],
    "INGIPIPA": [1.6, 0.18],
    "INGUIPIPA": [1.6, 0.18],
    "KAJU": [1.5, 0.18],
    "KAKU": [2.1, 0.17],
    "KALUNGI": [1.3, 0.2],
    "KHAYA MAHOGANI": [1.5, 0.18],
    "KOFYO": [2.1, 0.17],
    "KRALA": [1.5, 0.18],
    "LIBOYO": [1.3, 0.2],
    "MAHO CIGARE": [1.6, 0.18],
    "MANGONA": [1.5, 0.18],
    "MDF": [2.5, 0.13],
    "MUFUMBI": [1.3, 0.2],
    "MUNYAMA": [1.5, 0.18],
    "N'DOLA": [1.5, 0.18],
    "N'GOLLON": [1.5, 0.18],
    "NIANGON": [1.2, 0.19],
    "NIANKOM": [1.2, 0.19],
    "OAK": [1.4, 0.18],
    "OGOUE": [1.2, 0.19],
    "OGWANGO": [1.5, 0.18],
    "OKOKA": [2.1, 0.17],
    "PANNEAU PARTICULE": [1.2, 0.15],
    "PAPPEL": [0.7, 0.22],
    "PEUPLIER": [0.7, 0.22],
    "PIN MARITIME": [0.8, 0.22],
    "PIN SYLVESTRE": [0.8, 0.22],
    "PIOPPO": [0.7, 0.22],
    "POPLAR": [0.7, 0.22],
    "QUERCIA": [1.4, 0.18],
    "ROBLE": [1.4, 0.18],
    "SAPIN": [0.8, 0.22],
    "SIPO": [1.3, 0.2],
    "TABARI": [1.6, 0.18],
    "TAKORADY MAHOGANY": [1.5, 0.18],
    "TAMPIPIO": [1.6, 0.18],
    "TANNE": [0.8, 0.22],
    "TAUARI": [1.6, 0.18],
    "UNDIA NUNU": [1.5, 0.18],
    "UTILE": [1.3, 0.2],
    "WADARA": [1.6, 0.18],
    "WHISMORE": [1.2, 0.19],
    "YAMI": [1.2, 0.19],
    "ZAMANGUILA": [1.5, 0.18]
  };

  var DEFAULTS = {
    diametre: 120,
    nombre_coupe: 2,
    angle_coupe: 25,
    materiaux: "ABEBAY",
    taux_humidite: 12,
    frequence_rotation: 6000,
    vitesse_avance: 12,
    prise_passe: 6,
    epaisseur_usinage: 50
  };

  var NUMERIC_FIELDS = [
    "diametre", "nombre_coupe", "angle_coupe", "taux_humidite",
    "frequence_rotation", "vitesse_avance", "prise_passe", "epaisseur_usinage"
  ];

  /* ----------------------------------------------------------
     Calculs (formules exactes du cahier des charges)
     ---------------------------------------------------------- */
  function compute(v) {
    var Ø  = v.diametre;
    var Z  = v.nombre_coupe;
    var γ  = v.angle_coupe;
    var H  = v.taux_humidite;
    var N  = v.frequence_rotation;
    var Vf = v.vitesse_avance;
    var ap = v.prise_passe;
    var ae = v.epaisseur_usinage;

    var matData = MATERIALS[v.materiaux] || [0, 0];
    var mater = matData[0];
    var cible = matData[1];

    var coeff_angle =
      (-0.0041666667 * Math.pow(γ, 3)
        + 0.5 * Math.pow(γ, 2)
        - 20.0833 * γ
        + 335) / 70.001;

    var coeff_humid =
      (-2.945e-7 * Math.pow(H, 4))
      + 0.00004223 * Math.pow(H, 3)
      - (0.001869 * Math.pow(H, 2))
      + (0.01808 * H)
      + 0.9762;

    var fz = (Vf * 1000) / (Z * N);
    var emoy = ((Vf * 1000) / (Z * N)) * Math.sqrt(ap / Ø);
    var vc = (Math.PI * Ø * N) / 60000;
    var ondu = (fz * fz) / (4 * Ø);

    var effort =
      (111.11111 * emoy + 44.44444)
      * (ae / 10)
      * coeff_angle
      * coeff_humid
      * mater;

    var puissance =
      (Z * effort * Math.sqrt((ap / 1000) * (Ø / 1000)) * N / 60 / 1000) / 0.665;

    return {
      cible: cible, emoy: emoy, fz: fz, vc: vc, ondu: ondu,
      puissance: puissance
    };
  }

  /* ----------------------------------------------------------
     Styles scopés au Shadow DOM
     ---------------------------------------------------------- */
  var CSS = `
    :host {
      /* Reset des propriétés héritables (font, color, line-height)
         pour empêcher l'host page de fuiter dans le widget. */
      display: block;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
                   Helvetica, Arial, sans-serif;
      font-size: 16px;
      font-weight: 400;
      line-height: 1.5;
      color: #0f172a;
      text-align: left;
      letter-spacing: normal;
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;

      /* Palette */
      --navy: #1a3856;
      --navy-dark: #122a42;
      --orange: #f57a00;
      --orange-dark: #d96c00;
      --ink: #0f172a;
      --ink-soft: #475569;
      --ink-muted: #94a3b8;
      --line: #e2e8f0;
      --bg: #f4f5f7;
      --surface: #ffffff;
      --surface-soft: #f8fafc;
      --radius: 14px;
      --radius-sm: 10px;
      --shadow: 0 1px 3px rgba(15, 23, 42, 0.06),
                0 8px 24px rgba(15, 23, 42, 0.05);
    }

    *, *::before, *::after { box-sizing: border-box; }

    .app {
      max-width: 980px;
      margin: 0 auto;
      padding: 28px 20px;
      background: transparent;
    }

    /* ---------- Card ---------- */
    .card {
      background: var(--bg);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      padding: 32px;
    }

    /* ---------- Layout 2 colonnes ---------- */
    .layout {
      display: grid;
      grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
      gap: 36px;
      align-items: start;
    }
    .panel__title {
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 20px;
      color: var(--ink);
      letter-spacing: -0.01em;
    }
    .panel--results { position: sticky; top: 16px; }

    /* Grille interne du panneau données : matériau en pleine largeur,
       puis paires de champs. */
    .fields {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px 18px;
    }
    .fields .field--full { grid-column: 1 / -1; }

    /* ---------- Fields ---------- */
    .field { margin: 0; }
    .field__label {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: var(--ink);
      margin-bottom: 8px;
    }
    .field__input {
      width: 100%;
      font-family: inherit;
      font-size: 15px;
      color: var(--ink);
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: var(--radius-sm);
      padding: 12px 14px;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
      -webkit-appearance: none;
      appearance: none;
      margin: 0;
    }
    .field__input:focus {
      outline: none;
      border-color: var(--navy);
      box-shadow: 0 0 0 3px rgba(26, 56, 86, 0.12);
    }
    .field__select {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 14px center;
      padding-right: 40px;
      cursor: pointer;
    }
    .field__hint {
      font-size: 13px;
      color: var(--ink-muted);
      margin: 6px 0 0;
    }
    .field__error {
      font-size: 13px;
      color: var(--orange-dark);
      margin: 6px 0 0;
      display: none;
    }
    .field.has-error .field__input { border-color: var(--orange); }
    .field.has-error .field__input:focus {
      box-shadow: 0 0 0 3px rgba(245, 122, 0, 0.15);
    }
    .field.has-error .field__error { display: block; }

    /* ---------- Buttons ---------- */
    .actions {
      display: flex;
      justify-content: flex-start;
      margin-top: 24px;
    }
    .btn {
      font-family: inherit;
      font-size: 14px;
      font-weight: 600;
      border-radius: var(--radius-sm);
      padding: 10px 18px;
      cursor: pointer;
      border: 1px solid var(--line);
      background: var(--surface);
      color: var(--ink);
      transition: background 0.15s ease, border-color 0.15s ease, transform 0.05s ease;
      line-height: 1.2;
    }
    .btn:hover { background: var(--surface-soft); border-color: var(--ink-muted); }
    .btn:active { transform: translateY(1px); }

    /* ---------- Results ---------- */
    .results { display: flex; flex-direction: column; }
    .result {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      padding: 18px 0;
      border-bottom: 1px solid var(--line);
    }
    .result:last-child { border-bottom: none; }
    .result__info { flex: 1; min-width: 0; }
    .result__label { font-size: 15px; font-weight: 600; color: var(--ink); margin: 0 0 4px; }
    .result__desc { font-size: 13px; color: var(--ink-muted); margin: 0; }
    .result__value {
      font-size: 20px;
      font-weight: 700;
      color: var(--ink);
      margin: 0;
      white-space: nowrap;
      flex: 0 0 auto;
    }
    .result__unit { font-size: 13px; font-weight: 500; color: var(--ink-muted); }

    /* ---------- Responsive ---------- */
    @media (max-width: 820px) {
      .layout {
        grid-template-columns: 1fr;
        gap: 28px;
      }
      .panel--results {
        position: static;
        padding-top: 24px;
        border-top: 1px solid var(--line);
      }
    }
    @media (max-width: 540px) {
      .app { padding: 22px 16px; }
      .card { padding: 22px 18px; }
      .fields { grid-template-columns: 1fr; gap: 14px; }
      .result__value { font-size: 18px; }
      .result__desc { display: none; }
    }
  `;

  /* ----------------------------------------------------------
     Markup
     ---------------------------------------------------------- */
  var TEMPLATE = `
    <div class="app" part="app">
      <section class="card">
        <div class="layout" data-ref="form">

          <!-- Colonne Données -->
          <div class="panel panel--data">
            <h2 class="panel__title">Données</h2>

            <div class="fields">
              <div class="field field--full" data-field="materiaux">
                <label class="field__label" for="abq-materiaux">Matériau</label>
                <select class="field__input field__select" id="abq-materiaux" data-name="materiaux"></select>
              </div>

              <div class="field" data-field="diametre">
                <label class="field__label" for="abq-diametre">Diamètre Ø (mm)</label>
                <input class="field__input" type="number" id="abq-diametre" data-name="diametre" inputmode="decimal" step="any" min="0" />
                <p class="field__error"></p>
              </div>

              <div class="field" data-field="nombre_coupe">
                <label class="field__label" for="abq-nombre_coupe">Nombre de dents Z</label>
                <input class="field__input" type="number" id="abq-nombre_coupe" data-name="nombre_coupe" inputmode="numeric" step="1" min="1" />
                <p class="field__error"></p>
              </div>

              <div class="field" data-field="angle_coupe">
                <label class="field__label" for="abq-angle_coupe">Angle de coupe γ (°)</label>
                <input class="field__input" type="number" id="abq-angle_coupe" data-name="angle_coupe" inputmode="decimal" step="any" />
                <p class="field__error"></p>
              </div>

              <div class="field" data-field="taux_humidite">
                <label class="field__label" for="abq-taux_humidite">Taux d'humidité (%)</label>
                <input class="field__input" type="number" id="abq-taux_humidite" data-name="taux_humidite" inputmode="decimal" step="any" min="0" />
                <p class="field__error"></p>
              </div>

              <div class="field" data-field="frequence_rotation">
                <label class="field__label" for="abq-frequence_rotation">Vitesse de rotation N (tr/min)</label>
                <input class="field__input" type="number" id="abq-frequence_rotation" data-name="frequence_rotation" inputmode="numeric" step="any" min="0" />
                <p class="field__error"></p>
              </div>

              <div class="field" data-field="vitesse_avance">
                <label class="field__label" for="abq-vitesse_avance">Vitesse d'avance Vf (m/min)</label>
                <input class="field__input" type="number" id="abq-vitesse_avance" data-name="vitesse_avance" inputmode="decimal" step="any" min="0" />
                <p class="field__error"></p>
              </div>

              <div class="field" data-field="prise_passe">
                <label class="field__label" for="abq-prise_passe">Profondeur de passe ap (mm)</label>
                <input class="field__input" type="number" id="abq-prise_passe" data-name="prise_passe" inputmode="decimal" step="any" min="0" />
                <p class="field__error"></p>
              </div>

              <div class="field" data-field="epaisseur_usinage">
                <label class="field__label" for="abq-epaisseur_usinage">Épaisseur usinée ae (mm)</label>
                <input class="field__input" type="number" id="abq-epaisseur_usinage" data-name="epaisseur_usinage" inputmode="decimal" step="any" min="0" />
                <p class="field__error"></p>
              </div>
            </div>

            <div class="actions">
              <button type="button" class="btn" data-action="reset">Réinitialiser</button>
            </div>
          </div>

          <!-- Colonne Résultats -->
          <div class="panel panel--results">
            <h2 class="panel__title">Résultats</h2>

            <div class="results">
              <div class="result">
                <div class="result__info">
                  <p class="result__label">Épaisseur de copeau cible (Emoy)</p>
                  <p class="result__desc">L'épaisseur moyenne de copeau recommandée pour le matériau sélectionné</p>
                </div>
                <p class="result__value"><span data-result="cible">–</span> <span class="result__unit">mm</span></p>
              </div>

              <div class="result">
                <div class="result__info">
                  <p class="result__label">Épaisseur de copeau calculée (Emoy)</p>
                  <p class="result__desc">L'épaisseur moyenne de copeau réelle basée sur vos paramètres d'usinage</p>
                </div>
                <p class="result__value"><span data-result="emoy">–</span> <span class="result__unit">mm</span></p>
              </div>

              <div class="result">
                <div class="result__info">
                  <p class="result__label">Avance par dent (fz)</p>
                  <p class="result__desc">La distance d'avance de l'outil pour chaque arête de coupe</p>
                </div>
                <p class="result__value"><span data-result="fz">–</span> <span class="result__unit">mm</span></p>
              </div>

              <div class="result">
                <div class="result__info">
                  <p class="result__label">Vitesse de coupe (Vc)</p>
                  <p class="result__desc">La vitesse à laquelle l'arête de coupe traverse le matériau</p>
                </div>
                <p class="result__value"><span data-result="vc">–</span> <span class="result__unit">m/s</span></p>
              </div>

              <div class="result">
                <div class="result__info">
                  <p class="result__label">Ondulation de surface (O)</p>
                  <p class="result__desc">L'ondulation théorique de la finition de surface</p>
                </div>
                <p class="result__value"><span data-result="ondu">–</span> <span class="result__unit">mm</span></p>
              </div>

              <div class="result">
                <div class="result__info">
                  <p class="result__label">Puissance requise (P)</p>
                  <p class="result__desc">La puissance estimée nécessaire pour cette opération d'usinage</p>
                </div>
                <p class="result__value"><span data-result="puissance">–</span> <span class="result__unit">kW</span></p>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  `;

  /* ----------------------------------------------------------
     Custom Element
     ---------------------------------------------------------- */
  class DiamondeAbaque extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
      if (this._mounted) return;
      this._mounted = true;

      this.shadowRoot.innerHTML = "<style>" + CSS + "</style>" + TEMPLATE;

      this._state = {};
      this._refs = {
        form:      this.shadowRoot.querySelector('[data-ref="form"]'),
        matSelect: this.shadowRoot.querySelector('[data-name="materiaux"]')
      };

      this._buildMaterialSelect();
      this._loadDefaults();
      this._writeStateToDom();
      this._bindEvents();
      this._update();
    }

    /* ---------------- helpers ---------------- */
    _$(name) { return this.shadowRoot.querySelector('[data-name="' + name + '"]'); }
    _fieldWrap(name) { return this.shadowRoot.querySelector('[data-field="' + name + '"]'); }

    /* ---------------- state ---------------- */
    _loadDefaults() {
      this._state = {};
      for (var k in DEFAULTS) {
        if (DEFAULTS.hasOwnProperty(k)) this._state[k] = DEFAULTS[k];
      }
    }
    _writeStateToDom() {
      var self = this;
      Object.keys(DEFAULTS).forEach(function (k) {
        var el = self._$(k);
        if (el) el.value = self._state[k];
      });
    }
    _readField(k) {
      var el = this._$(k);
      if (!el) return;
      if (k === "materiaux") this._state[k] = el.value;
      else this._state[k] = el.value === "" ? "" : parseFloat(el.value);
    }
    _readAll() {
      var self = this;
      Object.keys(DEFAULTS).forEach(function (k) { self._readField(k); });
    }

    /* ---------------- matériaux ---------------- */
    _buildMaterialSelect() {
      var frag = document.createDocumentFragment();
      Object.keys(MATERIALS).forEach(function (name) {
        var opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        frag.appendChild(opt);
      });
      this._refs.matSelect.appendChild(frag);
    }

    /* ---------------- validation ---------------- */
    _setError(k, msg) {
      var wrap = this._fieldWrap(k);
      if (!wrap) return;
      var errEl = wrap.querySelector(".field__error");
      if (msg) {
        wrap.classList.add("has-error");
        if (errEl) errEl.textContent = msg;
      } else {
        wrap.classList.remove("has-error");
        if (errEl) errEl.textContent = "";
      }
    }
    /**
     * Valide tous les champs numériques.
     * - Champs vides : aucune erreur affichée (saisie en cours), mais
     *   le calcul est bloqué.
     * - Valeurs non numériques ou hors bornes : erreur affichée.
     */
    _validateAll() {
      var ok = true;
      var self = this;
      NUMERIC_FIELDS.forEach(function (k) {
        var el = self._$(k);
        var raw = el.value.trim();
        if (raw === "") { self._setError(k, ""); ok = false; return; }
        var num = parseFloat(raw);
        if (isNaN(num)) {
          self._setError(k, "Valeur numérique attendue.");
          ok = false; return;
        }
        if ((k === "diametre" || k === "frequence_rotation" || k === "nombre_coupe") && num <= 0) {
          self._setError(k, "Doit être supérieur à 0.");
          ok = false; return;
        }
        if (num < 0) {
          self._setError(k, "Valeur négative.");
          ok = false; return;
        }
        self._setError(k, "");
      });
      return ok;
    }

    /* ---------------- rendu résultats ---------------- */
    _fmt(n) { return isFinite(n) ? n.toFixed(2) : "–"; }
    _renderResults(r) {
      var self = this;
      ["cible", "emoy", "fz", "vc", "ondu", "puissance"].forEach(function (k) {
        var el = self.shadowRoot.querySelector('[data-result="' + k + '"]');
        if (!el) return;
        el.textContent = r ? self._fmt(r[k]) : "–";
      });
    }

    /* ---------------- recalcul live ---------------- */
    _update() {
      this._readAll();
      var ok = this._validateAll();
      this._renderResults(ok ? compute(this._state) : null);
    }

    /* ---------------- reset ---------------- */
    _reset() {
      var self = this;
      NUMERIC_FIELDS.forEach(function (k) {
        var el = self._$(k);
        if (el) el.value = "";
        self._state[k] = "";
        self._setError(k, "");
      });
      this._renderResults(null);
    }

    /* ---------------- événements ---------------- */
    _bindEvents() {
      var self = this;
      this._refs.form.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-action]");
        if (!btn) return;
        e.preventDefault();
        if (btn.dataset.action === "reset") self._reset();
      });

      NUMERIC_FIELDS.forEach(function (k) {
        var el = self._$(k);
        if (!el) return;
        el.addEventListener("input", function () { self._update(); });
      });
      this._refs.matSelect.addEventListener("change", function () { self._update(); });
    }
  }

  if (!customElements.get("diamonde-abaque")) {
    customElements.define("diamonde-abaque", DiamondeAbaque);
  }
})();
