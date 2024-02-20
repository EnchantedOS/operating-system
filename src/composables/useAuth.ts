import { HocuspocusProvider } from "@hocuspocus/provider";

// not used right now, maybe later for better security
export const useAuth = () => {
  async function decryptJWToken(
    encryptedToken: string,
    privateKeyStr: string,
  ): Promise<string> {
    const privateKey = await window.crypto.subtle.importKey(
      "pkcs8",
      base64ToArrayBuffer(privateKeyStr),
      { name: "RSA-OAEP", hash: "SHA-1" },
      false,
      ["decrypt"],
    );

    const decrypted = await window.crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      privateKey,
      base64ToArrayBuffer(encryptedToken),
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }

  function arrayBufferToBase64(buffer: ArrayBuffer): string {
    var binary = "";
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  function _arrayBufferToBase64(buffer: ArrayBuffer) {
    const byteArray = new Uint8Array(buffer);
    let byteString = "";
    for (let i = 0; i < byteArray.byteLength; i++) {
      byteString += String.fromCharCode(byteArray[i]);
    }
    return window.btoa(byteString);
  }

  async function publicKeyToGUID(publicKey: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(publicKey);

    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  async function generateKeyPair() {
    try {
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]), // equivalent to 65537
          hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"],
      );

      const publicKey = await window.crypto.subtle.exportKey(
        "spki",
        keyPair.publicKey,
      );
      const privateKey = await window.crypto.subtle.exportKey(
        "pkcs8",
        keyPair.privateKey,
      );

      return {
        private_key: _arrayBufferToBase64(privateKey),
        public_key: _arrayBufferToBase64(publicKey),
      };
    } catch (error) {
      console.error("Failed to generate key pair:", error);
    }
  }

  async function requestToken(url: string, keyPair: any) {
    return new Promise((resolve) => {
      const loginProvider = new HocuspocusProvider({
        url: url,
        name: `enchanted.login`,
        token: "",
      });
      loginProvider.on("stateless", async (data: any) => {
        const jwt = await decryptJWToken(data.payload, keyPair.private_key);
        loginProvider.disconnect();
        loginProvider.destroy();
        resolve(jwt);
      });
      loginProvider.sendStateless(keyPair.public_key);
    });
  }

  return {
    decryptJWToken,
    arrayBufferToBase64,
    base64ToArrayBuffer,
    _arrayBufferToBase64,
    generateKeyPair,
    requestToken,
    publicKeyToGUID,
  };
};
