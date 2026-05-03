// Vision-capable model prefixes (works for direct providers AND OpenRouter model IDs)
const VISION_MODEL_PATTERNS = [
  'gpt-4o', 'gpt-4-vision', 'gpt-4.1', 'gpt-5',
  'claude-3', 'claude-sonnet', 'claude-opus', 'claude-haiku',
  'gemini',
  // OpenRouter prefixed versions
  'openai/gpt-4o', 'openai/gpt-4.1', 'openai/gpt-5',
  'anthropic/claude-3', 'anthropic/claude-sonnet', 'anthropic/claude-opus',
  'google/gemini',
];

function modelSupportsVision(provider, model) {
  // These direct providers always support vision with their models
  if (provider === 'openai' || provider === 'anthropic') return true;
  if (provider === 'gemini') return true;
  // For OpenRouter and others: check model name
  const m = (model || '').toLowerCase();
  return VISION_MODEL_PATTERNS.some(p => m.startsWith(p.toLowerCase()) || m.includes(p.toLowerCase()));
}

/**
 * Sanitize messages before sending to API:
 * - For vision-capable models: keep image only in the LAST message that has one
 * - For non-vision models: strip ALL images, replace with text placeholder
 */
function sanitizeMessages(messages, provider, model) {
  const supportsVision = modelSupportsVision(provider, model);

  // Find index of the last message with an image
  let lastImageIdx = -1;
  if (supportsVision) {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].image) { lastImageIdx = i; break; }
    }
  }

  return messages.map((msg, idx) => {
    if (!msg.image) return msg;
    if (supportsVision && idx === lastImageIdx) return msg; // keep only the latest image
    // Strip older/unsupported images — replace with a note
    return { ...msg, image: undefined, content: msg.content + ' [screenshot previously analyzed]' };
  });
}

