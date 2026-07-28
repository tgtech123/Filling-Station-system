"use client";
import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

// Module-level response cache — survives re-mounts within the same browser session
const _cache = {
  countries: null,
  states: {},   // keyed by country name
  cities: {},   // keyed by "country||state"
};

const defaultLabelCls =
  "block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1";

const defaultSelectCls = (hasError, isDisabled) =>
  [
    "w-full p-2.5 text-sm rounded-lg border-2 transition-colors appearance-none",
    hasError
      ? "border-red-400 dark:border-red-500"
      : "border-gray-300 dark:border-gray-600",
    isDisabled
      ? "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
      : "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500",
  ].join(" ");

/**
 * Cascading location selector: Country → State → City
 *
 * Props:
 *   country / state / city          – controlled values from parent
 *   onCountryChange / onStateChange / onCityChange – callbacks (string value)
 *     LocationSelector automatically fires onStateChange("") and onCityChange("")
 *     when the parent selection resets the cascade, so parent callbacks can be simple.
 *   showCountry / showState / showCity  – toggle visibility of each row (all default true)
 *   lockCountry                        – disable the country select (keeps it visible)
 *   defaultCountry                     – pre-fill country on mount if country prop is ""
 *   disabled                           – disable all selects (view-mode)
 *   errors                             – { country, state, city } error strings
 *   labels                             – { country, state, city } label overrides
 *   required                           – { country, state, city } boolean
 *   selectCls                          – override entire select className (string)
 *   labelCls                           – override label className (string)
 *   wrapperCls                         – className applied to each field wrapper div
 */
