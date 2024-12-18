import { md, mgf, util, pki } from "node-forge";

// NOTE: Not used anymore in newest flow:
/*
export const hashDocument = async function (documentFile) {
  const fileBuffer = await documentFile.arrayBuffer();
  const mdDigest = md.sha256.create();
  mdDigest.update(util.binary.raw.encode(new Uint8Array(fileBuffer)));
  return mdDigest.digest().getBytes(); // Returns raw bytes of the hash
};
*/

export const signDocument = async function (privateKeyPem, documentFile) {
  // const fileBuffer = await documentFile.arrayBuffer();

  // // Create message digest and update with document
  // const mdDigest = md.sha256.create();
  // mdDigest.update(util.binary.raw.encode(new Uint8Array(fileBuffer)));

  const chunkSize = 64 * 1024; // 64KB chunks
  const fileSize = documentFile.size;
  const mdDigest = md.sha256.create();

  let offset = 0;
  while (offset < fileSize) {
    const chunk = await documentFile.slice(offset, offset + chunkSize).arrayBuffer();
    mdDigest.update(util.binary.raw.encode(new Uint8Array(chunk)));
    offset += chunkSize;
  }

  // Sign the digest directly
  const privateKey = pki.privateKeyFromPem(privateKeyPem);
  const signature = privateKey.sign(mdDigest);

  // Convert to base64 for transmission
  return util.encode64(signature);
};

// TODO: Must be converted to decrypt document (No use as of now)
// export const encryptDocument = async function (privateKey, documentFile) {
//   const fileBuffer = await documentFile.arrayBuffer();
//   console.log("File-Buffer: ", fileBuffer);

//   const encrypted = privateKey.encrypt(
//     util.binary.raw.encode(new Uint8Array(fileBuffer)),
//     "RSA-OAEP",
//     {
//       md: md.sha256.create(),
//       mgf1: mgf.mgf1.create(md.sha256.create()),
//     }
//   );
//   return encrypted;
// };
