/**
 * aiService.js
 * Service layer for executing AI completions with client-owned API tokens.
 * Supports Google Gemini, OpenAI, and Anthropic Claude.
 * Automatically falls back to high-fidelity simulated response generators if keys are not provided.
 */

// Simulated fallbacks for high-fidelity responses
const getMockResponse = (type, prompt, contextData = {}) => {
  const query = (prompt || '').toLowerCase();
  const hospital = contextData.hospitalName || 'the hospital';

  if (type === 'sop') {
    return `==========================================================================
📋 STANDARD OPERATING PROCEDURE (SOP) — AI GENERATED
==========================================================================
Title: ${contextData.title || 'Clinical Process Protocol'}
Department: ${contextData.department || 'Quality Control'}
NABH Reference: ${contextData.standard || 'General Quality Guidelines'}
Version: 1.0 (Draft)
Date of Issue: ${new Date().toISOString().slice(0, 10)}

1. Purpose
To establish a standardized workflow for ${contextData.title || 'the clinical procedure'} in accordance with the NABH 6th Edition requirements, ensuring complete patient safety and audit traceability.

2. Scope
This protocol applies to all clinical and administrative personnel working within the ${contextData.department || 'Quality Control'} department at ${hospital}.

3. Key Responsibilities
- Quality HOD: Monthly audit verification of logs and compliance score tracking.
- Department Head: Reviewing incident registers, assigning corrective action tasks (CAPA).
- Shift Supervisor: Real-time verification, enforcing double-signature check policies.

4. Step-by-Step Procedure
A. Initial Check: Staff must verify patient identity, clinical indication, and check credentials.
B. Verification: Perform the required safety check parameters prior to proceeding.
C. Double-Signature Check: Two qualified staff members must co-verify and co-sign the log sheets.
D. Activity Register Logging: Record date, time, personnel names, and status outcome in the department register.
E. Evacuation & Safety: Ensure emergency tools, PASS instructions, and muster routes are fully cleared.

5. Documentation Requirements
- Completed checklist register (retained for 3 years)
- Incident register (for non-conformity tracking)
- CAPA dashboard verification records

==========================================================================
⚠️ AI ADVISORY — REQUIRES AUTHORIZED HUMAN CLINICAL SIGN-OFF
==========================================================================`;
  }

  if (type === 'gap') {
    return `AI GAP ANALYSIS REPORT
------------------------------------
Document Analyzed: ${contextData.docName || 'Compliance_File.pdf'}
Standard Scanned: ${contextData.standardId || 'AAC.1.a'}
Scan Result: COMPLETED

[Analysis Summary]
The uploaded file was cross-checked against the NABH 6th Edition guidelines.

[Identified Gaps]
1. Lacks explicit 'Double-Signature Check' signatures in the execution section.
2. Missing specific reference to the quarterly review schedule.
3. No pre-linked checklist log sheets.

[Recommended Corrective Actions]
1. Revise the document to add a dedicated co-signature field for HAM verification.
2. Link this document directly to Standard ${contextData.standardId} in the compliance dashboard.
3. Generate corrective action tasks for the HOD to address verification signatures.`;
  }

  // General Copilot Chat Fallback
  if (query.includes('score') || query.includes('readiness') || query.includes('ready')) {
    return `Based on my current scan of ${hospital}'s compliance metrics, your overall readiness score is at ${contextData.readinessScore || 72}%. To achieve the target of 90%+ readiness:
1. Map evidence documents to the remaining ${contextData.missingEvidenceCount || 3} partially met standards.
2. Resolve outstanding CAPAs in the Pharmacy and ICU departments.
3. Complete scheduled internal audits before the next month's verification cutoff.`;
  }

  if (query.includes('capa') || query.includes('corrective')) {
    return `I detected ${contextData.openCapasCount || 2} open CAPA items. The priority action item involves the medication dispensing process in the Pharmacy department. Recommend assigning an action task to the HOD to log corrective actions and upload the verification logs.`;
  }

  if (query.includes('lic') || query.includes('statutory') || query.includes('expire')) {
    return `Audit alert: We have statutory compliance actions pending. Ensure that all license files are uploaded under the Compliance tab and check the next renewal dates for the Pharmacy Drug License and Pollution Board Bio-medical waste agreement.`;
  }

  return `I have processed your query regarding ${hospital}'s NABH readiness.
To automate this requirement, you can create a daily cron job that scans the incident registers and logs corrective action reminders automatically. Let me know if you would like me to draft the automation scripts or outline a specific chapter requirement!`;
};

/**
 * Call external AI service provider
 */
export async function callAIService({
  provider = 'mock',
  model = '',
  apiKey = '',
  systemPrompt = 'You are a hospital quality inspector.',
  prompt = '',
  type = 'chat',
  contextData = {}
}) {
  if (!apiKey || provider === 'mock') {
    // Return high-fidelity mockup if no API key is specified
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getMockResponse(type, prompt, contextData));
      }, 1000);
    });
  }

  const fullPrompt = `${systemPrompt}\n\nContext Data:\n${JSON.stringify(contextData)}\n\nQuery:\n${prompt}`;

  try {
    if (provider === 'google') {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-2.5-flash'}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }]
          })
        }
      );
      if (!response.ok) {
        throw new Error(`Google API returned status ${response.status}`);
      }
      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    }

    if (provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Context Details: ${JSON.stringify(contextData)}\n\n${prompt}` }
          ],
          temperature: 0.7
        })
      });
      if (!response.ok) {
        throw new Error(`OpenAI API returned status ${response.status}`);
      }
      const data = await response.json();
      return data.choices[0].message.content;
    }

    if (provider === 'anthropic') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: model || 'claude-3-5-haiku-20241022',
          max_tokens: 3000,
          system: systemPrompt,
          messages: [
            { role: 'user', content: `Context Details: ${JSON.stringify(contextData)}\n\n${prompt}` }
          ]
        })
      });
      if (!response.ok) {
        throw new Error(`Anthropic API returned status ${response.status}`);
      }
      const data = await response.json();
      return data.content[0].text;
    }

    // Default fallback
    return getMockResponse(type, prompt, contextData);

  } catch (error) {
    console.error('Error calling AI service API:', error);
    return `⚠️ Error executing live AI query (${error.message}). Displaying local simulated response:\n\n${getMockResponse(type, prompt, contextData)}`;
  }
}
