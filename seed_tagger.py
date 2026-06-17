import json
import os
import re

# Define paths
ROOT_DIR = os.getcwd()
SEED_PATH = os.path.join(ROOT_DIR, "seed.json")

# JavaScript regex patterns converted to Python format
EVENT_TYPE_MATCHERS = {
    "Retraction": [
        re.compile(r"\bRetractions?\b", re.IGNORECASE),
        re.compile(r"\bnot\s+a\s+(?:GRB|GW|FRB|SN|SGR|neutrino)\b", re.IGNORECASE),
        re.compile(r"\bprobably\s+not\s+a\b", re.IGNORECASE),
        re.compile(r"\bis\s+not\b", re.IGNORECASE),
        re.compile(r"\bDisregard\b", re.IGNORECASE),
        re.compile(r"\bIgnore\b", re.IGNORECASE),
        re.compile(r"\bFalse Trigger\b", re.IGNORECASE),
        re.compile(r"\bNot real\b", re.IGNORECASE),
    ],
    "GRB": [
        re.compile(r"\bGRB\d{6}[A-Z]?\b", re.IGNORECASE),
        re.compile(r"\bGRBs?\b", re.IGNORECASE),
        re.compile(r"\bgamma[-\s]?ray[-\s]?bursts?\b", re.IGNORECASE),
        re.compile(r"\bXRF\d{6}[A-Z]?\b", re.IGNORECASE),
    ],
    "Gamma-ray Transient": [
        re.compile(r"\bFermi(?:\s?(?:GBM|LAT)|\d{9})?\b", re.IGNORECASE),
        re.compile(r"\bSwift(?![:?/-](?:XRT|UVOT))\b", re.IGNORECASE),
        re.compile(r"\bSwift[:?/-]BAT\b", re.IGNORECASE),
        re.compile(r"\bSVOM\(?!\/VT|\/C-GFT\)\b", re.IGNORECASE),
        re.compile(r"\bINTEGRAL\b", re.IGNORECASE),
        re.compile(r"\bRAC\b", re.IGNORECASE), # Safe fallback translation if HETE or similar patterns needed
        re.compile(r"\bHETE\b", re.IGNORECASE),
        re.compile(r"\bKONUS\b", re.IGNORECASE),
        re.compile(r"\bAstroSat\b", re.IGNORECASE),
    ],
    "GW": [
        re.compile(r"\bGW\d+\b", re.IGNORECASE),
        re.compile(r"\bGWs?\b", re.IGNORECASE),
        re.compile(r"\bgravitational[-\s]?waves?\b", re.IGNORECASE),
        re.compile(r"\bLIGO\b", re.IGNORECASE),
        re.compile(r"\bVirgo\b", re.IGNORECASE),
        re.compile(r"\bKAGRA\b", re.IGNORECASE),
        re.compile(r"\bS\d{6}[a-z]+\b", re.IGNORECASE),
        re.compile(r"\bGWTC-\d+\b", re.IGNORECASE),
    ],
    "SGR": [
        re.compile(r"\bSGR\S*", re.IGNORECASE), 
        re.compile(r"\bsoft[-\s]?gamma[-\s]?repeaters?\b", re.IGNORECASE)
    ],
    "FRB": [
        re.compile(r"\bFRB\s?\d{6,8}[A-Za-z]?\b", re.IGNORECASE),
        re.compile(r"\bFRBs?\b", re.IGNORECASE),
        re.compile(r"\bfast[-\s]?radio[-\s]?bursts?\b", re.IGNORECASE),
        re.compile(r"\bCHIME\b", re.IGNORECASE),
        re.compile(r"\bDSA-110\b", re.IGNORECASE),
    ],
    "SN": [
        re.compile(r"\bSN\d{4}[A-Za-z]*\b", re.IGNORECASE), 
        re.compile(r"\bSNe?\b", re.IGNORECASE), 
        re.compile(r"\bsuper[-\s]?novae?\b", re.IGNORECASE)
    ],
    "Neutrino": [
        re.compile(r"\bneutrinos?\b", re.IGNORECASE),
        re.compile(r"\bIceCube(?:-HAWC|-\d+)?\b", re.IGNORECASE),
        re.compile(r"\bANTARES\b", re.IGNORECASE),
        re.compile(r"\bKM3NeT\b", re.IGNORECASE),
        re.compile(r"\bSuper-Kamiokande\b", re.IGNORECASE),
        re.compile(r"\bSNEWS2\b", re.IGNORECASE),
    ],
    "X-ray Transient": [
        re.compile(r"(?<!\S)EP(?=\s|:|$)", re.IGNORECASE),
        re.compile(r"\bEPW?[-\s]?\d{6,8}[A-Z]{0,2}\b", re.IGNORECASE),
        re.compile(r"\bEP-WXT\b", re.IGNORECASE),
        re.compile(r"\bEP-FXT\b", re.IGNORECASE),
        re.compile(r"\bX[-\s]?ray(?:\s+transient)?\b", re.IGNORECASE),
        re.compile(r"\bEinstein\s+Probe\b", re.IGNORECASE),
        re.compile(r"\bMAXI\s?J\d{4}[+-]\d+", re.IGNORECASE),
        re.compile(r"\bXRT\b", re.IGNORECASE),
        re.compile(r"\bXRF\b", re.IGNORECASE),
        re.compile(r"\bChandra\b", re.IGNORECASE),
        re.compile(r"\bXMM\b", re.IGNORECASE),
        re.compile(r"\bNICER\b", re.IGNORECASE),
        re.compile(r"\bNuSTAR\b", re.IGNORECASE),
        re.compile(r"\bSwift[:?/-]XRT\b", re.IGNORECASE),
    ],
    "Afterglow": [
        re.compile(r"\bafterglows?\b", re.IGNORECASE), 
        re.compile(r"\bGW170817\b", re.IGNORECASE)
    ],
    "Optical Transient": [
        re.compile(r"\boptical\b(?!\s+upper\s+limits?\b)", re.IGNORECASE),
        re.compile(r"\bOT\b", re.IGNORECASE),
        re.compile(r"\bAT\d{4}[a-z]+\b", re.IGNORECASE),
        re.compile(r"\bHubble\b", re.IGNORECASE),
        re.compile(r"\bZTF(?:\d{2}[A-Za-z0-9]+)?\b", re.IGNORECASE),
        re.compile(r"\bMASTER\b", re.IGNORECASE),
        re.compile(r"\bPan-STARRS\b", re.IGNORECASE),
        re.compile(r"\bRubin\b", re.IGNORECASE),
        re.compile(r"\bSVOM\/VT\b", re.IGNORECASE),
        re.compile(r"\bSVOM\/C-GFT\b", re.IGNORECASE),
        re.compile(r"\bSwift[:?/-]UVOT\b", re.IGNORECASE),
    ],
    "Kilonova": [
        re.compile(r"\bkilonovae?\b(?!-\w)", re.IGNORECASE),
        re.compile(r"\bKN\b", re.IGNORECASE),
        re.compile(r"\bGW170817\b", re.IGNORECASE),
        re.compile(r"\bAT2017gfo\b", re.IGNORECASE),
    ],
    "Misc": [],
}

