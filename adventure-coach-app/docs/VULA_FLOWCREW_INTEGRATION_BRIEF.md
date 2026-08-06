# FlowCrew ↔ Vula Integration Brief

**Scope (per Richard, 2026-08-06):** intelligence processing + chat only.
Explicitly NOT in scope yet: WhatsApp channel migration, full tenant
onboarding of booking/payment data. Those are natural follow-ons but are
separate decisions with separate risk profiles (see Precondition below).

## Why

FlowCrew currently has its own, independent AI stack:
- `AIChatService.js` - direct OpenAI GPT-3.5-turbo calls, hardcoded API key,
  falls back to simulated responses if no key is set
- `SmartRecommendationEngine.js` - orchestrates weather + coach-matching +
  timing + equipment recommendations, own confidence scoring, own fallback
- `AICoachMatchingService` (referenced, not yet pulled/inspected)
- `WindIntelligenceService.js` - crowdsourced coach reports + ML confidence
  scoring (ImageProcessingService, AudioProcessingService, MLService,
  NetworkAnalysisService)

Vula already solves the "AI processing + chat" problem for three tenants
(awake-sa, digg-demo, off-the-hook) with OpenRouter/Gemini routing, a local
Ollama fallback, and - critically - the `confirm=true` verify-before-execute
pattern that FlowCrew's AI stack does not have. Rebuilding that in FlowCrew
independently duplicates infrastructure Richard already maintains.

## What changes, concretely

### 1. AIChatService.js
Replace the direct OpenAI fetch with a call to Vula's chat completion
endpoint, scoped to a `flowcrew` tenant ID. Keep the existing coaching-focused
system prompt (safety-first, considers weather/conditions/skill level) -
that's FlowCrew-specific context Vula's routing layer should receive as
input, not something Vula needs to know natively.

Keep the existing simulated-response fallback path for local dev without
Vula connectivity - don't remove FlowCrew's ability to run standalone.

### 2. SmartRecommendationEngine.js + AICoachMatchingService
These make consequential recommendations (which coach, which time slot,
which equipment). Wrap the final recommendation step behind Vula's
`confirm=true` gate rather than returning a recommendation directly to the
UI. This is the same pattern Vula already uses elsewhere - a recommendation
is proposed, not auto-applied, until confirmed.

### 3. WindIntelligenceService.js
Lower priority / separate decision. Its ML confidence-scoring path
(photo/audio-based condition estimation) is a different kind of "AI
processing" than chat/recommendation - it's closer to a specialized model
than a chat completion. Worth a separate conversation on whether this routes
through Vula's model layer or stays FlowCrew-native. Flagging, not deciding.

## Precondition - do not skip

Vula's July 2026 security audit found 51 of 101 tables lacking row-level
security, including OAuth credential tables storing plaintext tokens
(see VULA_SECURITY_AND_GAPS_BRIEF.md, Phase 1). This integration is scoped
to AI processing + chat specifically *because* it doesn't require FlowCrew's
booking/customer/payment data to land in Vula's Supabase instance - chat
messages and recommendation requests can be processed and returned without
persisting FlowCrew business data on Vula's side.

If scope later expands to full tenant onboarding (WhatsApp, shared data
tables), Phase 1 remediation from that brief needs to be confirmed complete
first. Do not expand scope past "processing" into "storage" until that's
verified, not just assumed done.

## What I don't have from this chat session

I don't have live access to Vula's actual API contract (endpoint names,
tenant auth scheme, request/response shapes for the chat completion and
confirm=true endpoints). This brief describes the shape of the integration;
Claude Code (working directly in both repos) needs to:

1. Pull Vula's actual API surface for tenant-scoped chat completions
2. Confirm how tenant auth/scoping works for a new tenant (API key? JWT?
   shared secret?) and how `flowcrew` gets provisioned as a tenant
3. Confirm the `confirm=true` gate's actual request/response contract before
   wiring SmartRecommendationEngine.js against it
4. Verify Phase 1 RLS remediation status directly against Vula's Supabase
   instance rather than trusting the brief's written status

## Suggested order of work

1. Provision `flowcrew` as a Vula tenant (Claude Code, working in the Vula
   repo)
2. Wire AIChatService.js to call it, keep the simulated fallback for offline
   dev
3. Validate end-to-end with a real chat exchange before touching
   SmartRecommendationEngine.js
4. Wrap SmartRecommendationEngine.js / AICoachMatchingService behind
   confirm=true once (3) is proven working
5. Revisit WindIntelligenceService and full tenant onboarding as separate,
   later decisions
