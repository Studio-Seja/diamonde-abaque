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

  var RANGE_TOLERANCE = 0.20; // ±20 % défini par le client
  var MAX_STEP = 3;

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

    var ecart = cible > 0 ? Math.abs(emoy - cible) / cible : Infinity;

    return {
      cible: cible, emoy: emoy, fz: fz, vc: vc, ondu: ondu,
      puissance: puissance, inRange: ecart <= RANGE_TOLERANCE
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
      --success-bg: #ecfdf5;
      --success-border: #a7f3d0;
      --success-ink: #047857;
      --warning-bg: #fff4e6;
      --warning-border: #fcd9a8;
      --warning-ink: #b45309;
      --radius: 14px;
      --radius-sm: 10px;
      --shadow: 0 1px 3px rgba(15, 23, 42, 0.06),
                0 8px 24px rgba(15, 23, 42, 0.05);
    }

    *, *::before, *::after { box-sizing: border-box; }

    .app {
      max-width: 760px;
      margin: 0 auto;
      padding: 28px 20px;
      background: transparent;
    }

    /* ---------- Stepper ---------- */
    .stepper { margin-bottom: 24px; }
    .stepper__track {
      position: relative;
      height: 5px;
      border-radius: 999px;
      background: var(--line);
      overflow: hidden;
      margin-bottom: 18px;
    }
    .stepper__progress {
      position: absolute;
      inset: 0 auto 0 0;
      height: 100%;
      background: var(--navy);
      border-radius: 999px;
      transition: width 0.35s ease;
    }
    .stepper__steps {
      list-style: none;
      display: flex;
      justify-content: space-between;
      gap: 8px;
      margin: 0;
      padding: 0;
    }
    .stepper__step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      flex: 1;
      text-align: center;
      color: var(--ink-muted);
    }
    .stepper__bullet {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      border: 2px solid var(--line);
      background: var(--surface);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 15px;
      color: var(--ink-muted);
      transition: all 0.25s ease;
    }
    .stepper__label {
      font-size: 13px;
      font-weight: 500;
    }
    .stepper__step.is-active { color: var(--navy); }
    .stepper__step.is-active .stepper__bullet {
      background: var(--navy);
      border-color: var(--navy);
      color: #fff;
    }
    .stepper__step.is-done { color: var(--navy); }
    .stepper__step.is-done .stepper__bullet {
      background: var(--navy);
      border-color: var(--navy);
      color: #fff;
      font-size: 0;
    }
    .stepper__step.is-done .stepper__bullet::after {
      content: "";
      width: 11px;
      height: 6px;
      border-left: 2.5px solid #fff;
      border-bottom: 2.5px solid #fff;
      transform: rotate(-45deg) translateY(-1px);
    }

    /* ---------- Card ---------- */
    .card {
      background: var(--bg);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      padding: 32px;
    }
    .card__title {
      font-size: 20px;
      font-weight: 600;
      margin: 0 0 6px;
      color: var(--ink);
    }
    .card__desc {
      font-size: 14px;
      color: var(--ink-soft);
      margin: 0 0 24px;
    }

    /* ---------- Slides ---------- */
    .slide { display: none; }
    .slide.is-active { display: block; animation: fade 0.25s ease; }
    @keyframes fade {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ---------- Fields ---------- */
    .field { margin-bottom: 20px; }
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
      gap: 12px;
      margin-top: 28px;
    }
    .actions--end { justify-content: flex-end; }
    .actions--split { justify-content: space-between; }

    .btn {
      font-family: inherit;
      font-size: 15px;
      font-weight: 600;
      border-radius: var(--radius-sm);
      padding: 12px 22px;
      cursor: pointer;
      border: 1px solid transparent;
      transition: background 0.15s ease, border-color 0.15s ease, transform 0.05s ease;
      line-height: 1.2;
    }
    .btn:active { transform: translateY(1px); }
    .btn--primary { background: var(--navy); color: #fff; }
    .btn--primary:hover { background: var(--navy-dark); }
    .btn--accent { background: var(--orange); color: #fff; }
    .btn--accent:hover { background: var(--orange-dark); }
    .btn--ghost {
      background: var(--surface);
      color: var(--ink);
      border-color: var(--line);
    }
    .btn--ghost:hover { background: var(--surface-soft); }

    /* ---------- Alert ---------- */
    .alert {
      display: flex;
      gap: 14px;
      align-items: flex-start;
      border-radius: var(--radius-sm);
      padding: 16px 18px;
      margin-bottom: 24px;
      border: 1px solid transparent;
    }
    .alert__icon {
      flex: 0 0 auto;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      margin-top: 1px;
      position: relative;
    }
    .alert__title { font-weight: 600; margin: 0 0 4px; font-size: 15px; }
    .alert__text { margin: 0; font-size: 14px; line-height: 1.45; }

    .alert.is-success { background: var(--success-bg); border-color: var(--success-border); }
    .alert.is-success .alert__title,
    .alert.is-success .alert__text { color: var(--success-ink); }
    .alert.is-success .alert__icon { background: var(--success-ink); }
    .alert.is-success .alert__icon::after {
      content: "";
      position: absolute;
      left: 7px; top: 6px;
      width: 6px; height: 10px;
      border-right: 2px solid #fff;
      border-bottom: 2px solid #fff;
      transform: rotate(45deg);
    }

    .alert.is-warning { background: var(--warning-bg); border-color: var(--warning-border); }
    .alert.is-warning .alert__title,
    .alert.is-warning .alert__text { color: var(--warning-ink); }
    .alert.is-warning .alert__icon { background: var(--orange); }
    .alert.is-warning .alert__icon::before {
      content: "!";
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: 700;
      font-size: 14px;
      line-height: 1;
    }

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
    @media (max-width: 640px) {
      .app { padding: 22px 16px; }
      .card { padding: 22px 18px; }

      .stepper__bullet { width: 32px; height: 32px; font-size: 14px; }
      .stepper__label { font-size: 11px; }
      .stepper__step { gap: 6px; }

      .result { flex-direction: row; align-items: center; }
      .result__value { font-size: 18px; }
      .result__desc { display: none; }

      .actions { gap: 10px; }
      .btn { padding: 12px 16px; font-size: 14px; flex: 1; text-align: center; }
      .actions--end { justify-content: stretch; }
    }
    @media (max-width: 340px) {
      .stepper__label { display: none; }
    }
  `;

  /* ----------------------------------------------------------
     Markup
     ---------------------------------------------------------- */
  var TEMPLATE = `
    <div class="app" part="app">
      <nav class="stepper" aria-label="Progression">
        <div class="stepper__track">
          <div class="stepper__progress" data-ref="progress" style="width: 0%"></div>
        </div>
        <ol class="stepper__steps">
          <li class="stepper__step is-active" data-step="1">
            <span class="stepper__bullet">1</span>
            <span class="stepper__label">Géométrie outil</span>
          </li>
          <li class="stepper__step" data-step="2">
            <span class="stepper__bullet">2</span>
            <span class="stepper__label">Conditions usinage</span>
          </li>
          <li class="stepper__step" data-step="3">
            <span class="stepper__bullet">3</span>
            <span class="stepper__label">Résultats</span>
          </li>
        </ol>
      </nav>

      <section class="card">
        <div data-ref="form">

          <!-- Slide 1 -->
          <div class="slide is-active" data-slide="1">
            <h2 class="card__title">Géométrie de l'outil</h2>
            <p class="card__desc">Définissez les spécifications de l'outil de coupe et le matériau à usiner</p>

            <div class="field" data-field="diametre">
              <label class="field__label" for="abq-diametre">Diamètre Ø (mm)</label>
              <input class="field__input" type="number" id="abq-diametre" data-name="diametre" inputmode="decimal" step="any" min="0" value="120" />
              <p class="field__hint">Le diamètre de l'outil de coupe en millimètres</p>
              <p class="field__error"></p>
            </div>

            <div class="field" data-field="nombre_coupe">
              <label class="field__label" for="abq-nombre_coupe">Nombre de dents Z</label>
              <input class="field__input" type="number" id="abq-nombre_coupe" data-name="nombre_coupe" inputmode="numeric" step="1" min="1" value="2" />
              <p class="field__hint">Le nombre d'arêtes de coupe sur l'outil</p>
              <p class="field__error"></p>
            </div>

            <div class="field" data-field="angle_coupe">
              <label class="field__label" for="abq-angle_coupe">Angle de coupe γ (°)</label>
              <input class="field__input" type="number" id="abq-angle_coupe" data-name="angle_coupe" inputmode="decimal" step="any" value="25" />
              <p class="field__hint">L'angle de coupe de l'outil en degrés</p>
              <p class="field__error"></p>
            </div>

            <div class="field" data-field="materiaux">
              <label class="field__label" for="abq-materiaux">Matériau</label>
              <select class="field__input field__select" id="abq-materiaux" data-name="materiaux"></select>
              <p class="field__hint">Choisissez le matériau à usiner</p>
            </div>

            <div class="actions actions--end">
              <button type="button" class="btn btn--primary" data-action="next">Suivant</button>
            </div>
          </div>

          <!-- Slide 2 -->
          <div class="slide" data-slide="2">
            <h2 class="card__title">Paramètres d'usinage</h2>
            <p class="card__desc">Définissez les conditions d'usinage pour votre opération de coupe</p>

            <div class="field" data-field="taux_humidite">
              <label class="field__label" for="abq-taux_humidite">Taux d'humidité (%)</label>
              <input class="field__input" type="number" id="abq-taux_humidite" data-name="taux_humidite" inputmode="decimal" step="any" min="0" value="12" />
              <p class="field__hint">Le taux d'humidité du matériau à usiner</p>
              <p class="field__error"></p>
            </div>

            <div class="field" data-field="frequence_rotation">
              <label class="field__label" for="abq-frequence_rotation">Vitesse de rotation N (tr/min)</label>
              <input class="field__input" type="number" id="abq-frequence_rotation" data-name="frequence_rotation" inputmode="numeric" step="any" min="0" value="6000" />
              <p class="field__hint">La vitesse de rotation de la broche en tours par minute</p>
              <p class="field__error"></p>
            </div>

            <div class="field" data-field="vitesse_avance">
              <label class="field__label" for="abq-vitesse_avance">Vitesse d'avance Vf (m/min)</label>
              <input class="field__input" type="number" id="abq-vitesse_avance" data-name="vitesse_avance" inputmode="decimal" step="any" min="0" value="12" />
              <p class="field__hint">La vitesse d'avance en mètres par minute</p>
              <p class="field__error"></p>
            </div>

            <div class="field" data-field="prise_passe">
              <label class="field__label" for="abq-prise_passe">Profondeur de passe ap (mm)</label>
              <input class="field__input" type="number" id="abq-prise_passe" data-name="prise_passe" inputmode="decimal" step="any" min="0" value="6" />
              <p class="field__hint">La profondeur de coupe par passe en millimètres</p>
              <p class="field__error"></p>
            </div>

            <div class="field" data-field="epaisseur_usinage">
              <label class="field__label" for="abq-epaisseur_usinage">Épaisseur usinée ae (mm)</label>
              <input class="field__input" type="number" id="abq-epaisseur_usinage" data-name="epaisseur_usinage" inputmode="decimal" step="any" min="0" value="50" />
              <p class="field__hint">L'épaisseur de la pièce à usiner</p>
              <p class="field__error"></p>
            </div>

            <div class="actions actions--split">
              <button type="button" class="btn btn--ghost" data-action="prev">Retour</button>
              <button type="button" class="btn btn--primary" data-action="next">Suivant</button>
            </div>
          </div>

          <!-- Slide 3 -->
          <div class="slide" data-slide="3">
            <h2 class="card__title">Résultats calculés</h2>
            <p class="card__desc">Consultez les paramètres d'usinage calculés en fonction de vos données</p>

            <div class="alert" data-ref="alert" role="status">
              <span class="alert__icon" aria-hidden="true"></span>
              <div class="alert__body">
                <p class="alert__title" data-ref="alertTitle"></p>
                <p class="alert__text" data-ref="alertText"></p>
              </div>
            </div>

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

            <div class="actions actions--split">
              <button type="button" class="btn btn--ghost" data-action="prev">Retour</button>
              <button type="button" class="btn btn--accent" data-action="reset">Nouveau calcul</button>
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
      this._currentStep = 1;
      this._refs = {
        progress:   this.shadowRoot.querySelector('[data-ref="progress"]'),
        alert:      this.shadowRoot.querySelector('[data-ref="alert"]'),
        alertTitle: this.shadowRoot.querySelector('[data-ref="alertTitle"]'),
        alertText:  this.shadowRoot.querySelector('[data-ref="alertText"]'),
        form:       this.shadowRoot.querySelector('[data-ref="form"]'),
        matSelect:  this.shadowRoot.querySelector('[data-name="materiaux"]')
      };
      this._slides = Array.prototype.slice.call(this.shadowRoot.querySelectorAll(".slide"));
      this._steps  = Array.prototype.slice.call(this.shadowRoot.querySelectorAll(".stepper__step"));

      this._buildMaterialSelect();
      this._resetState();
      this._writeStateToDom();
      this._bindEvents();
      this._goToStep(1);
    }

    /* ---------------- helpers ---------------- */
    _$(name) { return this.shadowRoot.querySelector('[data-name="' + name + '"]'); }
    _fieldWrap(name) { return this.shadowRoot.querySelector('[data-field="' + name + '"]'); }

    /* ---------------- state ---------------- */
    _resetState() {
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
    _fieldsForStep(step) {
      if (step === 1) return ["diametre", "nombre_coupe", "angle_coupe"];
      if (step === 2) return ["taux_humidite", "frequence_rotation", "vitesse_avance", "prise_passe", "epaisseur_usinage"];
      return [];
    }
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
    _validateStep(step) {
      var ok = true;
      var self = this;
      this._fieldsForStep(step).forEach(function (k) {
        var el = self._$(k);
        var raw = el.value.trim();
        var num = parseFloat(raw);

        if (raw === "" || isNaN(num)) {
          self._setError(k, "Veuillez saisir une valeur numérique.");
          ok = false; return;
        }
        if ((k === "diametre" || k === "frequence_rotation" || k === "nombre_coupe") && num <= 0) {
          self._setError(k, "La valeur doit être supérieure à 0.");
          ok = false; return;
        }
        if (num < 0) {
          self._setError(k, "La valeur ne peut pas être négative.");
          ok = false; return;
        }
        self._setError(k, "");
      });
      return ok;
    }

    /* ---------------- rendu résultats ---------------- */
    _fmt(n) { return isFinite(n) ? n.toFixed(2) : "–"; }
    _renderResults() {
      var r = compute(this._state);
      var self = this;
      ["cible", "emoy", "fz", "vc", "ondu", "puissance"].forEach(function (k) {
        var el = self.shadowRoot.querySelector('[data-result="' + k + '"]');
        if (el) el.textContent = self._fmt(r[k]);
      });

      var a = this._refs.alert;
      a.classList.remove("is-success", "is-warning");
      if (r.inRange) {
        a.classList.add("is-success");
        this._refs.alertTitle.textContent = "Dans la plage recommandée";
        this._refs.alertText.textContent = "L'épaisseur moyenne de copeau calculée (Emoy) est dans une marge de ±20% de la valeur cible pour ce matériau.";
      } else {
        a.classList.add("is-warning");
        this._refs.alertTitle.textContent = "Hors plage recommandée";
        this._refs.alertText.textContent = "L'épaisseur moyenne de copeau calculée (Emoy) s'écarte de plus de ±20% de la valeur cible pour ce matériau. Ajustez vos paramètres d'usinage.";
      }
    }

    /* ---------------- navigation ---------------- */
    _goToStep(step) {
      this._currentStep = step;
      this._slides.forEach(function (s) {
        s.classList.toggle("is-active", parseInt(s.dataset.slide, 10) === step);
      });
      this._steps.forEach(function (s) {
        var n = parseInt(s.dataset.step, 10);
        s.classList.toggle("is-active", n === step);
        s.classList.toggle("is-done", n < step);
      });
      this._refs.progress.style.width = (((step - 1) / (MAX_STEP - 1)) * 100) + "%";
      if (step === MAX_STEP) this._renderResults();
      this._scrollIntoViewIfNeeded();
    }
    _next() {
      if (!this._validateStep(this._currentStep)) return;
      var self = this;
      this._fieldsForStep(this._currentStep).forEach(function (k) { self._readField(k); });
      if (this._currentStep === 1) this._readField("materiaux");
      if (this._currentStep < MAX_STEP) this._goToStep(this._currentStep + 1);
    }
    _prev() {
      if (this._currentStep > 1) this._goToStep(this._currentStep - 1);
    }
    _reset() {
      var self = this;
      this._resetState();
      this._writeStateToDom();
      this._fieldsForStep(1).concat(this._fieldsForStep(2)).forEach(function (k) { self._setError(k, ""); });
      this._goToStep(1);
    }

    _scrollIntoViewIfNeeded() {
      // Si le haut du widget n'est plus visible, on le ramène en vue.
      var rect = this.getBoundingClientRect();
      if (rect.top < 0) {
        this.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    /* ---------------- événements ---------------- */
    _bindEvents() {
      var self = this;
      this._refs.form.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-action]");
        if (!btn) return;
        e.preventDefault();
        var a = btn.dataset.action;
        if (a === "next") self._next();
        else if (a === "prev") self._prev();
        else if (a === "reset") self._reset();
      });

      // Entrée clavier = Suivant (sans <form>, on intercepte sur les inputs)
      this._refs.form.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && e.target.matches("input")) {
          e.preventDefault();
          self._next();
        }
      });

      NUMERIC_FIELDS.forEach(function (k) {
        var el = self._$(k);
        if (!el) return;
        el.addEventListener("input", function () {
          if (self._fieldWrap(k).classList.contains("has-error")) self._setError(k, "");
          self._readField(k);
        });
      });
      this._refs.matSelect.addEventListener("change", function () { self._readField("materiaux"); });
    }
  }

  if (!customElements.get("diamonde-abaque")) {
    customElements.define("diamonde-abaque", DiamondeAbaque);
  }
})();