def parse_event_type_from_subject(subject: str) -> list:
    """Exact structural Python clone of the JavaScript matching routine."""
    # 1. If it matches a retraction pattern, early return only Retraction
    for pattern in EVENT_TYPE_MATCHERS["Retraction"]:
        if pattern.search(subject):
            return ["Retraction"]

    # 2. Filter remaining categories
    matches = []
    for event_type, patterns in EVENT_TYPE_MATCHERS.items():
        if event_type == "Retraction" or event_type == "Misc":
            continue
        
        # If any regex in the category yields a hit, add category to match pool
        if any(pattern.search(subject) for pattern in patterns):
            matches.append(event_type)

    # 3. Apply the special mutual exclusion rule: if GRB is caught, drop general Gamma-ray Transient
    if "GRB" in matches:
        matches = [m for m in matches if m != "Gamma-ray Transient"]

    # 4. Fallback to Misc if no conditions were met
    return matches if matches else ["Misc"]


def run():
    print("Reading seed.json...")
    if not os.path.exists(SEED_PATH):
        print(f"❌ Could not find seed.json at: {SEED_PATH}")
        return
        
    with open(SEED_PATH, "r", encoding="utf-8") as f:
        seed_data = json.load(f)

    circulars = seed_data.get("circulars", [])
    print(f"Processing {len(circulars)} circulars using strict matching rules...")

    stats = {}
    for circular in circulars:
        # Pass the subject string to the parsing engine
        subject_text = circular.get("subject", "")
        
        matched_tags = parse_event_type_from_subject(subject_text)
        circular["eventType"] = matched_tags

        # Keep a count of tags applied for summary logs
        for tag in matched_tags:
            stats[tag] = stats.get(tag, 0) + 1

    print("\nTagging distribution overview:")
    for tag, count in sorted(stats.items(), key=lambda x: x[1], reverse=True):
        print(f"  - {tag}: {count} circulars")

    print("\nSaving updates back to seed.json...")
    with open(SEED_PATH, "w", encoding="utf-8") as f:
        json.dump(seed_data, f, indent=2, ensure_ascii=False)
        
    print("✅ Done! Reset your database containers to complete the setup.")


if __name__ == "__main__":
    run()