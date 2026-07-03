/**
 * aiService.js
 * Service layer for executing AI completions with client-configured API tokens.
 * Supports Google Gemini, OpenAI, Anthropic Claude, OpenRouter, Custom Adapter, and high-fidelity mock fallbacks.
 */

// Simulated fallbacks for high-fidelity responses
export const getMockResponse = (type, prompt, contextData = {}) => {
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

// 1. OpenAI Adapter
export async function openaiAdapter({ model, apiKey, systemPrompt, prompt, chatHistory, contextData, options = {} }) {
  const modelName = model || 'gpt-4o-mini';
  const messages = [{ role: 'system', content: systemPrompt }];

  (chatHistory || []).forEach(msg => {
    messages.push({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    });
  });

  let content = prompt;
  if (contextData && Object.keys(contextData).length > 0) {
    content = `[Context Data: ${JSON.stringify(contextData)}]\n\n${prompt}`;
  }
  messages.push({ role: 'user', content });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: modelName,
      messages,
      temperature: options.temperature !== undefined ? options.temperature : 0.7,
      max_tokens: options.maxTokens || 2048
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API returned status ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const text = data.choices[0].message.content;
  const promptTokens = data.usage?.prompt_tokens || 0;
  const completionTokens = data.usage?.completion_tokens || 0;

  return { text, usage: { promptTokens, completionTokens }, model: modelName };
}

// 2. Google Gemini Adapter
export async function geminiAdapter({ model, apiKey, systemPrompt, prompt, chatHistory, contextData, options = {} }) {
  const modelName = model || 'gemini-1.5-flash';
  const contents = [];

  let lastRole = null;
  (chatHistory || []).forEach(msg => {
    const role = msg.sender === 'user' ? 'user' : 'model';
    if (role !== lastRole) {
      contents.push({
        role: role,
        parts: [{ text: msg.text }]
      });
      lastRole = role;
    }
  });

  let textPrompt = prompt;
  if (contextData && Object.keys(contextData).length > 0) {
    textPrompt = `[Context Data: ${JSON.stringify(contextData)}]\n\n${prompt}`;
  }

  if (lastRole === 'user') {
    if (contents.length > 0) {
      contents[contents.length - 1].parts[0].text += `\n\n${textPrompt}`;
    } else {
      contents.push({ role: 'user', parts: [{ text: textPrompt }] });
    }
  } else {
    contents.push({ role: 'user', parts: [{ text: textPrompt }] });
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: contents,
        generationConfig: {
          temperature: options.temperature !== undefined ? options.temperature : 0.7,
          maxOutputTokens: options.maxTokens || 2048
        }
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API returned status ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;
  const promptTokens = data.usageMetadata?.promptTokenCount || 0;
  const completionTokens = data.usageMetadata?.candidatesTokenCount || 0;

  return { text, usage: { promptTokens, completionTokens }, model: modelName };
}

// 3. Anthropic Adapter
export async function anthropicAdapter({ model, apiKey, systemPrompt, prompt, chatHistory, contextData, options = {} }) {
  const modelName = model || 'claude-3-5-sonnet-20241022';
  const messages = [];

  (chatHistory || []).forEach(msg => {
    messages.push({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    });
  });

  let textPrompt = prompt;
  if (contextData && Object.keys(contextData).length > 0) {
    textPrompt = `[Context Data: ${JSON.stringify(contextData)}]\n\n${prompt}`;
  }
  messages.push({ role: 'user', content: textPrompt });

  // Clean consecutive roles and start with user
  const cleanMessages = [];
  messages.forEach((msg, idx) => {
    if (idx === 0 && msg.role === 'assistant') {
      cleanMessages.push({ role: 'user', content: 'Hello' });
    }
    if (cleanMessages.length > 0 && cleanMessages[cleanMessages.length - 1].role === msg.role) {
      cleanMessages[cleanMessages.length - 1].content += `\n\n${msg.content}`;
    } else {
      cleanMessages.push(msg);
    }
  });

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'dangerously-allow-browser': 'true'
    },
    body: JSON.stringify({
      model: modelName,
      max_tokens: options.maxTokens || 2048,
      system: systemPrompt,
      messages: cleanMessages,
      temperature: options.temperature !== undefined ? options.temperature : 0.7
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API returned status ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const text = data.content[0].text;
  const promptTokens = data.usage?.input_tokens || 0;
  const completionTokens = data.usage?.output_tokens || 0;

  return { text, usage: { promptTokens, completionTokens }, model: modelName };
}

// 4. OpenRouter Adapter
export async function openRouterAdapter({ model, apiKey, systemPrompt, prompt, chatHistory, contextData, options = {} }) {
  const modelName = model || 'google/gemini-2.5-flash';
  const messages = [{ role: 'system', content: systemPrompt }];

  (chatHistory || []).forEach(msg => {
    messages.push({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    });
  });

  let content = prompt;
  if (contextData && Object.keys(contextData).length > 0) {
    content = `[Context Data: ${JSON.stringify(contextData)}]\n\n${prompt}`;
  }
  messages.push({ role: 'user', content });

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://vaidyaq.com',
      'X-Title': 'VaidyaQ'
    },
    body: JSON.stringify({
      model: modelName,
      messages,
      temperature: options.temperature !== undefined ? options.temperature : 0.7,
      max_tokens: options.maxTokens || 2048
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API returned status ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const text = data.choices[0].message.content;
  const promptTokens = data.usage?.prompt_tokens || 0;
  const completionTokens = data.usage?.completion_tokens || 0;

  return { text, usage: { promptTokens, completionTokens }, model: modelName };
}

// 5. Custom URL Endpoint Adapter
export async function customAdapter({ model, apiKey, systemPrompt, prompt, chatHistory, contextData, options = {}, customUrl }) {
  const modelName = model || 'custom-model';
  const url = customUrl || 'http://localhost:11434/v1/chat/completions';
  
  const messages = [{ role: 'system', content: systemPrompt }];

  (chatHistory || []).forEach(msg => {
    messages.push({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    });
  });

  let content = prompt;
  if (contextData && Object.keys(contextData).length > 0) {
    content = `[Context Data: ${JSON.stringify(contextData)}]\n\n${prompt}`;
  }
  messages.push({ role: 'user', content });

  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: modelName,
      messages,
      temperature: options.temperature !== undefined ? options.temperature : 0.7,
      max_tokens: options.maxTokens || 2048
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Custom LLM endpoint returned status ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || data.response || JSON.stringify(data);
  const promptTokens = data.usage?.prompt_tokens || Math.round(content.length / 4);
  const completionTokens = data.usage?.completion_tokens || Math.round(text.length / 4);

  return { text, usage: { promptTokens, completionTokens }, model: modelName };
}

// 6. Mock Adapter
export async function mockAdapter({ type, prompt, contextData }) {
  const text = getMockResponse(type, prompt, contextData);
  const promptTokens = Math.round((prompt || '').length / 4) + 50;
  const completionTokens = Math.round(text.length / 4);
  return { text, usage: { promptTokens, completionTokens }, model: 'mock-agent-v1' };
}

/**
 * Main AI Gateway function
 */
export async function callAIService({
  provider = 'google',
  model = '',
  apiKey = '',
  systemPrompt = 'You are a hospital quality inspector.',
  prompt = '',
  type = 'chat',
  chatHistory = [],
  contextData = {},
  options = {},
  customUrl = '',
  returnFullResponse = false
}) {
  const normalizedProvider = (provider || 'google').toLowerCase();

  if (!apiKey) {
    throw new Error(`API key for provider '${provider}' is not configured. Please enter a valid API key in Admin Settings.`);
  }

  try {
    let result;
    switch (normalizedProvider) {
      case 'openai':
        result = await openaiAdapter({ model, apiKey, systemPrompt, prompt, chatHistory, contextData, options });
        break;
      case 'google':
      case 'gemini':
        result = await geminiAdapter({ model, apiKey, systemPrompt, prompt, chatHistory, contextData, options });
        break;
      case 'anthropic':
        result = await anthropicAdapter({ model, apiKey, systemPrompt, prompt, chatHistory, contextData, options });
        break;
      case 'openrouter':
        result = await openRouterAdapter({ model, apiKey, systemPrompt, prompt, chatHistory, contextData, options });
        break;
      case 'custom':
        result = await customAdapter({ model, apiKey, systemPrompt, prompt, chatHistory, contextData, options, customUrl });
        break;
      default:
        throw new Error(`Unsupported or disabled AI provider: ${provider}`);
    }
    return returnFullResponse ? result : result.text;
  } catch (error) {
    console.error(`AI API Gateway Exception (${provider}):`, error);
    const errorResult = {
      text: `⚠️ Connection Error with AI provider ${provider}: ${error.message}`,
      usage: { promptTokens: 0, completionTokens: 0 },
      model: model || 'error',
      error: error.message
    };
    return returnFullResponse ? errorResult : errorResult.text;
  }
}
