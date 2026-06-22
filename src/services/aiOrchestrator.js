/**
 * aiOrchestrator.js
 * AI Orchestrator pipeline implementing secure audit logging, data minimization,
 * safety checks, tenant memory, and draft workflows.
 */

import { callAIService } from './aiService';

/**
 * Data Minimization - PII Scrubbing
 * Redacts Aadhaar numbers, PAN cards, Indian phone numbers, and potential patient identifiers.
 */
export function scrubPII(text) {
  if (typeof text !== 'string') return text;
  let scrubbed = text;
  
  // Aadhaar: 12 digits, optional spaces/hyphens (e.g. 1234-5678-9012)
  scrubbed = scrubbed.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[REDACTED_AADHAAR]');
  
  // PAN: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F)
  scrubbed = scrubbed.replace(/\b[A-Z]{5}\d{4}[A-Z]\b/ig, '[REDACTED_PAN]');
  
  // Indian Phone numbers: 10 digits starting with 6-9, with optional +91/91 prefix
  scrubbed = scrubbed.replace(/\b(?:\+91|91)[\s-]?([6-9]\d{9})\b/g, '[REDACTED_PHONE]');
  scrubbed = scrubbed.replace(/\b([6-9]\d{9})\b/g, '[REDACTED_PHONE]');
  
  return scrubbed;
}

/**
 * Safety Filters
 * Blocks diagnoses, treatments, fake audit log commands, or accreditation guarantees.
 */
export function checkSafetyFilters(promptText) {
  const text = (promptText || '').toLowerCase();
  
  const clinicalTriggers = [
    'prescribe', 'diagnose', 'treatment for', 'medication dose', 
    'clinical diagnosis', 'drug dosage', 'cure disease', 'clinical treatment',
    'medical diagnosis', 'patient therapy', 'patient treatment'
  ];
  
  const fabricationTriggers = [
    'fake audit', 'forge signature', 'fabricate compliance', 
    'bypass audit', 'falsify record', 'fabricate incident', 'falsify log'
  ];
  
  const guaranteeTriggers = [
    'guarantee nabh pass', 'guarantee accreditation', 
    '100% audit pass', 'pass guarantee', 'ensure accreditation'
  ];
  
  if (clinicalTriggers.some(t => text.includes(t))) {
    return {
      safe: false,
      issueType: 'Clinical Advice Blocked',
      reason: 'AI is restricted from providing clinical diagnoses, prescriptions, or treatment recommendations. Please consult a qualified practitioner.'
    };
  }
  
  if (fabricationTriggers.some(t => text.includes(t))) {
    return {
      safe: false,
      issueType: 'Fabrication Blocked',
      reason: 'AI is restricted from generating fabricated audits, forged quality compliance documentation, or falsified verification logs.'
    };
  }
  
  if (guaranteeTriggers.some(t => text.includes(t))) {
    return {
      safe: false,
      issueType: 'Guarantees Blocked',
      reason: 'AI is prohibited from guaranteeing regulatory approvals, accreditation success, or passing audits.'
    };
  }
  
  return { safe: true };
}

/**
 * Main Orchestration Pipeline Function
 */
