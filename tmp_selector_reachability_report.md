# Selector Reachability + Story QA Regression

- Active situations scanned: 156
- Curated templates checked: T08, T16, T18, T21, T22, T23

## Check 1: Reachability (natural selector must pick the curated template)
PASS — every curated situation naturally selects its own template.

## Check 2: Story QA (natural path must actually lock)
FAIL — 6 situation(s) selected correctly but did not lock:
- SIT033 (T08): [{"ruleId":"QA-007","status":"FAIL","severity":"blocking","evidence":"Emotional arc moves from upset pressure toward lighter release.","responsibleModule":"8A"}]
- SIT034 (T08): [{"ruleId":"QA-007","status":"FAIL","severity":"blocking","evidence":"Emotional arc moves from upset pressure toward lighter release.","responsibleModule":"8A"}]
- SIT094 (T08): [{"ruleId":"QA-012","status":"FAIL","severity":"blocking","evidence":"No obvious prose corruption or doubled punctuation remains.","responsibleModule":"8E"}]
- SIT096 (T08): [{"ruleId":"QA-012","status":"FAIL","severity":"blocking","evidence":"No obvious prose corruption or doubled punctuation remains.","responsibleModule":"8E"}]
- SIT126 (T08): [{"ruleId":"QA-007","status":"FAIL","severity":"blocking","evidence":"Emotional arc moves from upset pressure toward lighter release.","responsibleModule":"8A"}]
- SIT131 (T08): [{"ruleId":"QA-007","status":"FAIL","severity":"blocking","evidence":"Emotional arc moves from upset pressure toward lighter release.","responsibleModule":"8A"},{"ruleId":"QA-012","status":"FAIL","severity":"blocking","evidence":"No obvious prose corruption or doubled punctuation remains.","responsibleModule":"8E"}]
