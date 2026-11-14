"use client";

import {
  REAL_ESTATE_OPTIONS,
  PROBATE_STAGE_OPTIONS,
  TIMELINE_OPTIONS,
  RELATIONSHIP_OPTIONS,
  type LeadDetails,
} from "@/lib/leadOptions";

interface Props {
  values: LeadDetails;
  onChange: (name: keyof LeadDetails, value: string) => void;
  /** Unique per form, so two forms on one page don't share radio buttons. */
  idPrefix: string;
  showRealEstate?: boolean;
  compact?: boolean;
}

/**
 * The optional questions shared by the lead forms: "Does the estate include
 * real estate?" plus four details tucked behind an "Add details" toggle so the
 * form stays short. Nothing here is required.
 */
export default function LeadDetailFields({ values, onChange, idPrefix, showRealEstate = true, compact = false }: Props) {
  const label = `block ${compact ? "text-xs" : "text-sm"} font-medium text-navy-800 mb-1`;
  const input =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-navy-500";
  const optional = <span className="text-gray-400 font-normal">(optional)</span>;

  const select = (name: keyof LeadDetails, text: string, options: readonly string[]) => (
    <div>
      <label htmlFor={`${idPrefix}-${name}`} className={label}>{text}</label>
      <select
        id={`${idPrefix}-${name}`}
        name={name}
        value={values[name]}
        onChange={(e) => onChange(name, e.target.value)}
        className={input}
      >
        <option value="">Choose…</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );

  return (
    <>
      {showRealEstate && (
        <fieldset>
          <legend className={`${compact ? "text-xs" : "text-sm"} font-medium text-navy-800 mb-2`}>
            Does the estate include real estate? {optional}
          </legend>
          <div className={`flex flex-wrap ${compact ? "gap-4" : "gap-5"}`}>
            {REAL_ESTATE_OPTIONS.map((opt) => (
              <label key={opt} className={`flex items-center gap-2 cursor-pointer ${compact ? "text-xs" : "text-sm"} text-gray-700`}>
                <input
                  type="radio"
                  name={`${idPrefix}-hasRealEstate`}
                  value={opt}
                  checked={values.hasRealEstate === opt}
                  // Clicking the selected answer again clears it, since the question is optional.
                  onClick={() => values.hasRealEstate === opt && onChange("hasRealEstate", "")}
                  onChange={() => onChange("hasRealEstate", opt)}
                  className="text-navy-700 focus:ring-navy-500"
                />
                {opt}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <details className="group">
        <summary className={`cursor-pointer ${compact ? "text-xs" : "text-sm"} font-medium text-navy-700 hover:text-navy-900 select-none`}>
          Add details {optional}
        </summary>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor={`${idPrefix}-propertyLocation`} className={label}>Property city or ZIP</label>
            <input
              id={`${idPrefix}-propertyLocation`}
              type="text"
              name="propertyLocation"
              value={values.propertyLocation}
              onChange={(e) => onChange("propertyLocation", e.target.value)}
              className={input}
              placeholder="e.g. Joliet or 60432"
              maxLength={120}
            />
          </div>
          {select("probateStage", "Stage of probate", PROBATE_STAGE_OPTIONS)}
          {select("timeline", "Your timeline", TIMELINE_OPTIONS)}
          {select("relationship", "Your relationship to the estate", RELATIONSHIP_OPTIONS)}
        </div>
      </details>
    </>
  );
}

/** Hidden field that people never see and bots fill in. Server drops anything that has it set. */
export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
      <label>
        Leave this field empty
        <input
          type="text"
          name="company_website"
          tabIndex={-1}
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    </div>
  );
}