export default function LocationSelector({
  country = "",
  state = "",
  city = "",
  onCountryChange,
  onStateChange,
  onCityChange,
  showCountry = true,
  showState = true,
  showCity = true,
  lockCountry = false,
  defaultCountry = "",
  disabled = false,
  errors = {},
  labels = {},
  required = {},
  selectCls = null,
  labelCls = null,
  wrapperCls = "",
}) {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  const [fetchError, setFetchError] = useState({ countries: "", states: "", cities: "" });

  // A state is picked, the lookup has finished, and there is still nothing to
  // choose from — either the dataset has no cities for it or the request
  // failed. Either way the dropdown would be an empty required field.
  const noCityOptions =
    !!state && !loadingCities && cities.length === 0;

  const abortRefs = useRef({ countries: null, states: null, cities: null });
  const defaultCountryFired = useRef(false);

  const resolvedLabelCls = labelCls ?? defaultLabelCls;
  const resolvedSelectCls = (field, isDisabled) =>
    selectCls !== null
      ? selectCls
      : defaultSelectCls(!!errors[field], isDisabled);

  // ── 1. Fetch countries once ──────────────────────────────────────────────
  useEffect(() => {
    // Only fetch if the country dropdown will be shown, or if we need states for a default
    if (!showCountry && !defaultCountry && !country) return;

    if (_cache.countries) {
      setCountries(_cache.countries);
    } else {
      setLoadingCountries(true);
      setFetchError((p) => ({ ...p, countries: "" }));
      abortRefs.current.countries?.abort();
      const ctrl = new AbortController();
      abortRefs.current.countries = ctrl;

      fetch("/api/public/locations/countries", { signal: ctrl.signal })
        .then((r) => r.json())
        .then((json) => {
          const list = json.data || [];
          _cache.countries = list;
          setCountries(list);
        })
        .catch((e) => {
          if (e.name !== "AbortError")
            setFetchError((p) => ({ ...p, countries: "Could not load countries. Try again." }));
        })
        .finally(() => setLoadingCountries(false));

      return () => ctrl.abort();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 2. Fire defaultCountry on mount if country is empty ──────────────────
  useEffect(() => {
    if (!defaultCountryFired.current && defaultCountry && !country && onCountryChange) {
      defaultCountryFired.current = true;
      onCountryChange(defaultCountry);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 3. Fetch states whenever country changes ──────────────────────────────
  useEffect(() => {
    if (!country) {
      setStates([]);
      setCities([]);
      return;
    }

    if (_cache.states[country]) {
      setStates(_cache.states[country]);
      return;
    }

    setLoadingStates(true);
    setFetchError((p) => ({ ...p, states: "" }));
    setStates([]);

    abortRefs.current.states?.abort();
    const ctrl = new AbortController();
    abortRefs.current.states = ctrl;

    fetch(`/api/public/locations/states?country=${encodeURIComponent(country)}`, {
      signal: ctrl.signal,
    })
      .then((r) => r.json())
      .then((json) => {
        const list = json.data || [];
        _cache.states[country] = list;
        setStates(list);
      })
      .catch((e) => {
        if (e.name !== "AbortError")
          setFetchError((p) => ({ ...p, states: "Could not load states. Try again." }));
      })
      .finally(() => setLoadingStates(false));

    return () => ctrl.abort();
  }, [country]);

  // ── 4. Fetch cities whenever state changes ────────────────────────────────
  useEffect(() => {
    if (!country || !state) {
      setCities([]);
      return;
    }

    const cacheKey = `${country}||${state}`;
    if (_cache.cities[cacheKey]) {
      setCities(_cache.cities[cacheKey]);
      return;
    }

    setLoadingCities(true);
    setFetchError((p) => ({ ...p, cities: "" }));
    setCities([]);

    abortRefs.current.cities?.abort();
    const ctrl = new AbortController();
    abortRefs.current.cities = ctrl;

    fetch(
      `/api/public/locations/cities?country=${encodeURIComponent(country)}&state=${encodeURIComponent(state)}`,
      { signal: ctrl.signal }
    )
      .then((r) => r.json())
      .then((json) => {
        const list = json.data || [];
        _cache.cities[cacheKey] = list;
        setCities(list);
      })
      .catch((e) => {
        if (e.name !== "AbortError")
          setFetchError((p) => ({ ...p, cities: "Could not load cities. Try again." }));
      })
      .finally(() => setLoadingCities(false));

    return () => ctrl.abort();
  }, [country, state]);

  // ── Handlers (cascade reset flows up through callbacks) ───────────────────
  const handleCountryChange = (e) => {
    const val = e.target.value;
    onCountryChange?.(val);
    onStateChange?.("");
    onCityChange?.("");
  };

  const handleStateChange = (e) => {
    const val = e.target.value;
    onStateChange?.(val);
    onCityChange?.("");
  };

  const handleCityChange = (e) => {
    onCityChange?.(e.target.value);
  };

  // ── Render helpers ────────────────────────────────────────────────────────
  const FieldError = ({ msg }) =>
    msg ? (
      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
        <span>⚠</span> {msg}
      </p>
    ) : null;

  const LoadingDot = ({ loading }) =>
    loading ? (
      <Loader2
        size={13}
        className="absolute right-8 top-1/2 -translate-y-1/2 animate-spin text-blue-400 pointer-events-none"
      />
    ) : null;

  return (
    <>
      {/* Country */}
      {showCountry && (
        <div className={wrapperCls}>
          <label className={resolvedLabelCls}>
            {labels.country ?? "Country"}
            {required.country && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          <div className="relative">
            <select
              value={country}
              onChange={handleCountryChange}
              disabled={disabled || lockCountry || loadingCountries}
              className={resolvedSelectCls("country", disabled || lockCountry || loadingCountries)}
            >
              <option value="">
                {loadingCountries ? "Loading countries…" : "Select Country"}
              </option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <LoadingDot loading={loadingCountries} />
          </div>
          <FieldError msg={fetchError.countries || errors.country} />
        </div>
      )}

      {/* State */}
      {showState && (
        <div className={wrapperCls}>
          <label className={resolvedLabelCls}>
            {labels.state ?? "State"}
            {required.state && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          <div className="relative">
            <select
              value={state}
              onChange={handleStateChange}
              disabled={disabled || !country || loadingStates}
              className={resolvedSelectCls("state", disabled || !country || loadingStates)}
            >
              <option value="">
                {loadingStates
                  ? "Loading states…"
                  : !country
                  ? "Select a country first"
                  : "Select State"}
              </option>
              {states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <LoadingDot loading={loadingStates} />
          </div>
          <FieldError msg={fetchError.states || errors.state} />
        </div>
      )}

      {/* City — falls back to free text when the dataset has no list for this
          state (and when the lookup failed outright), so a required field can
          never leave the user with nothing to pick. */}
      {showCity && (
        <div className={wrapperCls}>
          <label className={resolvedLabelCls}>
            {labels.city ?? "City"}
            {required.city && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          <div className="relative">
            {/*
              The city list comes from an external dataset that has gaps — some
              states return nothing at all. A required dropdown with no options
              is a dead end, so when there is no list to choose from we fall
              back to a plain text field and let the user type it.
            */}
            {noCityOptions ? (
              <input
                type="text"
                value={city}
                onChange={handleCityChange}
                disabled={disabled || !state}
                placeholder="Enter your city"
                className={resolvedSelectCls("city", disabled || !state)}
              />
            ) : (
              <select
                value={city}
                onChange={handleCityChange}
                disabled={disabled || !state || loadingCities}
                className={resolvedSelectCls("city", disabled || !state || loadingCities)}
              >
                <option value="">
                  {loadingCities
                    ? "Loading cities…"
                    : !state
                    ? "Select a state first"
                    : "Select City"}
                </option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}
            <LoadingDot loading={loadingCities} />
          </div>
          {noCityOptions && !errors.city && (
            <p className="mt-1 text-xs text-gray-500">
              No city list available for this state — please type it in.
            </p>
          )}
          <FieldError msg={errors.city} />
        </div>
      )}
    </>
  );
}