export const callLLM = async (provider, rawKey, model, messages) => {
  // Always trim to prevent whitespace-induced 401 errors
  const apiKey = (rawKey || '').trim();
  if (!apiKey) {
    throw new Error('API Key is missing. Please go to Settings and enter your API key.');
  }

  // Strip images from history to prevent payload overflow
  // Pass model so vision support is checked by model name (important for OpenRouter)
  const cleanMessages = sanitizeMessages(messages, provider, model);

  let url = '';
  let headers = { 'Content-Type': 'application/json' };
  let body = {};

  // ── OpenAI ────────────────────────────────────────────────────────────
  if (provider === 'openai') {
    url = 'https://api.openai.com/v1/chat/completions';
    headers['Authorization'] = `Bearer ${apiKey}`;

    const formattedMessages = cleanMessages.map(msg => {
      if (msg.image) {
        return {
          role: msg.role,
          content: [
            { type: 'text', text: msg.content },
            { type: 'image_url', image_url: { url: msg.image } }
          ]
        };
      }
      return { role: msg.role, content: msg.content };
    });

    body = { model: model || 'gpt-4o', messages: formattedMessages };

  // ── Google Gemini ──────────────────────────────────────────────────────
  } else if (provider === 'gemini') {
    url = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-2.0-flash'}:generateContent`;
    headers['x-goog-api-key'] = apiKey;

    let systemText = '';
    const nonSystemMsgs = [];
    cleanMessages.forEach(msg => {
      if (msg.role === 'system') { systemText += msg.content + '\n'; }
      else { nonSystemMsgs.push(msg); }
    });

    const contents = [];
    nonSystemMsgs.forEach(msg => {
      const geminiRole = msg.role === 'assistant' ? 'model' : 'user';
      const parts = [{ text: msg.content }];
      if (msg.image) {
        const base64Data = msg.image.split(',')[1];
        parts.push({ inlineData: { data: base64Data, mimeType: 'image/png' } });
      }
      if (contents.length > 0 && contents[contents.length - 1].role === geminiRole) {
        contents[contents.length - 1].parts.push(...parts);
      } else {
        contents.push({ role: geminiRole, parts });
      }
    });

    if (contents.length > 0 && contents[0].role !== 'user') {
      contents.unshift({ role: 'user', parts: [{ text: '.' }] });
    }

    body = {
      contents,
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
      ]
    };
    if (systemText.trim()) {
      body.systemInstruction = { parts: [{ text: systemText.trim() }] };
    }

  // ── Anthropic Claude ───────────────────────────────────────────────────
  } else if (provider === 'anthropic') {
    url = 'https://api.anthropic.com/v1/messages';
    headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = '2023-06-01';

    let systemPrompt = '';
    const anthropicMessages = [];
    cleanMessages.forEach(msg => {
      if (msg.role === 'system') {
        systemPrompt += msg.content + '\n';
      } else {
        if (msg.image) {
          const base64Data = msg.image.split(',')[1];
          anthropicMessages.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: [
              { type: 'image', source: { type: 'base64', media_type: 'image/png', data: base64Data } },
              { type: 'text', text: msg.content }
            ]
          });
        } else {
          anthropicMessages.push({ role: msg.role === 'user' ? 'user' : 'assistant', content: msg.content });
        }
      }
    });

    body = { model: model || 'claude-opus-4-7', max_tokens: 4096, messages: anthropicMessages };
    if (systemPrompt) { body.system = systemPrompt; }

  // ── OpenRouter ─────────────────────────────────────────────────────────
  } else if (provider === 'openrouter') {
    url = 'https://openrouter.ai/api/v1/chat/completions';
    headers['Authorization'] = `Bearer ${apiKey}`;
    headers['HTTP-Referer'] = 'https://ezclaw.app';
    headers['X-Title'] = 'EZClaw';

    const formattedMessages = cleanMessages.map(msg => {
      if (msg.image) {
        return {
          role: msg.role,
          content: [
            { type: 'text', text: msg.content },
            { type: 'image_url', image_url: { url: msg.image } }
          ]
        };
      }
      return { role: msg.role, content: msg.content };
    });

    body = { model: model || 'anthropic/claude-3-5-sonnet', messages: formattedMessages };

  // ── Meta Llama (via OpenRouter) ────────────────────────────────────────
  } else if (provider === 'meta') {
    url = 'https://openrouter.ai/api/v1/chat/completions';
    headers['Authorization'] = `Bearer ${apiKey}`;
    headers['HTTP-Referer'] = 'https://ezclaw.app';
    headers['X-Title'] = 'EZClaw';
    body = {
      model: model || 'meta-llama/llama-4-maverick',
      messages: cleanMessages.map(m => ({ role: m.role, content: m.content })),
    };

  // ── Together AI ────────────────────────────────────────────────────────
  } else if (provider === 'together') {
    url = 'https://api.together.xyz/v1/chat/completions';
    headers['Authorization'] = `Bearer ${apiKey}`;
    body = {
      model: model || 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
      messages: cleanMessages.map(m => ({ role: m.role, content: m.content })),
    };

  // ── Groq ───────────────────────────────────────────────────────────────
  } else if (provider === 'groq') {
    url = 'https://api.groq.com/openai/v1/chat/completions';
    headers['Authorization'] = `Bearer ${apiKey}`;
    body = {
      model: model || 'llama-3.3-70b-versatile',
      messages: cleanMessages.map(m => ({ role: m.role, content: m.content })),
    };

  // ── Fireworks AI ───────────────────────────────────────────────────────
  } else if (provider === 'fireworks') {
    url = 'https://api.fireworks.ai/inference/v1/chat/completions';
    headers['Authorization'] = `Bearer ${apiKey}`;
    body = {
      model: model || 'accounts/fireworks/models/llama-v3p3-70b-instruct',
      messages: cleanMessages.map(m => ({ role: m.role, content: m.content })),
    };

  // ── DeepInfra ──────────────────────────────────────────────────────────
  } else if (provider === 'deepinfra') {
    url = 'https://api.deepinfra.com/v1/openai/chat/completions';
    headers['Authorization'] = `Bearer ${apiKey}`;
    body = {
      model: model || 'meta-llama/Llama-3.3-70B-Instruct',
      messages: cleanMessages.map(m => ({ role: m.role, content: m.content })),
    };

  // ── Grok / DeepSeek ────────────────────────────────────────────────────
  } else {
    url = provider === 'grok'
      ? 'https://api.x.ai/v1/chat/completions'
      : 'https://api.deepseek.com/chat/completions';
    headers['Authorization'] = `Bearer ${apiKey}`;
    body = {
      model: model || (provider === 'grok' ? 'grok-4.3' : 'deepseek-chat'),
      messages: cleanMessages.map(m => ({ role: m.role, content: m.content })),
    };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[EZClaw] API Error | provider=${provider} | status=${response.status} | body=${errorText}`);
      if (response.status === 401) {
        throw new Error(`Authentication failed (401) — kiểm tra lại API key cho ${provider.toUpperCase()} trong Settings. Chi tiết: ${errorText}`);
      }
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    if (['openai', 'openrouter', 'grok', 'deepseek', 'meta', 'together', 'groq', 'fireworks', 'deepinfra'].includes(provider)) {
      if (!data.choices || !data.choices[0]) throw new Error(`Unexpected API Response: ${JSON.stringify(data)}`);
      return data.choices[0].message.content;
    } else if (provider === 'gemini') {
      if (!data.candidates || !data.candidates[0]) throw new Error(`Gemini Error/Blocked: ${JSON.stringify(data)}`);
      return data.candidates[0].content.parts[0].text;
    } else if (provider === 'anthropic') {
      if (!data.content || !data.content[0]) throw new Error(`Anthropic Error: ${JSON.stringify(data)}`);
      return data.content[0].text;
    }
  } catch (err) {
    console.error('[EZClaw] LLM Call Error:', err);
    throw err;
  }
};
