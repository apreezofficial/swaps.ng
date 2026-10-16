import { api } from './api';

const b64e = (buf) =>
  btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64d = (s) =>
  Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4)), (c) => c.charCodeAt(0));

export const passkeysSupported = () => typeof window !== 'undefined' && !!window.PublicKeyCredential;

function friendly(err) {
  if (err?.name === 'NotAllowedError') return new Error('Passkey request was cancelled or timed out.');
  if (err?.name === 'InvalidStateError') return new Error('This device already has a passkey for your account.');
  return err;
}

export async function registerPasskey(name) {
  try {
    const { challengeId, publicKey } = await api('/auth/passkey/register/options', { method: 'POST', body: {} });
    publicKey.challenge = b64d(publicKey.challenge);
    publicKey.user.id = b64d(publicKey.user.id);
    publicKey.excludeCredentials = (publicKey.excludeCredentials || []).map((c) => ({ ...c, id: b64d(c.id) }));
    const cred = await navigator.credentials.create({ publicKey });
    await api('/auth/passkey/register/verify', {
      method: 'POST',
      body: {
        challengeId,
        name,
        credential: {
          id: cred.id,
          response: {
            clientDataJSON: b64e(cred.response.clientDataJSON),
            attestationObject: b64e(cred.response.attestationObject),
          },
        },
      },
    });
  } catch (e) {
    throw friendly(e);
  }
}

export async function loginWithPasskey() {
  try {
    const { challengeId, publicKey } = await api('/auth/passkey/login/options', { method: 'POST', body: {} });
    publicKey.challenge = b64d(publicKey.challenge);
    const cred = await navigator.credentials.get({ publicKey });
    await api('/auth/passkey/login/verify', {
      method: 'POST',
      body: {
        challengeId,
        credential: {
          id: cred.id,
          response: {
            clientDataJSON: b64e(cred.response.clientDataJSON),
            authenticatorData: b64e(cred.response.authenticatorData),
            signature: b64e(cred.response.signature),
          },
        },
      },
    });
  } catch (e) {
    throw friendly(e);
  }
}