export async function runAIOrchestration({
  module,
  agentType,
  prompt,
  chatHistory = [],
  contextData = {},
  // QualiNABHContext handles passed as parameters
  aiSettings,
  currentUser,
  hospitalName,
  aiMemory = [],
  getDecryptedKey,
  createAiOutput,
  logAiUsage,
  logAiSafety
}) {
  // 1. Check if AI settings are enabled
  if (!aiSettings || !aiSettings.enabled) {
    return {
      success: false,
      error: 'AI feature layer is currently disabled. Please configure a valid API key in Admin Settings.'
    };
  }

  // 2. Validate Tenant Isolation Context
  if (!currentUser || !hospitalName) {
    return {
      success: false,
      error: 'Access denied: Missing valid multi-tenant identity headers.'
    };
  }

  // 3. Check Safety Filters
  const safetyCheck = checkSafetyFilters(prompt);
  if (!safetyCheck.safe) {
    // Log safety breach in context
    if (logAiSafety) {
      logAiSafety(module, agentType, safetyCheck.issueType, safetyCheck.reason, true);
    }
    return {
      success: false,
      isBlocked: true,
      error: `Safety Guardrail Blocked: ${safetyCheck.reason}`
    };
  }

  // 4. Data Minimization (PII Scrubbing)
  const scrubbedPrompt = scrubPII(prompt);
  const scrubbedChatHistory = (chatHistory || []).map(msg => ({
    ...msg,
    text: scrubPII(msg.text)
  }));
  const scrubbedContext = {};
  for (const [key, val] of Object.entries(contextData || {})) {
    if (typeof val === 'string') {
      scrubbedContext[key] = scrubPII(val);
    } else {
      scrubbedContext[key] = val;
    }
  }

  // 5. Memory Integration (Tenant Isolated)
  const relatedMemories = (aiMemory || []).filter(mem => {
    // Match current hospital partition
    if (mem.hospitalId !== hospitalName) return false;
    // Match role-based access if specified
    if (mem.allowedRoles && mem.allowedRoles.length > 0) {
      const userRole = currentUser.role || 'employee';
      if (!mem.allowedRoles.includes(userRole)) return false;
    }
    // Match context scope
    return mem.scope === 'global' || mem.scope === module;
  });

  let memoryContext = '';
  if (relatedMemories.length > 0) {
    memoryContext = '\n\n=== RECALLING LOCAL MEMORY CONTEXT ===\n' +
      relatedMemories.map(m => `[Memory ID: ${m.memoryId}] [Title: ${m.title}] ${m.content}`).join('\n') +
      '\n======================================\n';
  }

  // Combine scrubbed prompt with memory recall context
  const finalizedPrompt = scrubbedPrompt + memoryContext;

  // 6. Fetch Secure Decrypted API Key
  const decryptedKey = getDecryptedKey ? getDecryptedKey(aiSettings.provider) : '';
  if (!decryptedKey && aiSettings.provider !== 'mock') {
    return {
      success: false,
      error: `Configured API key for provider '${aiSettings.provider}' is missing or corrupted. Re-enter key in Admin console.`
    };
  }

  // 7. Invoke Service Adapter
  const systemPrompt = aiSettings.systemPrompt || 'You are an assistive AI officer for hospital quality control and compliance.';
  
  const responseData = await callAIService({
    provider: aiSettings.provider,
    model: aiSettings.model,
    apiKey: decryptedKey,
    systemPrompt,
    prompt: finalizedPrompt,
    type: module === 'quality' && agentType === 'CAPA' ? 'gap' : (module === 'documents' ? 'sop' : 'chat'),
    chatHistory: scrubbedChatHistory,
    contextData: scrubbedContext,
    options: {
      temperature: aiSettings.temperature || 0.7,
      maxTokens: aiSettings.maxTokens || 2048
    },
    customUrl: aiSettings.customUrl || '',
    returnFullResponse: true
  });

  // 8. Log Usage (Token Metrics & Estimation)
  if (logAiUsage && responseData.usage) {
    logAiUsage(
      aiSettings.provider,
      responseData.model || aiSettings.model,
      module,
      agentType,
      responseData.usage.promptTokens,
      responseData.usage.completionTokens
    );
  }

  // 9. Human-in-the-loop: Write Draft to ai_outputs
  let draftOutputObj = null;
  if (createAiOutput) {
    draftOutputObj = createAiOutput(
      module,
      agentType,
      responseData.text,
      contextData.sourceRecordIds || [],
      {
        confidence: responseData.error ? 'low' : (prompt.length > 1000 ? 'medium' : 'high'),
        provider: aiSettings.provider,
        model: responseData.model || aiSettings.model,
        hasError: !!responseData.error
      }
    );
  }

  return {
    success: true,
    text: responseData.text,
    draft: draftOutputObj,
    error: responseData.error || null
  };
}
